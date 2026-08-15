#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

function createHost() {
  const inserted = [];
  const attributes = new Map();
  return {
    innerHTML: "",
    classList: { add() {}, remove() {} },
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
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

function fragment(detailKey) {
  return `<section project-detail data-detail-category="${detailKey}"></section>`;
}

async function main() {
  const host = createHost();
  const requests = [];
  const events = [];
  const detailProjects = [
    { detailKey: "archero", title: "Archero", status: "active", detail: { tier: "B", mode: "hybrid" } },
    { detailKey: "sudoku", title: "Sudoku", status: "active", detail: { tier: "B", mode: "hybrid" } },
    { detailKey: "citybuilder", title: "City Builder", status: "archived", detail: { tier: "C", mode: "archived" } },
  ];
  const delayed = new Map();
  const context = {
    window: {
      PORTFOLIO_DATA: [
        { detailCategory: "archero" },
        { detailCategory: "sudoku" },
      ],
      PORTFOLIO_DETAIL_INDEX: detailProjects.map(({ detailKey, status, detail }) => ({ detailKey, status, tier: detail.tier })),
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
      if (url === "assets/data/portfolio-details.json") {
        return { ok: true, json: async () => ({ projects: detailProjects }) };
      }
      const detailKey = url.match(/([^/]+)\.html$/)?.[1];
      if (delayed.has(detailKey)) return delayed.get(detailKey);
      return { ok: true, text: async () => fragment(detailKey) };
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
  assert.deepStrictEqual(requests, [
    "assets/portfolio-details/archero.html",
    "assets/data/portfolio-details.json",
  ]);
  assert.strictEqual(first.dataset.detailCategory, "archero");
  assert.strictEqual(events.at(-1).detail.project.title, "Archero");

  await context.window.loadProjectDetail("archero");
  assert.strictEqual(requests.length, 2, "cached fragment and detail payload must not fetch twice");

  await context.window.loadProjectDetail("citybuilder");
  assert.ok(requests.includes("assets/portfolio-details/citybuilder.html"), "archived detail must load through the real loader");
  assert.strictEqual(events.at(-1).detail.project.status, "archived");

  const beforeConcurrent = requests.length;
  const concurrent = await Promise.all([
    context.window.loadProjectDetail("sudoku"),
    context.window.loadProjectDetail("sudoku"),
  ]);
  assert.strictEqual(requests.length, beforeConcurrent + 1, "concurrent detail opens must share one fragment fetch");
  assert.strictEqual(concurrent[0].dataset.detailCategory, "sudoku");

  await assert.rejects(() => context.window.loadProjectDetail("../secret"), /Unknown portfolio detail/);
  assert.ok(!requests.some((url) => url.includes("secret")), "unknown detail must not fetch");
  assert.ok(events.every((event) => event.type === "portfolio:details-loaded"));
  console.log("Detail loader tests passed for active, archived, cached, and canonical data flows.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});