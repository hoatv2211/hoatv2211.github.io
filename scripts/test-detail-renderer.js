#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("assets/js/portfolio-detail-renderer.js", "utf8"), context);
const renderer = context.window.PortfolioDetailRenderer;
assert.ok(renderer && typeof renderer.render === "function", "renderer must expose render(project, fragmentHtml)");

const flagship = {
  title: "Flagship Project",
  detailKey: "flagship",
  status: "active",
  role: "Senior Unity Developer",
  teamSize: 10,
  period: "2022 — 2023",
  platforms: ["Android", "iOS"],
  summary: "Flagship summary.",
  detail: {
    tier: "A",
    mode: "hybrid",
    statusLabel: "Flagship case study",
    context: "Product context.",
    problem: "Delivery problem.",
    contribution: ["Built gameplay."],
    technicalDecisions: ["Separated systems."],
    personalOutcome: ["Delivered assigned systems."],
    productContext: ["Product shipped publicly."],
    evidence: [{ label: "Project site", url: "https://example.invalid/project", status: "public" }],
    media: [
      { type: "image", src: "hero.jpg", alt: "Hero gameplay", width: 1600, height: 900, fit: "cover", featured: true },
      { type: "image", src: "gallery.jpg", alt: "Gallery gameplay", width: 800, height: 600, fit: "contain" },
      { type: "embed", src: "https://www.youtube.com/embed/example", title: "Gameplay trailer" },
      { type: "demo", src: "https://example.invalid/demo", label: "Launch demo" },
    ],
  },
};
const fragment = '<section class="timeline project-item" project-detail data-detail-category="flagship"><div data-detail-slot="bespoke"><p>Unique narrative.</p></div></section>';
const flagshipHtml = renderer.render(flagship, fragment);
assert.strictEqual((flagshipHtml.match(/\bproject-detail\b/g) || []).length, 1, "renderer must return one detail root");
assert.match(flagshipHtml, /data-detail-category="flagship"/);
assert.match(flagshipHtml, /Flagship case study/);
assert.match(flagshipHtml, /Senior Unity Developer/);
assert.match(flagshipHtml, /team of 10/);
assert.match(flagshipHtml, /Unique narrative/);
assert.ok(flagshipHtml.indexOf("Product context") < flagshipHtml.indexOf("My contribution"));
assert.ok(flagshipHtml.indexOf("My contribution") < flagshipHtml.indexOf("Technical decisions"));
assert.ok(flagshipHtml.indexOf("Personal outcome") < flagshipHtml.indexOf("Product context and evidence"));
assert.match(flagshipHtml, /src="hero\.jpg"[^>]*loading="eager"[^>]*fetchpriority="high"/);
assert.doesNotMatch(flagshipHtml.match(/<img[^>]*src="hero\.jpg"[^>]*>/)[0], /loading="lazy"/);
assert.match(flagshipHtml, /src="gallery\.jpg"[^>]*loading="lazy"[^>]*decoding="async"/);
assert.match(flagshipHtml, /target="_blank" rel="noopener noreferrer"/);
assert.match(flagshipHtml, /<iframe[^>]*title="Gameplay trailer"[^>]*loading="lazy"/);
assert.match(flagshipHtml, /Launch demo/);
assert.doesNotMatch(flagshipHtml, /<iframe[^>]*example\.invalid\/demo/);

const showcase = {
  title: "Showcase Project",
  detailKey: "cryptoquest",
  status: "active",
  role: "Senior Unity Developer",
  teamSize: 14,
  period: "May 2023 - Feb 2024",
  platforms: ["Web (WebGL)"],
  summary: "Turn-based GameFi RPG with connected production systems.",
  detail: {
    tier: "B",
    mode: "hybrid",
    statusLabel: "Project case study",
    contribution: ["Built quests.", "Built progression.", "Supported live operations."],
    evidence: [
      { label: "Website", url: "https://example.invalid/website", status: "public" },
      { label: "Demo", url: "https://example.invalid/demo", status: "public" },
    ],
    media: [
      { key: "revive", type: "image", src: "hero.jpg", alt: "Revive gameplay", width: 1016, height: 858, fit: "cover", featured: true },
      { key: "home", type: "image", src: "home.jpg", alt: "Home gameplay", width: 1021, height: 894, fit: "cover" },
      { key: "quest", type: "image", src: "quest.jpg", alt: "Quest gameplay", width: 1023, height: 890, fit: "cover" },
      { key: "npc", type: "image", src: "npc.jpg", alt: "NPC gameplay", width: 1020, height: 886, fit: "cover" },
      { key: "equipment", type: "image", src: "equipment.jpg", alt: "Equipment gameplay", width: 707, height: 630, fit: "cover" },
      { key: "tooling", type: "image", src: "tooling.jpg", alt: "Production tooling", width: 1025, height: 890, fit: "cover" },
    ],
    presentation: {
      layoutVariant: "production-showcase",
      theme: "cryptoquest",
      eyebrow: "Turn-based GameFi RPG",
      heroMediaKey: "revive",
      storyBeats: [
        { id: "world", kicker: "World and gameplay", title: "A connected RPG loop", body: "World story.", mediaKeys: ["home"], layout: "wide" },
        { id: "quests", kicker: "Quest pipeline", title: "Dynamic objectives", body: "Quest story.", mediaKeys: ["quest", "npc"], layout: "split" },
        { id: "progression", kicker: "Character progression", title: "Connected systems", body: "Progression story.", mediaKeys: ["equipment"], layout: "offset" },
        { id: "production", kicker: "Production contribution", title: "Practical tools", body: "Production story.", mediaKeys: ["tooling"], layout: "split" },
      ],
    },
  },
};
const showcaseHtml = renderer.render(showcase, '<section project-detail data-detail-category="cryptoquest"></section>');
assert.match(showcaseHtml, /detail-case-study--production-showcase/);
assert.match(showcaseHtml, /detail-theme--cryptoquest/);
assert.match(showcaseHtml, /detail-showcase-hero/);
assert.match(showcaseHtml, /detail-production-strip/);
assert.match(showcaseHtml, /data-story-beat="quests"/);
assert.ok(showcaseHtml.indexOf("World and gameplay") < showcaseHtml.indexOf("Quest pipeline"));
assert.match(showcaseHtml, />Play Demo</);
assert.match(showcaseHtml, />Visit Website</);
assert.match(showcaseHtml, /See Showcase Project in motion/);
assert.strictEqual((showcaseHtml.match(/src="quest\.jpg"/g) || []).length, 1);
assert.strictEqual((showcaseHtml.match(/class="detail-story-beat/g) || []).length, 4);

function renderFamily(family, overrides = {}) {
  const project = structuredClone(showcase);
  project.title = overrides.title || `${family} project`;
  project.detailKey = overrides.detailKey || family;
  project.detail.presentation.layoutVariant = family;
  project.detail.presentation.theme = overrides.theme || family;
  project.detail.presentation.palette = {
    ink: "#080a14",
    panel: "#111a35",
    accent: "#d9a84e",
    accentAlt: "#43bb79",
    text: "#f8f5eb",
    muted: "#aeb6ce",
  };
  if (overrides.evidence) project.detail.evidence = overrides.evidence;
  if (overrides.storyBeats) project.detail.presentation.storyBeats = overrides.storyBeats;
  return renderer.render(project, `<section project-detail data-detail-category="${project.detailKey}"></section>`);
}

const flagshipFamilyHtml = renderFamily("flagship-worlds");
assert.match(flagshipFamilyHtml, /detail-case-study--flagship-worlds/);
assert.match(flagshipFamilyHtml, /detail-showcase--flagship-worlds/);
assert.match(flagshipFamilyHtml, /style="[^"]*--showcase-accent: #d9a84e/);

const mobileHtml = renderFamily("mobile-campaign");
assert.match(mobileHtml, /detail-showcase--mobile-campaign/);
assert.match(mobileHtml, /detail-mobile-rail/);

const editorialHtml = renderFamily("gameplay-editorial", {
  evidence: [
    { label: "App Store", url: "https://example.invalid/app-store", status: "public" },
    { label: "Google Play", url: "https://example.invalid/google-play", status: "public" },
    { label: "Youtube Trailer", url: "https://example.invalid/trailer", status: "public" },
  ],
});
assert.match(editorialHtml, /detail-showcase--gameplay-editorial/);
assert.match(editorialHtml, />App Store</);
assert.match(editorialHtml, />Google Play</);
assert.match(editorialHtml, />Watch Trailer</);

const consoleHtml = renderFamily("product-console");
assert.match(consoleHtml, /detail-showcase--product-console/);
assert.match(consoleHtml, /detail-console-journey/);

const compactProject = structuredClone(showcase);
compactProject.title = "Compact Sample";
compactProject.detailKey = "compact-sample";
compactProject.detail.statusLabel = "Sample";
compactProject.detail.presentation.layoutVariant = "compact-proof";
compactProject.detail.presentation.theme = "compact-sample";
compactProject.detail.presentation.palette = {
  ink: "#080a14",
  panel: "#111a35",
  accent: "#d9a84e",
  accentAlt: "#43bb79",
  text: "#f8f5eb",
  muted: "#aeb6ce",
};
compactProject.detail.presentation.storyBeats = [];
const compactHtml = renderer.render(compactProject, '<section project-detail data-detail-category="compact-sample"></section>');
assert.match(compactHtml, /detail-case-study--compact-proof/);
assert.match(compactHtml, /detail-compact-proof/);
assert.doesNotMatch(compactHtml, /detail-showcase-story/);
for (const src of ["hero.jpg", "home.jpg", "quest.jpg", "npc.jpg", "equipment.jpg", "tooling.jpg"]) {
  assert.strictEqual((compactHtml.match(new RegExp(`src="${src.replace(".", "\\.")}"`, "g")) || []).length, 1, `${src} must render once in compact proof`);
}

const sample = {
  title: "Sample Project",
  detailKey: "sample",
  status: "active",
  platforms: [],
  summary: "Sample summary.",
  detail: {
    tier: "C",
    mode: "rendered",
    statusLabel: "Sample",
    purpose: "Demonstrates a focused mechanic.",
    technicalNotes: ["Uses a compact gameplay loop."],
    media: [{ type: "image", src: "sample.png", alt: "Sample gameplay", width: 640, height: 360, fit: "cover", featured: true }],
  },
};
const sampleHtml = renderer.render(sample, '<section project-detail data-detail-category="sample"></section>');
assert.match(sampleHtml, /Demonstrates a focused mechanic/);
assert.match(sampleHtml, /Technical notes/);
assert.doesNotMatch(sampleHtml, /data-detail-slot="bespoke"/);

const archived = {
  title: "Archived Project",
  detailKey: "archived",
  status: "archived",
  platforms: [],
  summary: "Archived summary.",
  detail: {
    tier: "C",
    mode: "archived",
    statusLabel: "Archived \/ legacy work",
    archiveReason: "No longer displayed in the primary portfolio.",
    technicalNotes: [],
    media: [],
  },
};
const archivedHtml = renderer.render(archived, '<section project-detail data-detail-category="archived"></section>');
assert.match(archivedHtml, /Archived \/ legacy work/);
assert.match(archivedHtml, /No longer displayed in the primary portfolio/);
assert.doesNotMatch(archivedHtml, /detail-gallery/);
assert.doesNotMatch(archivedHtml, /<section[^>]*>\s*<h3[^>]*>Technical notes<\/h3>\s*<\/section>/);

assert.throws(
  () => renderer.render(flagship, '<section project-detail data-detail-category="wrong"></section>'),
  /does not match project detail key/
);

console.log("Portfolio detail renderer contract passed.");
