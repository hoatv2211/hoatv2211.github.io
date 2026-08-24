#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const providerPath = path.join(root, "assets", "js", "turnstile-provider.js");

assert.ok(fs.existsSync(providerPath), "shared Turnstile provider must exist");

const source = fs.readFileSync(providerPath, "utf8");
assert.match(source, /0x4AAAAAAEaAESgEirq4LgKq/, "provider must use the approved public sitekey");
assert.match(source, /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/, "provider must load the official explicit Turnstile API");
assert.doesNotMatch(source, /size:\s*["']invisible["']/, "Invisible mode comes from the widget sitekey; size=invisible is not a supported client option");
assert.match(source, /execution:\s*["']execute["']/, "provider must execute the challenge on demand");
assert.match(source, /window\.getTurnstileToken\s*=/, "provider must expose the shared async token function");

const elements = new Map();
let callbacks;
const calls = { execute: 0, render: 0, reset: 0 };
let activeExecutions = 0;
let maxActiveExecutions = 0;
const fakeTurnstile = {
  render(container, options) {
    calls.render += 1;
    callbacks = options;
    assert.equal(container.id, "portfolio-turnstile");
    assert.equal(options.sitekey, "0x4AAAAAAEaAESgEirq4LgKq");
    assert.equal(options.size, undefined);
    assert.equal(options.execution, "execute");
    return "portfolio-turnstile-widget";
  },
  reset(widgetId) {
    assert.equal(widgetId, "portfolio-turnstile-widget");
    calls.reset += 1;
  },
  execute(widgetId) {
    assert.equal(widgetId, "portfolio-turnstile-widget");
    calls.execute += 1;
    activeExecutions += 1;
    maxActiveExecutions = Math.max(maxActiveExecutions, activeExecutions);
    const token = `token-${calls.execute}`;
    setImmediate(() => {
      callbacks.callback(token);
      activeExecutions -= 1;
    });
  },
};

function makeElement(tagName) {
  return {
    tagName: tagName.toUpperCase(),
    id: "",
    src: "",
    async: false,
    defer: false,
    style: {},
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      if (name === "id") this.id = String(value);
    },
  };
}

const context = {
  window: {},
  document: {
    createElement: makeElement,
    getElementById(id) {
      return elements.get(id) || null;
    },
    head: {
      appendChild(element) {
        assert.equal(typeof element.onload, "function", "provider must attach the load handler before appending the API script");
        assert.equal(typeof element.onerror, "function", "provider must attach the error handler before appending the API script");
        if (element.id) elements.set(element.id, element);
        setImmediate(() => {
          context.window.turnstile = fakeTurnstile;
          if (typeof element.onload === "function") element.onload();
        });
        return element;
      },
    },
    body: {
      appendChild(element) {
        if (element.id) elements.set(element.id, element);
        return element;
      },
    },
    documentElement: {
      appendChild(element) {
        if (element.id) elements.set(element.id, element);
        return element;
      },
    },
  },
  Promise,
  Error,
  clearTimeout,
  setTimeout,
};
context.window.window = context.window;
context.window.document = context.document;
context.window.clearTimeout = clearTimeout;
context.window.setTimeout = setTimeout;

vm.createContext(context);
vm.runInContext(source.replace("var TOKEN_TIMEOUT_MS = 15000;", "var TOKEN_TIMEOUT_MS = 100;"), context, { filename: providerPath });

function assertScriptOrder(file, beforeNeedle, afterNeedle) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const before = html.indexOf(beforeNeedle);
  const after = html.indexOf(afterNeedle);
  assert.ok(before >= 0, `${file} must load ${beforeNeedle}`);
  assert.ok(after >= 0, `${file} must load ${afterNeedle}`);
  assert.ok(before < after, `${file} must load ${beforeNeedle} before ${afterNeedle}`);
}

(async () => {
  const firstRequest = context.window.getTurnstileToken();
  const secondRequest = context.window.getTurnstileToken();
  const [first, second] = await Promise.all([firstRequest, secondRequest]);
  assert.equal(first, "token-1");
  assert.equal(second, "token-2");
  assert.equal(calls.render, 1, "provider must reuse one rendered widget");
  assert.equal(calls.execute, 2, "provider must execute once per requested token");
  assert.equal(maxActiveExecutions, 1, "provider must serialize overlapping token requests");
  assert.ok(calls.reset >= 1, "provider must reset before widget reuse");

  assertScriptOrder("index.html", "assets/js/turnstile-provider.js?v=20260824-turnstile1", "assets/js/visit-telegram-hook.js?v=20260824-turnstile1");
  assertScriptOrder("index.html", "assets/js/turnstile-provider.js?v=20260824-turnstile1", "assets/js/portfolio-chatbot.js?v=20260824-turnstile1");
  for (const route of ["recruiter-clean", "dev-console", "game-studio"]) {
    assertScriptOrder(`backup/${route}/index.html`, "../../assets/js/turnstile-provider.js?v=20260824-turnstile1", "../../assets/js/portfolio-chatbot.js?v=20260824-turnstile1");
  }

  console.log("Turnstile provider contract passed for root and 3 backup routes.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
