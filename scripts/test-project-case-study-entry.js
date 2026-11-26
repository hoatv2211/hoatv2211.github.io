#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const portfolio = JSON.parse(fs.readFileSync(path.join(root, "portfolio.json"), "utf8"));
const projects = portfolio.projects.filter(project => project.detailRoute);
const homepageScript = fs.readFileSync(path.join(root, "assets/js/script.js"), "utf8");
assert(homepageScript.includes('get("project")'), "Root must support project query deep links");
assert(projects.length > 0, "Canonical project routes must exist");

for (const project of projects) {
  const html = fs.readFileSync(path.join(root, project.detailRoute, "index.html"), "utf8");
  const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  const entries = anchors.filter(anchor => anchor[2].trim() === "Explore full technical case study");
  assert.strictEqual(entries.length, 1, `${project.detailRoute}: needs one prominent case-study entry`);
  const entry = entries[0];
  const href = entry[1].match(/\bhref=["']([^"']+)["']/i)?.[1];
  const target = new URL(href, `https://hoatv2211.github.io/${project.detailRoute}`);
  assert.strictEqual(target.origin, "https://hoatv2211.github.io");
  assert.strictEqual(target.pathname, "/", `${project.slug}: CTA must open root detail experience`);
  assert.strictEqual(target.searchParams.get("project"), project.detailKey, `${project.slug}: exact runtime detailKey required`);
  assert.strictEqual(target.hash, "", "Do not override project navigation with a hash");
  assert(/\bclass=["'][^"']*\bcase-study-cta\b/.test(entry[1]), `${project.slug}: primary CTA styling required`);
  assert(/\.case-study-cta\s*\{[^}]*padding:/s.test(html), `${project.slug}: CTA needs a generous target`);
  assert(/a:focus-visible\s*\{[^}]*outline:/s.test(html), `${project.slug}: visible keyboard focus required`);
  assert(!/aria-hidden=["']true|tabindex=["']-1|\bhidden\b/i.test(entry[1]), `${project.slug}: CTA must be accessible`);
  assert(html.indexOf(entry[0]) < html.indexOf("<p><strong>Role:"), `${project.slug}: entry should precede credits`);
  assert(anchors.some(anchor => /href=["']\.\.\/\.\.\/assets\/Tran-Van-Hoa-CV\.pdf["']/.test(anchor[1]) && anchor[2].trim() === "Download CV"), `${project.slug}: recruiter CV link required`);
  assert(anchors.some(anchor => /href=["']mailto:hoatv\.mad@gmail\.com\?subject=Technical%20discussion/.test(anchor[1]) && anchor[2].trim() === "Discuss a role or project"), `${project.slug}: working technical email contact required`);
  assert(!/<meta\b[^>]*http-equiv=["']refresh|(?:window\.)?location\.(?:replace|assign)\s*\(|(?:window\.)?location(?:\.href)?\s*=/i.test(html), `${project.slug}: no automatic redirect`);
}
console.log(`Project case-study entry contract passed for ${projects.length} canonical routes.`);
