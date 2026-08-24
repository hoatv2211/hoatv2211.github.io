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
assert.strictEqual(projects.length, 23, "backups must receive 23 active projects");
assert.strictEqual(projects[0].id, "flyingphoenix", "backups must show Flying Phoenix Chronicles first");
assert.strictEqual(projects[11].id, "proxyapi-mad", "backups must show ProxyAPI.MAD twelfth");
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(context.window.PortfolioBackup.getFeaturedProjects(5))).map((project) => project.id),
  ["dalgona", "idleCyber", "muloren", "nekoverse", "flyingphoenix"],
  "backup featured projects must follow canonical featuredOrder"
);
assert.ok(projects.every((project) => project.detailCategory), "backup projects need stable detail keys");
assert.ok(projects.every((project) => project.image.alt), "backup projects need image alt text");
assert.ok(projects.every((project) => !/^https?:/i.test(project.image.src)), "backup project cards must use controlled local images");
assert.ok(projects.every((project) => fs.existsSync(path.resolve("backup/recruiter-clean", project.image.src))), "backup project card images must exist locally");
assert.ok(!projects.some((project) => ["citybuilder", "iceBreakingBattle", "neighborhood"].includes(project.detailCategory)), "archived projects must stay out of backups");

const gameStudioTargets = Object.fromEntries(
  ["hero-media", "proof-strip", "case-grid", "archive-grid", "contact-links", "repo-grid"].map((id) => [id, { innerHTML: "" }])
);
context.document = { getElementById: (id) => gameStudioTargets[id] || null };
vm.runInContext(fs.readFileSync("backup/game-studio/main.js", "utf8"), context);
assert.match(gameStudioTargets["case-grid"].innerHTML, /Flying Phoenix Chronicles/, "game-studio selected cases must include Flying Phoenix");
assert.doesNotMatch(gameStudioTargets["case-grid"].innerHTML, /JX1 Mobile/, "game-studio selected cases must exclude demoted JX1");

for (const route of ["recruiter-clean", "dev-console", "game-studio"]) {
  const html = fs.readFileSync(`backup/${route}/index.html`, "utf8");
  const main = fs.readFileSync(`backup/${route}/main.js`, "utf8");
  assert.match(html, /\.\.\/\.\.\/assets\/js\/portfolio-data\.js/);
  assert.match(html, /\.\.\/shared\/backup-data-adapter\.js/);
  assert.match(html, /<meta name="viewport"/);
  assert.match(main, /repo\.demoUrl[\s\S]*?>Website<\/a>/, `${route} homepage links must use the Website label`);
  assert.doesNotMatch(main, /repo\.demoUrl[\s\S]*?>Demo<\/a>/i, `${route} homepage links must not use the Demo label`);
}

const recruiterHtml = fs.readFileSync("backup/recruiter-clean/index.html", "utf8");
assert.match(recruiterHtml, /source and website links first/i, "recruiter backup GitShare copy must describe website links");

console.log("Backup portfolio contract passed for 3 routes and 23 projects.");
