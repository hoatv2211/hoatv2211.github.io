#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { generate } = require("./generate-portfolio-data");

const ROOT = path.resolve(__dirname, "..");
const GENERATED = path.join(ROOT, "assets", "js", "portfolio-data.js");

function evaluate(source) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return JSON.parse(JSON.stringify(context.window.PORTFOLIO_DATA));
}

const current = evaluate(fs.readFileSync(GENERATED, "utf8"));
const regenerated = evaluate(generate());
assert.deepStrictEqual(regenerated, current, "generated runtime data changed semantically");
assert.strictEqual(current.length, 23, "runtime compatibility set must contain 23 active records");
assert.deepStrictEqual(
  current.map((project) => project.id),
  [
    "flyingphoenix", "muloren", "jx1", "dalgona", "shibainu", "idleCyber",
    "nekoverse", "sandwich", "archero", "bike", "MeowFlow", "proxyapi-mad",
    "share001-ludo", "share002-pixelshooter3d", "galaxiga", "HomeDesign", "tilecandy",
    "tilesmatch3", "sudoku", "ageofbattle", "surviver", "metameAmusementPark",
    "cryptoquest",
  ],
  "runtime project order changed"
);
assert.strictEqual(current.find((project) => project.id === "HomeDesign").detailCategory, "homeDesign");
assert.strictEqual(current.find((project) => project.id === "ageofbattle").demoUrl, "https://hoatv2211.github.io/Share003_AgeOfBattle/");
assert.strictEqual(
  current.find((project) => project.id === "flyingphoenix").detailUrl,
  "projects/flying-phoenix-chronicles/"
);
assert.strictEqual(current.find((project) => project.id === "flyingphoenix").featured, true);
assert.strictEqual(current.find((project) => project.id === "flyingphoenix").featuredOrder, 5);
assert.strictEqual(current.find((project) => project.id === "jx1").featured, false);
assert.strictEqual(current.find((project) => project.id === "jx1").featuredOrder, null);
for (const project of current.filter((candidate) => ["muloren", "jx1", "dalgona", "idleCyber", "nekoverse", "flyingphoenix"].includes(candidate.id))) {
  assert.match(project.detailUrl || "", /^projects\/[a-z0-9-]+\/$/, `${project.id} must expose its canonical detail route`);
}
console.log("Portfolio compatibility passed for 23 active records.");
