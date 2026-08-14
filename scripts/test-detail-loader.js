#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

function createHost() {
  const inserted = [];
  return {
    innerHTML: "",
    querySelector(selector) {
      const slug = selector.match(/data-detail-category="([^"]+)"/)?.[1];
      return inserted.find((item) => item.dataset.detailCategory === slug) || null;
    },
    insertAdjacentHTML(_position, html) {
      const slug = html.match(/data-detail-category="([^"]+)"/)?.[1];
      inserted.length = 0;
      inserted.push({ dataset: { detailCategory: slug }, html, classList: { add() {}, remove() {} } });
      this.innerHTML = html;
    },
  };
}

async function main() {
  const host = createHost();
  const requests = [];
  const events = [];
  const context = {
    window: {
      PORTFOLIO_DATA: [
        { detailCategory: "archero" },
        { detailCategory: "sudoku" },
      ],
    },
    document: {
      querySelector(selector) {
        return selector === '[data-render="portfolio-details"]' ? host : null;
      },
      dispatchEvent(event) { events.push(event); },
    },
    CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init.detail; },
    fetch: async (url) => {
      requests.push(url);
      return { ok: true, text: async () => `<section project-detail data-detail-category="${url.includes("archero") ? "archero" : "sudoku"}"></section>` };
    },
    console,
    Map,
    Set,
    Promise,
  };
  context.window.fetch = context.fetch;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("assets/js/portfolio-details.js", "utf8"), context);

  assert.strictEqual(requests.length, 0, "loader must make zero requests at startup");
  assert.strictEqual(typeof context.window.loadProjectDetail, "function");

  const first = await context.window.loadProjectDetail("archero");
  assert.strictEqual(requests.length, 1);
  assert.strictEqual(requests[0], "assets/portfolio-details/archero.html");
  assert.strictEqual(first.dataset.detailCategory, "archero");

  await context.window.loadProjectDetail("archero");
  assert.strictEqual(requests.length, 1, "cached detail must not fetch twice");

  const concurrent = await Promise.all([
    context.window.loadProjectDetail("sudoku"),
    context.window.loadProjectDetail("sudoku"),
  ]);
  assert.strictEqual(requests.length, 2, "concurrent detail opens must share one fetch");
  assert.strictEqual(concurrent[0].dataset.detailCategory, "sudoku");
  assert.ok(events.every((event) => event.type === "portfolio:details-loaded"));

  await assert.rejects(() => context.window.loadProjectDetail("../secret"), /Unknown portfolio detail/);
  assert.strictEqual(requests.length, 2, "unknown slug must not fetch");
  console.log("Detail loader tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
