#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");

const interactions = fs.readFileSync("assets/js/portfolio-detail-interactions.js", "utf8");
const legacy = fs.readFileSync("assets/js/script.js", "utf8");
const fragments = fs.readdirSync("assets/portfolio-details")
  .filter((file) => file.endsWith(".html"))
  .map((file) => fs.readFileSync(`assets/portfolio-details/${file}`, "utf8"))
  .join("\n");

assert.match(interactions, /closest\?\.\("\[data-expand-media\]"\)/, "viewer must use delegated media trigger handling");
assert.match(interactions, /event\.key === "Escape"/, "viewer must close on Escape");
assert.match(interactions, /trigger\.focus\?\.\(\)/, "viewer must restore trigger focus");
assert.match(interactions, /role", "dialog"/, "viewer must expose dialog semantics");
assert.match(interactions, /aria-modal", "true"/, "viewer must expose modal semantics");
assert.match(interactions, /frame\.className = "detail-media-viewer-frame"/, "viewer must provide a frame for image-relative controls");
assert.match(interactions, /frame\.append\(expandedImage, closeButton\)/, "viewer close control must share the expanded image frame");
assert.doesNotMatch(legacy, /window\.expandImage\s*=/, "legacy expandImage global must be removed");
assert.doesNotMatch(legacy, /window\.expandVideo\s*=/, "legacy expandVideo global must be removed");
assert.doesNotMatch(fragments, /\bonclick\s*=/i, "fragments must not contain inline handlers");

console.log("Portfolio detail interaction contract passed.");
