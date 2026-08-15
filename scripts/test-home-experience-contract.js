#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/css/style.css"), "utf8");
const modernCss = fs.readFileSync(path.join(root, "assets/css/modern-enhancements.css"), "utf8");
const enhancements = fs.readFileSync(path.join(root, "assets/js/modern-enhancements.js"), "utf8");
const script = fs.readFileSync(path.join(root, "assets/js/script.js"), "utf8");
const showcase = fs.readFileSync(path.join(root, "assets/js/gaming-showcase.js"), "utf8");
const portfolio = JSON.parse(fs.readFileSync(path.join(root, "portfolio.json"), "utf8"));

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const videoTag = html.match(/<video\b[^>]*class="[^"]*hero-video[^"]*"[^>]*>/i)?.[0] || "";
expect(Boolean(videoTag), "Hero must use a native video element.");
for (const attribute of ["autoplay", "muted", "loop", "playsinline", "poster"]) {
  expect(new RegExp(`\\b${attribute}(?:=|\\s|>)`, "i").test(videoTag), `Hero video must include ${attribute}.`);
}
expect(/aria-label="HoaTV gameplay reel"/i.test(videoTag), "Hero video must have an accessible label.");
expect(!/hero-video-facade|>\s*Play reel\s*<|data-hero-video/i.test(html), "Play Reel facade must be removed from HTML.");
expect(!/data-hero-video|hero-video-facade/i.test(enhancements), "Play Reel facade activation code must be removed.");

expect(/\.loading-terminal\s*\{[^}]*width:\s*min\(100%\s*-\s*32px,\s*560px\)/s.test(css), "Loading terminal must have viewport-safe responsive width.");
expect(/\.loading-terminal-body\s+p\s*\{[^}]*overflow-wrap:\s*anywhere/s.test(css), "Loading commands must wrap on narrow screens.");
expect(/const\s+LOADING_OVERLAY_DELAY_MS\s*=\s*(?:[0-7]?\d{1,2}|800)\s*;/m.test(enhancements), "Loading overlay delay must be at most 800ms.");
expect(/DOMContentLoaded/.test(enhancements) && /window\.addEventListener\(['"]load['"]/.test(enhancements), "Loading overlay must have DOM-ready behavior and a load fallback.");

expect(!/\$1M\+/.test(html), "Public page must not expose funding amounts.");
expect(!/>100\+<[^]*?published games/i.test(html), "Public page must not use unqualified 100+ published games wording.");
expect(!/hundreds of thousands/i.test(JSON.stringify(portfolio)), "Unsupported Dalgona user-count wording must be removed.");

const dalgona = portfolio.projects.find((project) => project.id === "dalgona-worldchain");
const idleCyber = portfolio.projects.find((project) => project.id === "idle-cyber");
expect(dalgona?.role === "Tech Dev Leader" && dalgona?.teamSize === 15, "Dalgona role/team must match the claim registry.");
expect(idleCyber?.role === "Senior Unity Developer" && idleCyber?.teamSize === 10, "Idle Cyber role/team must match the claim registry.");

expect(/classList\.add\(["']portfolio-detail-open["']\)/.test(script), "Opening a project must enable the detail-mode body hook.");
expect(/classList\.remove\(["']portfolio-detail-open["']\)/.test(script), "Leaving a project must clear the detail-mode body hook.");
expect(/body\.portfolio-detail-open[\s\S]*\.portfolio\s*>\s*header/.test(css + modernCss), "Detail mode must hide the listing shell.");
expect(/project\.detailCategory\s*&&\s*project\.demoUrl/.test(showcase), "Showcase must only render a second detail CTA when the primary action is a demo.");
expect(!/Message on Telegram/.test(html), "Public contact labels must use the shorter Telegram text.");
expect(/URLSearchParams[\s\S]*backups/.test(script), "Backup selector visibility must be gated by the backups query parameter.");
expect(/\.backup-style-toggle\[hidden\]/.test(css + modernCss), "Hidden backup selector controls must remain out of the public UI.");
expect(/@media \(max-width: 768px\)[\s\S]*\.navbar-list\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/.test(modernCss), "Mobile navigation must show all six destinations across two rows.");
expect(/@media \(max-width: 768px\)[\s\S]*\.navbar-book-call-item\s*\{[^}]*display:\s*block\s*!important/.test(modernCss), "Mobile navigation must keep the Telegram tab visible.");
expect(/\.gitshare-card\s*\{[^}]*min-width:\s*0/.test(css + modernCss), "GitShare cards must be fluid and shrinkable.");
expect(!/navigationLinks\[j\]\.classList/.test(script), "Navigation state must not assume page and nav indexes match.");

if (failures.length) {
  console.error("Home experience contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Home experience contract passed.");
