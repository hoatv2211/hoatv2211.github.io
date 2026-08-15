#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");

const css = fs.readFileSync("assets/css/portfolio-details.css", "utf8");
const html = fs.readFileSync("index.html", "utf8");

for (const selector of [
  ".detail-gallery",
  ".detail-gallery--landscape",
  ".detail-gallery--portrait",
  ".detail-gallery--mixed",
  ".detail-media--cover",
  ".detail-media--contain",
  ".detail-media--portrait",
  ".detail-media--video",
  ".detail-media--embed",
  ".detail-media--demo",
]) {
  assert.ok(css.includes(selector), `missing detail CSS selector ${selector}`);
}
for (const selector of [
  ".detail-case-study--production-showcase",
  ".detail-theme--cryptoquest",
  ".detail-showcase-hero",
  ".detail-production-strip",
  ".detail-story-beat--wide",
  ".detail-story-beat--split",
  ".detail-story-beat--offset",
  "@media (prefers-reduced-motion: reduce)",
]) {
  assert.ok(css.includes(selector), `missing showcase CSS ${selector}`);
}
for (const selector of [
  ".detail-showcase--flagship-worlds",
  ".detail-showcase--mobile-campaign",
  ".detail-mobile-rail",
  ".detail-showcase--gameplay-editorial",
  ".detail-showcase--product-console",
  ".detail-console-journey",
  ".detail-compact-proof",
]) {
  assert.ok(css.includes(selector), `missing showcase family CSS ${selector}`);
}
for (const token of [
  "var(--showcase-accent)",
  "var(--showcase-accent-alt)",
  "var(--showcase-panel)",
]) {
  assert.ok(css.includes(token), `showcase CSS must consume palette token ${token}`);
}
assert.ok(css.includes("@media (max-width: 600px)"), "detail CSS must include a mobile breakpoint");
const viewerCloseRule = css.match(/\.detail-media-viewer-close\s*\{([\s\S]*?)\}/)?.[1] || "";
assert.match(viewerCloseRule, /z-index:\s*10000/, "viewer close control must stay above expanded media");
assert.ok(!css.includes(".project-list"), "detail CSS must not own legacy card selectors");
assert.ok(!css.includes(".project-gallery"), "detail CSS must not own legacy gallery selectors");
const stylePosition = html.indexOf("assets/css/portfolio-details.css");
assert.ok(stylePosition > html.indexOf("assets/css/modern-enhancements.css"), "detail CSS must load after existing portfolio styles");

const animationCss = fs.readFileSync("assets/css/animations.css", "utf8");
const loadingRule = animationCss.match(/\.code-loading\s*\{([\s\S]*?)\}/)?.[1] || "";
assert.match(loadingRule, /max-width:\s*100%/, "detail loading effect must stay within its root");
assert.match(loadingRule, /min-width:\s*0/, "detail loading effect must be shrinkable");
assert.match(loadingRule, /box-sizing:\s*border-box/, "detail loading effect width must include padding");
console.log("Portfolio detail style contract passed.");
