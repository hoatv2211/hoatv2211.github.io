#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const skillRoot = path.join(root, ".codex", "skills", "game-production-showcase");
const requiredFiles = [
  "SKILL.md",
  path.join("agents", "openai.yaml"),
  path.join("references", "family-map.md"),
  path.join("references", "presentation-schema.md"),
  path.join("references", "qa-checklist.md"),
];

for (const relativePath of requiredFiles) {
  assert.ok(fs.existsSync(path.join(skillRoot, relativePath)), `missing showcase skill file ${relativePath}`);
}

const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
assert.match(skill, /^---\r?\nname: game-production-showcase\r?\ndescription:/);
assert.match(skill, /portfolio\.json/);
assert.match(skill, /references\/family-map\.md/);
assert.match(skill, /npm test/);

const familyMap = fs.readFileSync(path.join(skillRoot, "references", "family-map.md"), "utf8");
for (const family of ["flagship-worlds", "mobile-campaign", "gameplay-editorial", "product-console", "compact-proof"]) {
  assert.match(familyMap, new RegExp(`\\b${family}\\b`), `missing family ${family}`);
}

const metadata = fs.readFileSync(path.join(skillRoot, "agents", "openai.yaml"), "utf8");
assert.match(metadata, /display_name: "Game Production Showcase"/);
assert.match(metadata, /default_prompt:.*\$game-production-showcase/);

const githubAgentPath = path.join(root, ".github", "agents", "game-production-showcase.agent.md");
assert.ok(fs.existsSync(githubAgentPath), "missing GitHub showcase agent");
const githubAgent = fs.readFileSync(githubAgentPath, "utf8");
assert.match(githubAgent, /\.codex\/skills\/game-production-showcase\/SKILL\.md/);
assert.doesNotMatch(githubAgent, /Flagship Worlds[\s\S]*Mobile Campaign/, "GitHub agent must not duplicate the family map");

console.log("Game production showcase skill contract passed.");
