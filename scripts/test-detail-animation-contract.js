#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "assets/js/script.js"), "utf8");

if (!/if \(typeof window\.animateCodeLoading === ["']function["']\) \{\s*window\.animateCodeLoading\(loading\);\s*\}/.test(source)) {
  console.error("Detail animation contract failed: capability guard is missing.");
  process.exit(1);
}

console.log("Detail animation contract passed.");
