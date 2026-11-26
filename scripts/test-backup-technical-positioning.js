#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const routes = ["recruiter-clean", "dev-console", "game-studio"];

for (const route of routes) {
  const html = read(`backup/${route}/index.html`);
  const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)[0];
  assert.match(hero, /full-stack/i, `${route}: hero must identify hands-on full-stack scope`);
  assert.match(hero, /Unity client/i, `${route}: hero must retain Unity client identity`);
  assert.match(hero, /backend\/server/i, `${route}: hero must name backend/server work`);
  assert.match(hero, /AI (?:workflow )?automation/i, `${route}: hero must name AI automation`);
  assert.match(hero, /8\+ years (?:in |of )?game development/i, `${route}: tenure must apply specifically to game development`);
  assert.doesNotMatch(html, /8\+ years (?:of )?(?:full-stack|backend|server|AI)/i, `${route}: do not imply eight years across every discipline`);
  assert.match(html, /GameFi/, `${route}: retain GameFi offering`);
  assert.match(html, /Telegram/i, `${route}: retain Telegram offering`);
  assert.match(html, /WebGL/, `${route}: retain WebGL offering`);
  assert.match(html, /hiring-focus-model\.js/, `${route}: preserve existing focus integration`);
}

const context = { window: {}, URL, fetch: async () => ({ ok: false }) };
vm.createContext(context);
vm.runInContext(read("assets/js/portfolio-data.js"), context);
vm.runInContext(read("backup/shared/backup-data-adapter.js"), context);
const backup = context.window.PortfolioBackup;
const expectedIds = context.window.PORTFOLIO_DATA.map(project => project.id);
assert.deepStrictEqual(Array.from(backup.getProjects(), project => project.id), Array.from(expectedIds), "default backups retain every canonical project in order");
assert.strictEqual(backup.getStats()[0].detail, "game development", "eight-year stat must be scoped to game development");

const email = backup.getContactLinks()[0];
assert.strictEqual(email.label, "Discuss technical work", "primary contact action must invite a technical discussion");
const emailUrl = new URL(email.href);
assert.strictEqual(emailUrl.protocol, "mailto:");
assert.strictEqual(emailUrl.pathname, "hoatv.mad@gmail.com");
assert.strictEqual(emailUrl.searchParams.get("subject"), "Technical discussion: Unity, backend/server, AI automation");

for (const route of routes) {
  const html = read(`backup/${route}/index.html`);
  const targets = Object.fromEntries(Array.from(html.matchAll(/id="([^"]+)"/g), match => [match[1], { innerHTML: "" }]));
  context.document = { getElementById: id => targets[id] || null };
  vm.runInContext(read(`backup/${route}/main.js`), context);
  const contactIds = route === "recruiter-clean" ? ["contact-actions", "footer-actions"] : ["contact-links"];
  for (const id of contactIds) {
    assert.match(targets[id].innerHTML, /mailto:hoatv\.mad@gmail\.com/, `${route}/${id}: email action must render`);
    assert.match(targets[id].innerHTML, />Discuss technical work<\/a>/i, `${route}/${id}: technical discussion label must render`);
    assert.match(targets[id].innerHTML, /https:\/\/t\.me\//, `${route}/${id}: preserve Telegram contact`);
    assert.match(targets[id].innerHTML, /https:\/\/github\.com\/hoatv2211/, `${route}/${id}: preserve GitHub contact`);
  }
}

console.log("Backup technical positioning passed for all 3 routes, scoped tenure, canonical projects, and rendered technical email CTAs.");
