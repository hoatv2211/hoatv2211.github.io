#!/usr/bin/env node
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const data = require("../portfolio.json");
const expected = [
  ["brproxies", "BrProxies", "https://github.com/hoatv2211/BrProxies", 24],
  ["gamestudio-codexkit", "GameStudio-CodexKIT", "https://github.com/hoatv2211/GameStudio-CodexKIT", 25],
];
for (const [key, title, github, order] of expected) {
  const p = data.projects.find(project => project.detailKey === key);
  assert.ok(p, `${title} must be in the canonical portfolio`);
  for (const field of ["id", "slug", "legacyId", "detailKey"]) assert.strictEqual(p[field], key);
  assert.strictEqual(p.title, title);
  assert.strictEqual(p.category, "agentic");
  assert.strictEqual(p.type, "tool");
  assert.strictEqual(p.status, "active");
  assert.strictEqual(p.ownership, "Primary Developer");
  assert.strictEqual(p.displayOrder, order);
  assert.strictEqual(p.links.github, github);
  assert.doesNotMatch(JSON.stringify(p), /solo developer|from scratch|production.proven/i);
  assert.ok(p.detail.engineering.challenge);
  assert.ok(p.detail.engineering.implementation.length >= 1);
  assert.ok(p.detail.engineering.outcome);
  assert.ok(p.detail.evidence.some(e => e.url === github && e.status === "public"));
  for (const view of Object.values(data.hiringFocus.options)) assert.ok(view.projectDescriptions[key], `${key} neutral copy in every view`);
  assert.ok(data.hiringFocus.options.all.projectKeys.includes(key));
}
assert.deepStrictEqual(data.hiringFocus.options.automation.projectKeys, ["proxyapi-mad", "brproxies", "gamestudio-codexkit"]);
for (const [key] of expected) {
  const p = data.projects.find(project => project.detailKey === key);
  const shellPath = path.join(__dirname, "..", "assets/portfolio-details", key + ".html");
  assert.ok(fs.existsSync(shellPath), `${key} requires a detail shell`);
  const shell = fs.readFileSync(shellPath, "utf8");
  assert.match(shell, new RegExp(`data-detail-category="${key}"`));
  assert.ok(p.detail.media.length >= 2, `${key} requires repository-sourced media`);
  for (const m of p.detail.media) {
    assert.ok(fs.existsSync(path.join(__dirname, "..", m.src)), m.src);
    assert.ok(m.width > 0 && m.height > 0);
    assert.ok(m.sourceUrl.startsWith(p.links.github + "/blob/main/") || m.sourceUrl === p.links.website, "media provenance points to the repository or exact official product page");
  }
}
assert.match(data.projects.find(p => p.detailKey === "brproxies").detail.engineering.evidenceNote, /runtime.*separately.*upstream/i);
assert.match(data.projects.find(p => p.detailKey === "gamestudio-codexkit").detail.engineering.evidenceNote, /beta.*experimental/i);
const browserProject = data.projects.find(p => p.detailKey === "brproxies");
assert.deepStrictEqual(browserProject.platforms, ["macOS (Apple Silicon)", "Windows (x64)", "Linux (x64)"]);
assert.doesNotMatch(JSON.stringify(browserProject), /Windows-first/i);
assert.match(browserProject.detail.engineering.evidenceNote, /Windows-specific/);
for (const key of ["brproxies", "gamestudio-codexkit"]) {
  const project = data.projects.find(p => p.detailKey === key);
  assert.ok(project.detail.evidence.some(e => e.label === "Website" && e.url === project.links.website));
}
assert.ok(browserProject.detail.evidence.some(e => e.url.endsWith("/releases")));
assert.ok(browserProject.detail.evidence.some(e => e.url.endsWith("/.github/workflows/release.yml")));
console.log("AI project catalog, platform scope, public pages, fragment, and media contracts passed.");
