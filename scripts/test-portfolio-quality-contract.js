#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");

const portfolio = JSON.parse(fs.readFileSync("portfolio.json", "utf8"));
const projects = new Map(portfolio.projects.map((project) => [project.detailKey, project]));

const cityBuilder = projects.get("citybuilder");
assert.strictEqual(cityBuilder.title, "City Builder");
assert.doesNotMatch(JSON.stringify(cityBuilder), /assets\/images\/game\/Archero\//i);
assert.doesNotMatch(JSON.stringify(cityBuilder), /Arrow Survival|lone archer|One-Finger Archery/i);

assert.strictEqual(projects.get("MeowFlow").title, "Meow Flow");
assert.strictEqual(projects.get("neighborhood").title, "Neighborhood Defense");

for (const project of portfolio.projects) {
  const media = project.detail?.media || [];
  const sources = media.map((item) => item.src).filter(Boolean);
  assert.strictEqual(new Set(sources).size, sources.length, `${project.detailKey} must not repeat media sources`);
  for (const evidence of project.detail?.evidence || []) {
    assert.ok(typeof evidence.label === "string" && evidence.label.trim(), `${project.detailKey} evidence needs a label`);
    assert.ok(typeof evidence.url === "string" && evidence.url.trim(), `${project.detailKey} evidence needs a URL`);
  }
}

const expectedPeriods = new Map([
  ["shibainu", "2024 — 2025"],
  ["archero", "2020 — 2021"],
  ["bike", "2021 — 2022"],
  ["MeowFlow", "2021 — 2022"],
  ["homeDesign", "2021 — 2022"],
  ["tilecandy", "2020 — 2021"],
  ["tilesmatch3", "2023 — 2024"],
  ["sudoku", "2024 — 2025"],
  ["surviver", "2021 — 2022"],
]);
for (const [detailKey, period] of expectedPeriods) {
  assert.strictEqual(projects.get(detailKey).period, period, `${detailKey} must restore its verified period`);
}

const expectedEvidence = new Map([
  ["shibainu", ["Demo", "Google Play"]],
  ["archero", ["Demo"]],
  ["bike", ["App Store"]],
  ["MeowFlow", ["Google Play"]],
  ["homeDesign", ["Demo", "Google Play", "Sensor Tower Android"]],
  ["tilecandy", ["Demo"]],
  ["tilesmatch3", ["Demo", "Google Play"]],
  ["sudoku", ["Demo", "Google Play"]],
  ["surviver", ["Demo"]],
  ["ageofbattle", ["Demo"]],
  ["galaxiga", ["Demo"]],
  ["share001-ludo", ["Demo"]],
  ["share002-pixelshooter3d", ["Demo"]],
  ["iceBreakingBattle", ["Google Play", "Sensor Tower Android"]],
  ["neighborhood", ["Demo"]],
]);
for (const [detailKey, labels] of expectedEvidence) {
  const actual = (projects.get(detailKey).detail.evidence || []).map((item) => item.label);
  for (const label of labels) assert.ok(actual.includes(label), `${detailKey} must include ${label} evidence`);
}

assert.strictEqual(projects.get("share001-ludo").detail.media.find((item) => item.type === "embed")?.poster, "assets/images/game/ludo.jpg");
assert.strictEqual(projects.get("share002-pixelshooter3d").detail.media.find((item) => item.type === "embed")?.poster, "assets/images/game/pixcelshooter.png");

console.log("Portfolio quality contract passed.");
