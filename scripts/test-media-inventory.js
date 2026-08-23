#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");
const { inspectFile, buildInventory } = require("./inventory-portfolio-media");

const root = path.resolve(__dirname, "..");
const portrait = inspectFile(root, "assets/images/game/Archero/1.png");
assert.strictEqual(portrait.exists, true);
assert.strictEqual(portrait.width, 1080);
assert.strictEqual(portrait.height, 1920);
assert.strictEqual(portrait.orientation, "portrait");
assert.ok(portrait.bytes > 0);

const square = inspectFile(root, "assets/images/GooglePlay-Icon.svg");
assert.strictEqual(square.exists, true);
assert.strictEqual(square.width, 144);
assert.strictEqual(square.height, 144);
assert.strictEqual(square.orientation, "square");

const missing = inspectFile(root, "assets/images/not-present.png");
assert.strictEqual(missing.exists, false);
assert.strictEqual(missing.width, null);
assert.match(missing.error, /missing/i);

const inventory = buildInventory(root);
assert.strictEqual(inventory.projectCount, 26);
assert.ok(Array.isArray(inventory.media));
assert.ok(inventory.media.some((item) => item.projects.includes("archero") && item.src.endsWith("Archero/1.detail.webp")));
assert.ok(
  inventory.media.some((item) => item.projects.includes("flyingphoenix") && item.src.endsWith("flying-phoenix-chronicles/01-combat-boss-mobs.webp")),
  "Flying Phoenix hero media must be inventoried"
);
assert.strictEqual(inventory.missing.length, 0, `missing local media: ${inventory.missing.map((item) => item.src).join(", ")}`);

for (const item of inventory.media) {
  for (const usage of item.usages) {
    const project = require("../portfolio.json").projects.find((candidate) => candidate.detailKey === usage.project);
    const canonical = project.detail.media.find((media) => media.src === item.src);
    assert.strictEqual(canonical.width, item.width, `${usage.project}:${item.src} canonical width must match the file`);
    assert.strictEqual(canonical.height, item.height, `${usage.project}:${item.src} canonical height must match the file`);
  }
}
assert.ok(Array.isArray(inventory.budgetViolations), "inventory must report media budget violations");
assert.strictEqual(
  inventory.budgetViolations.filter((item) => !item.budgetException).length,
  0,
  `unresolved media budgets: ${inventory.budgetViolations.filter((item) => !item.budgetException).map((item) => `${item.project}:${item.src}`).join(", ")}`
);
console.log("Portfolio media inventory contract passed.");
