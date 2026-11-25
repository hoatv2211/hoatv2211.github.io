#!/usr/bin/env node
"use strict";
const assert = require("assert");
const fs = require("fs");
const portfolio = JSON.parse(fs.readFileSync("portfolio.json", "utf8"));
const html = fs.readFileSync("index.html", "utf8");
for (const entry of portfolio.experience) {
  assert(entry.highlights.length >= 2 && entry.highlights.length <= 4, `${entry.company}: keep 2-4 concrete bullets`);
  for (const line of entry.highlights) {
    assert(!/Primary developer|broader ownership|production discipline|one production workflow|helped strengthen/i.test(line), `${entry.company}: avoid labels and vague self-assessment`);
    const escaped = line.replace(/&/g, "&amp;");
    assert(html.includes(escaped), `${entry.company}: web Resume must match canonical bullet: ${line}`);
  }
}
const freelance = portfolio.experience[0];
for (const capability of [/Unity client/i, /server-side/i, /automation/i, /AI skills/i, /large-scale/i]) {
  assert(capability.test(JSON.stringify(freelance)), `Freelance experience must cover ${capability}`);
}
const beemob = portfolio.experience.find(e => e.company === "BEEMOB Studio");
assert.strictEqual(beemob.position, "Unity Developer");
assert(!/Senior Unity Developer/.test(JSON.stringify(beemob)), "BEEMOB experience must not contradict its formal title");
console.log("Resume copy contract passed for all experience entries.");
