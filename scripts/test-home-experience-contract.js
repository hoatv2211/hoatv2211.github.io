#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/css/style.css"), "utf8");
const modernCss = fs.readFileSync(path.join(root, "assets/css/modern-enhancements.css"), "utf8");
const chatbotCss = fs.readFileSync(path.join(root, "assets/css/portfolio-chatbot.css"), "utf8");
const enhancements = fs.readFileSync(path.join(root, "assets/js/modern-enhancements.js"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const bootstrap = fs.readFileSync(path.join(root, "assets/js/bootstrap.js"), "utf8");
const script = fs.readFileSync(path.join(root, "assets/js/script.js"), "utf8");
const showcase = fs.readFileSync(path.join(root, "assets/js/gaming-showcase.js"), "utf8");
const gitshare = fs.readFileSync(path.join(root, "assets/js/github-share.js"), "utf8");
const portfolio = JSON.parse(fs.readFileSync(path.join(root, "portfolio.json"), "utf8"));

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const aboutSurface = html.split('<article class="about active"')[1].split('<!--\n        - #RESUME')[0];
expect(!/about-editorial|work-process|engagement-model/.test(aboutSurface), "About must prioritize projects over decorative and repetitive sections.");
expect(aboutSurface.indexOf("about-text") < aboutSurface.indexOf("case-study-preview"), "About must introduce the developer before selected projects.");
expect(/experience-contact/.test(aboutSurface), "About must expose an experience and contact handoff.");

expect(/\.loading-terminal\s*\{[^}]*width:\s*min\(100%\s*-\s*32px,\s*560px\)/s.test(css), "Loading terminal must have viewport-safe responsive width.");
expect(/\.loading-terminal-body\s+p\s*\{[^}]*overflow-wrap:\s*anywhere/s.test(css), "Loading commands must wrap on narrow screens.");
expect(/const\s+LOADING_OVERLAY_DELAY_MS\s*=\s*(?:[0-7]?\d{1,2}|800)\s*;/m.test(enhancements), "Loading overlay delay must be at most 800ms.");
expect(/DOMContentLoaded/.test(enhancements) && /window\.addEventListener\(['"]load['"]/.test(enhancements), "Loading overlay must have DOM-ready behavior and a load fallback.");

expect(!/\$1M\+/.test(html), "Public page must not expose funding amounts.");
expect(!/>100\+<[^]*?published games/i.test(html), "Public page must not use unqualified 100+ published games wording.");
expect(!/hundreds of thousands/i.test(JSON.stringify(portfolio)), "Unsupported Dalgona user-count wording must be removed.");

for (const project of portfolio.projects) {
  expect(project.ownership === "Primary Developer", `${project.id} must identify primary development ownership separately from the formal role.`);
}
expect(/hands-on development/i.test(html.match(/<section class="about-text">[\s\S]*?<\/section>/i)?.[0] || ""), "About copy must state hands-on development scope.");

const dalgona = portfolio.projects.find((project) => project.id === "dalgona-worldchain");
const idleCyber = portfolio.projects.find((project) => project.id === "idle-cyber");
expect(dalgona?.role === "Tech Dev Leader" && dalgona?.teamSize === 15, "Dalgona role/team must match the claim registry.");
expect(idleCyber?.role === "Senior Unity Developer" && idleCyber?.teamSize === 10, "Idle Cyber role/team must match the claim registry.");

expect(/classList\.add\(["']portfolio-detail-open["']\)/.test(script), "Opening a project must enable the detail-mode body hook.");
expect(/classList\.remove\(["']portfolio-detail-open["']\)/.test(script), "Leaving a project must clear the detail-mode body hook.");
expect(/body\.portfolio-detail-open[\s\S]*\.portfolio\s*>\s*header/.test(css + modernCss), "Detail mode must hide the listing shell.");
expect(/project\.detailCategory\s*&&\s*project\.demoUrl/.test(showcase), "Showcase must only render a second detail CTA when the primary action is a demo.");
expect(/\.slice\(0,\s*10\)/.test(showcase), "Showcase must show ten projects with featured projects prioritized.");
expect(/\.sort\(\(left,\s*right\)\s*=>[\s\S]*featuredOrder/.test(showcase), "Showcase must sort projects by featuredOrder.");
expect(/data-detail-category=/.test(showcase), "Showcase detail CTAs must use the canonical portfolio detail event contract.");
expect(!/data-open-detail/.test(showcase), "Showcase must not maintain a second, divergent project-detail click path.");
expect(/\.portfolio-showcase\s+\.showcase-btn\.showcase-btn-play\s*\{[^}]*color:\s*var\(--smoky-black\)/.test(modernCss), "Primary showcase CTA must outrank the generic button selector and keep dark text on the gold background.");
expect(/\.portfolio-showcase\s+\.showcase-btn\.showcase-btn-play:hover\s*\{[^}]*color:\s*var\(--orange-yellow-crayola\)/.test(modernCss), "Primary showcase CTA hover state must outrank the generic button selector and keep readable gold text on the dark page background.");
expect(!/(?:34,\s*211,\s*238|124,\s*58,\s*237|167,\s*139,\s*250|244,\s*63,\s*94)|var\(--neon-(?:cyan|purple|rose)\)/.test(modernCss), "Portfolio enhancements must use the single gold accent instead of competing cyan, violet, or rose shell accents.");
expect(!/Message on Telegram/.test(html), "Public contact labels must use the shorter Telegram text.");
expect(/URLSearchParams[\s\S]*backups/.test(script), "Backup selector visibility must be gated by the backups query parameter.");
expect(/\.backup-style-toggle\[hidden\]/.test(css + modernCss), "Hidden backup selector controls must remain out of the public UI.");
expect(/@media \(max-width: 768px\)[\s\S]*\.navbar-list\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/.test(modernCss), "Mobile navigation must show all six destinations across two rows.");
expect(/@media \(max-width: 768px\)[\s\S]*\.navbar-book-call-item\s*\{[^}]*display:\s*block\s*!important/.test(modernCss), "Mobile navigation must keep the Telegram tab visible.");
expect(
  /@media \(max-width:\s*768px\)[\s\S]*\.portfolio-chatbot-button\s*,[\s\S]*\.portfolio-chatbot-panel\s*,[\s\S]*\.portfolio-chatbot-invitation\s*\{[^}]*display:\s*none\s*!important/.test(chatbotCss),
  "Mobile layout must remove chatbot overlays that cover portfolio content."
);
expect(
  /@media \(max-width:\s*768px\)[\s\S]*#theme-toggle\s*,[\s\S]*\.theme-toggle\s*\{[^}]*display:\s*none\s*!important/.test(modernCss),
  "Mobile layout must remove the floating theme control that competes with the sidebar and navigation."
);
expect(/\.gitshare-card\s*\{[^}]*min-width:\s*0/.test(css + modernCss), "GitShare cards must be fluid and shrinkable.");
expect(/gitshare-mini-link[\s\S]*?>Website<\/a>/.test(gitshare), "GitShare homepage links must use the Website label.");
expect(!/gitshare-mini-link[\s\S]*?>Demo<\/a>/.test(gitshare), "GitShare homepage links must not be mislabeled as demos.");
expect(/src="assets\/js\/github-share\.js\?v=20260823-website"/.test(html), "GitShare script must use a cache-busting URL for the Website label release.");
for (const asset of [
  "assets/css/modern-enhancements.css",
  "assets/css/portfolio-chatbot.css",
  "assets/js/bootstrap.js",
  "assets/js/portfolio-data.js",
  "assets/js/modern-enhancements.js",
  "assets/js/gaming-showcase.js",
]) {
  expect(new RegExp(`${asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\?v=20260824-review6`).test(html), `${asset} must use the latest review-remediation cache key.`);
}
expect(/serviceWorker\s*\.\s*register\(['"]service-worker\.js['"]\)/.test(bootstrap), "Portfolio must register the root-scoped service worker.");
expect(/const\s+CACHE_NAME\s*=\s*['"]portfolio-shell-v8['"]/.test(serviceWorker), "Service worker cache must be versioned for the latest portfolio remediation.");
expect(/isShellNavigation\(event\.request\)[\s\S]*fetch\(event\.request\)[\s\S]*response\.ok[\s\S]*cache\.put\(SHELL_PATH[\s\S]*cache\.match\(SHELL_PATH\)/.test(serviceWorker), "Root navigation must use network-first and only cache successful homepage responses.");
expect(/key\.startsWith\(['"]portfolio-shell-['"]\)\s*&&\s*key\s*!==\s*CACHE_NAME/.test(serviceWorker), "Service worker activation must preserve unrelated game caches.");
expect(/LEGACY_CACHE_NAME\s*=\s*['"]unity-webgl-cache-v2['"][\s\S]*key\s*===\s*LEGACY_CACHE_NAME/.test(serviceWorker), "Service worker activation must remove the known legacy portfolio cache.");
expect(!/navigationLinks\[j\]\.classList/.test(script), "Navigation state must not assume page and nav indexes match.");

const aboutCopy = html.match(/<section class="about-text">[\s\S]*?<\/section>/i)?.[0] || "";
const aboutCtas = aboutCopy.match(/<a\b[^>]*class="[^"]*portfolio-cta[^"]*"/gi) || [];
expect(aboutCtas.length === 3, "About hero must expose exactly three distinct CTA intents.");
expect(/aria-label="Toggle dark\/slate mode"/i.test(html), "Theme control must describe the implemented dark/slate modes honestly.");
expect(/<h1 class="name"[^>]*>MAD<\/h1>/i.test(html), "Sidebar wordmark must use the concise MAD label.");
expect(!/class="service-more-text"/i.test(html), "Decorative emoji capability dump must be removed from About.");
expect(!/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(html), "Public page copy must not use decorative emoji markers.");

const canonicalVisibleFiles = [
  "index.html",
  "portfolio.json",
  "assets/data/portfolio-details.json",
  ...fs.readdirSync(path.join(root, "assets/portfolio-details"))
    .filter((name) => name.endsWith(".html"))
    .map((name) => `assets/portfolio-details/${name}`),
];
for (const relativePath of canonicalVisibleFiles) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  expect(!/[—–]/u.test(source), `${relativePath} must use regular hyphens instead of em/en dashes.`);
  expect(!/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(source), `${relativePath} must not use decorative emoji markers.`);
}

if (failures.length) {
  console.error("Home experience contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Home experience contract passed.");
