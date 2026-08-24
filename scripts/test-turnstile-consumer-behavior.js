#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const useHead = process.argv.includes("--head");

function readSource(relativePath) {
  if (!useHead) return fs.readFileSync(path.join(root, relativePath), "utf8");
  return childProcess.execFileSync("git", ["show", `HEAD:${relativePath}`], {
    cwd: root,
    encoding: "utf8",
  });
}

function loadChatbot(provider) {
  const calls = [];
  const source = readSource("assets/js/portfolio-chatbot.js").replace(
    /\}\)\(\);\s*$/,
    "  window.__testCallWorker = callWorker;\n})();"
  );
  const context = {
    window: {
      location: { href: "https://hoatv2211.github.io/" },
      getTurnstileToken: provider,
    },
    document: {
      readyState: "loading",
      addEventListener() {},
    },
    fetch: async (url, options) => {
      calls.push({ url: String(url), body: JSON.parse(options.body) });
      return { ok: true, async json() { return { reply: "ok" }; } };
    },
    Promise,
    Error,
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "portfolio-chatbot.js" });
  return { callWorker: context.window.__testCallWorker, calls };
}

async function verifyChatbot() {
  const config = {
    endpoint: "https://worker.example/chat",
    telegramUrl: "https://t.me/o0_MaD_0o",
    maxMessages: 12,
  };

  for (const [label, provider] of [
    ["missing", undefined],
    ["rejected", () => Promise.reject(new Error("challenge failed"))],
    ["empty", () => Promise.resolve("   ")],
  ]) {
    const client = loadChatbot(provider);
    await assert.rejects(
      client.callWorker(config, "session", [{ role: "user", content: "hello" }]),
      undefined,
      `chatbot must reject a ${label} token`
    );
    assert.equal(client.calls.length, 0, `chatbot must not fetch with a ${label} token`);
  }

  const client = loadChatbot(() => Promise.resolve("chat-token"));
  const response = await client.callWorker(config, "session", [{ role: "user", content: "hello" }]);
  assert.equal(response.reply, "ok");
  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].url, config.endpoint);
  assert.equal(client.calls[0].body.turnstileToken, "chat-token");
}

async function runVisit(provider) {
  const calls = [];
  const writes = [];
  let scheduled;
  const context = {
    window: {
      location: {
        hostname: "hoatv2211.github.io",
        href: "https://hoatv2211.github.io/",
        search: "",
      },
      getTurnstileToken: provider,
      setTimeout(callback) {
        scheduled = callback;
        return 1;
      },
    },
    localStorage: {
      getItem() { return null; },
      setItem(key, value) { writes.push({ key, value }); },
    },
    fetch: async (url, options) => {
      calls.push({ url: String(url), body: JSON.parse(options.body) });
      return { ok: true };
    },
    Number,
    Date,
    Promise,
    Error,
  };
  vm.createContext(context);
  vm.runInContext(readSource("assets/js/visit-telegram-hook.js"), context, { filename: "visit-telegram-hook.js" });
  assert.equal(typeof scheduled, "function", "visit hook must schedule its request");
  scheduled();
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  return { calls, writes };
}

async function verifyVisit() {
  for (const [label, provider] of [
    ["missing", undefined],
    ["rejected", () => Promise.reject(new Error("challenge failed"))],
    ["empty", () => Promise.resolve("   ")],
  ]) {
    const result = await runVisit(provider);
    assert.equal(result.calls.length, 0, `visit hook must not fetch with a ${label} token`);
    assert.equal(result.writes.length, 0, `visit hook must not mark a ${label} token as sent`);
  }

  const result = await runVisit(() => Promise.resolve("visit-token"));
  assert.equal(result.calls.length, 1);
  assert.match(result.calls[0].url, /\/visit$/);
  assert.equal(result.calls[0].body.turnstileToken, "visit-token");
  assert.equal(result.writes.length, 1, "successful visit must start its cooldown");
}

(async () => {
  await verifyChatbot();
  await verifyVisit();
  console.log(`Turnstile consumer behavior contract passed${useHead ? " against HEAD" : ""}.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
