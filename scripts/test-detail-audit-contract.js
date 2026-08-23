#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const {
  DETAIL_VIEWPORTS,
  ROUTE_VIEWPORTS,
  CANONICAL_ROUTES,
  BACKUP_ROUTES,
  loadDetailKeys,
} = require("./audit-portfolio-details");

assert.deepStrictEqual(DETAIL_VIEWPORTS.map((item) => item.width), [320, 390, 768, 1280, 1440]);
assert.deepStrictEqual(ROUTE_VIEWPORTS.map((item) => item.width), [390, 1280]);
assert.strictEqual(CANONICAL_ROUTES.length, 6);
assert.strictEqual(BACKUP_ROUTES.length, 3);
assert.strictEqual(loadDetailKeys(process.cwd()).length, 26);
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.match(packageJson.scripts["audit:portfolio-details"], /audit-portfolio-details\.js/);

console.log("Portfolio browser audit contract passed.");
