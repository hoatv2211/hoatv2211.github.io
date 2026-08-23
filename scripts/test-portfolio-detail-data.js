#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const CARD_DATA = path.join(ROOT, "assets", "js", "portfolio-data.js");
const DETAIL_INDEX = path.join(ROOT, "assets", "js", "portfolio-detail-index.js");
const DETAIL_PAYLOAD = path.join(ROOT, "assets", "data", "portfolio-details.json");

function evaluateWindowAssignment(filePath, property) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(filePath, "utf8"), context);
  return JSON.parse(JSON.stringify(context.window[property]));
}

const runtimeCards = evaluateWindowAssignment(CARD_DATA, "PORTFOLIO_DATA");
const detailIndex = evaluateWindowAssignment(DETAIL_INDEX, "PORTFOLIO_DETAIL_INDEX");
const detailPayload = JSON.parse(fs.readFileSync(DETAIL_PAYLOAD, "utf8"));

assert.strictEqual(runtimeCards.length, 23, "card runtime must contain 23 active records");
assert.strictEqual(detailIndex.length, 26, "detail index must contain all 26 records");
assert.ok(Array.isArray(detailPayload.projects), "detail payload must expose a projects array");
assert.strictEqual(detailPayload.projects.length, 26, "detail payload must contain all 26 records");

const indexedKeys = detailIndex.map((project) => project.detailKey);
assert.strictEqual(new Set(indexedKeys).size, 26, "detail index keys must be unique");
assert.deepStrictEqual(
  detailIndex
    .filter((project) => project.status === "archived")
    .map((project) => project.detailKey)
    .sort(),
  ["citybuilder", "iceBreakingBattle", "neighborhood"],
  "detail index must expose the three archived records"
);
assert.ok(
  !runtimeCards.some((project) => project.status === "archived"),
  "archived records must not appear in card runtime data"
);
assert.ok(
  runtimeCards.every((project) => !project.detail && !project.media && !project.caseStudy),
  "card runtime must not contain full detail payload fields"
);
assert.deepStrictEqual(
  detailPayload.projects.map((project) => project.detailKey).sort(),
  indexedKeys.slice().sort(),
  "detail index and payload keys must match"
);

const proxyDetail = detailPayload.projects.find((project) => project.detailKey === "proxyapi-mad");
assert.strictEqual(proxyDetail.detail.mode, "rendered", "ProxyAPI pilot must use rendered mode");
const proxyFragment = fs.readFileSync(path.join(ROOT, "assets", "portfolio-details", "proxyapi-mad.html"), "utf8");
assert.ok(!/<img\b/i.test(proxyFragment), "ProxyAPI fragment must not duplicate canonical dashboard images");
const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const cardScriptPosition = indexHtml.indexOf("assets/js/portfolio-data.js");
const detailIndexPosition = indexHtml.indexOf("assets/js/portfolio-detail-index.js");
const detailLoaderPosition = indexHtml.indexOf("assets/js/portfolio-details.js");
assert.ok(cardScriptPosition >= 0, "index must load portfolio card data");
assert.ok(detailIndexPosition > cardScriptPosition, "detail index must load after card data");
assert.ok(detailLoaderPosition > detailIndexPosition, "detail loader must load after detail index");
console.log("Portfolio detail data contract passed for 23 cards and 26 details.");
