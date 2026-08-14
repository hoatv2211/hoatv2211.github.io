#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "assets/js/fetchdownloadcount.js"), "utf8");
const failures = [];

if (/\?url=|encodeURIComponent\(apiUrl/i.test(source)) failures.push("client must not send arbitrary upstream URLs");
if (!/data-project-id/.test(source)) failures.push("client must identify a canonical project ID");
if (!/platform/.test(source)) failures.push("client must send an allowlisted platform ID");

if (failures.length) {
  console.error(`Download count contract failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("Download count contract passed.");
