#!/usr/bin/env node
"use strict";
const assert = require("assert");
const { loadCanonical, validateCanonical } = require("./generate-portfolio-data");
const data = structuredClone(loadCanonical());
const project = data.projects.find(project => project.detailKey === "proxyapi-mad");
const engineering = { challenge: "Provider integration", implementation: ["Connected management UI"], outcome: "Full-stack workspace", evidenceNote: "Inspect public source with upstream credit" };
project.detail.engineering = engineering;
assert.doesNotThrow(() => validateCanonical(data));
for (const field of ["challenge", "outcome", "evidenceNote"]) {
  project.detail.engineering = { ...engineering, [field]: "" };
  assert.throws(() => validateCanonical(data), new RegExp(`detail\\.engineering\\.${field}`));
}
project.detail.engineering = { ...engineering, implementation: [] };
assert.throws(() => validateCanonical(data), /detail\.engineering\.implementation/);
console.log("Engineering case-study schema validation passed.");
