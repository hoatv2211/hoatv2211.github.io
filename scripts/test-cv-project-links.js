#!/usr/bin/env node
"use strict";
const assert = require("assert");
const fs = require("fs");
const source = fs.readFileSync("scripts/generate-cv.py", "utf8");
for (const key of ["idleCyber", "nekoverse", "muloren", "jx1", "dalgona"]) {
  assert(source.includes(`https://hoatv2211.github.io/?project=${key}`), `CV must link to full portfolio detail: ${key}`);
}
const script = fs.readFileSync("assets/js/script.js", "utf8");
assert(script.includes('get("project")'), "Homepage must accept project deep links");
console.log("CV project deep-link contract passed.");
