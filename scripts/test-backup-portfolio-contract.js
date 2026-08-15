#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const context = {
  window: {},
  fetch: async () => ({ ok: false }),
  URL,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync("assets/js/portfolio-data.js", "utf8"), context);
vm.runInContext(fs.readFileSync("backup/shared/backup-data-adapter.js", "utf8"), context);

const projects = JSON.parse(JSON.stringify(context.window.PortfolioBackup.getProjects()));
assert.strictEqual(projects.length, 22, "backups must receive 22 active projects");
assert.ok(projects.every((project) => project.detailCategory), "backup projects need stable detail keys");
assert.ok(projects.every((project) => project.image.alt), "backup projects need image alt text");
assert.ok(projects.every((project) => !/^https?:/i.test(project.image.src)), "backup project cards must use controlled local images");
assert.ok(projects.every((project) => fs.existsSync(path.resolve("backup/recruiter-clean", project.image.src))), "backup project card images must exist locally");
assert.ok(!projects.some((project) => ["citybuilder", "iceBreakingBattle", "neighborhood"].includes(project.detailCategory)), "archived projects must stay out of backups");

for (const route of ["recruiter-clean", "dev-console", "game-studio"]) {
  const html = fs.readFileSync(`backup/${route}/index.html`, "utf8");
  assert.match(html, /\.\.\/\.\.\/assets\/js\/portfolio-data\.js/);
  assert.match(html, /\.\.\/shared\/backup-data-adapter\.js/);
  assert.match(html, /<meta name="viewport"/);
}

console.log("Backup portfolio contract passed for 3 routes and 22 projects.");