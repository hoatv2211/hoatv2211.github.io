#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");

const data = JSON.parse(fs.readFileSync("portfolio.json", "utf8"));
const byKey = new Map(data.projects.map((project) => [project.detailKey, project]));
const showcaseFamilies = new Set([
  "production-showcase",
  "flagship-worlds",
  "mobile-campaign",
  "gameplay-editorial",
  "product-console",
  "compact-proof",
]);

function project(key) {
  const value = byKey.get(key);
  assert.ok(value, `missing project ${key}`);
  return value;
}

const dalgona = project("dalgona");
assert.strictEqual(dalgona.role, "Tech Dev Leader");
assert.strictEqual(dalgona.teamSize, 15);
assert.ok(dalgona.detail.personalOutcome.some((item) => /technical delivery/i.test(item)));
assert.ok(dalgona.detail.productContext.includes("Reached Top 1 on the World App game ranking during the launch period."));
assert.ok(!JSON.stringify(dalgona).match(/hundreds of thousands|solo-developed/i));

const idleCyber = project("idleCyber");
assert.strictEqual(idleCyber.role, "Senior Unity Developer");
assert.strictEqual(idleCyber.teamSize, 10);
assert.ok(!JSON.stringify(idleCyber).match(/Technical Leader/i));
assert.ok(idleCyber.detail.productContext.every((item) => !/^I |^Led |^Built /i.test(item)));

const muloren = project("muloren");
assert.strictEqual(muloren.role, "Senior Unity Developer");
assert.strictEqual(muloren.teamSize, 10);

assert.strictEqual(project("jx1").title, "JX1 Mobile / T\u00ecnh Thi\u00ean H\u1ea1");
assert.strictEqual(project("shibainu").title, "Food Truck - Shiba Inu");
assert.strictEqual(project("surviver").title, "Survivor.IO");
const cryptoQuest = project("cryptoquest");
assert.strictEqual(cryptoQuest.teamSize, 14);
assert.strictEqual(cryptoQuest.detail.presentation.layoutVariant, "production-showcase");
assert.strictEqual(cryptoQuest.detail.presentation.theme, "cryptoquest");
assert.deepStrictEqual(
  cryptoQuest.detail.presentation.storyBeats.map((beat) => beat.id),
  ["world", "quests", "progression", "production"]
);
assert.deepStrictEqual(
  cryptoQuest.detail.media.map((media) => media.key),
  ["revive", "quest", "npc", "home", "equipment", "tooling"]
);

for (const item of data.projects.filter((candidate) => candidate.detail.tier === "B")) {
  assert.ok(item.detail.contribution.length >= 3, `${item.detailKey} needs three contribution bullets`);
  assert.ok(item.detail.media.length >= 2 && item.detail.media.length <= 6, `${item.detailKey} needs two to six primary media records`);
}

for (const key of ["share001-ludo", "share002-pixelshooter3d"]) {
  const item = project(key);
  assert.strictEqual(item.detail.statusLabel, "Sample");
  assert.ok(item.detail.purpose);
  assert.ok(item.detail.technicalNotes.length);
  assert.ok(item.detail.media.length);
}

for (const key of ["citybuilder", "iceBreakingBattle", "neighborhood"]) {
  const item = project(key);
  assert.strictEqual(item.status, "archived");
  assert.strictEqual(item.detail.mode, "archived");
  assert.strictEqual(item.detail.statusLabel, "Archived / legacy work");
  assert.ok(item.detail.archiveReason);
}

for (const item of data.projects) {
  assert.ok(item.detail.presentation, `${item.detailKey} needs presentation metadata`);
  assert.ok(showcaseFamilies.has(item.detail.presentation.layoutVariant), `${item.detailKey} has unsupported showcase family`);
  assert.ok(/^#[0-9a-f]{6}$/i.test(item.detail.presentation.palette.accent), `${item.detailKey} needs a safe accent color`);
  for (const media of item.detail.media || []) {
    if (media.type === "image") assert.ok(!/^https?:/i.test(media.src), `${item.detailKey} image media must be controlled locally: ${media.src}`);
  }
}
console.log("Portfolio detail content contract passed.");
