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
  ".detail-showcase--portrait-led",
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
assert.match(
  css,
  /@media \(max-width: 767px\)[\s\S]*\.detail-showcase--portrait-led \.detail-showcase-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/,
  "portrait-led flagship hero must collapse below 768px"
);
assert.match(
  css,
  /@media \(max-width: 760px\)[\s\S]*body\.portfolio-detail-open \.navbar[^{}]*\{[^}]*display:\s*none\s*!important/,
  "mobile project detail must hide the fixed global navigation"
);
const portraitMobileBreakpoint = css.indexOf("@media (max-width: 760px)");
const detailChatbotRule = css.indexOf("body.portfolio-detail-open .portfolio-chatbot-button");
assert.ok(
  detailChatbotRule >= 0 && detailChatbotRule < portraitMobileBreakpoint,
  "project detail must hide floating chatbot controls at every viewport"
);
assert.match(
  css,
  /body\.portfolio-detail-open \.theme-toggle\s*\{[^}]*top:\s*max\(14px,[^}]*right:\s*180px\s*!important/,
  "desktop project detail controls must not overlap"
);
assert.match(
  css,
  /@media \(max-width: 767px\)[\s\S]*body\.portfolio-detail-open \.detail-showcase--portrait-led \.detail-showcase-hero-copy\s*\{[^}]*order:\s*-1/,
  "mobile portrait detail must lead with product identity"
);
assert.match(
  css,
  /@media \(max-width: 767px\)[\s\S]*body\.portfolio-detail-open \.detail-showcase--portrait-led \.detail-showcase-hero \.detail-title\s*\{[^}]*overflow-wrap:\s*normal[^}]*word-break:\s*normal/,
  "mobile portrait title must not break inside words"
);
assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.detail-showcase--mobile-campaign \.detail-showcase-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/, "Mobile Campaign hero must collapse with a family-specific selector");
assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.detail-showcase--product-console \.detail-showcase-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/, "Product Console hero must collapse with a family-specific selector");
const viewerCloseRule = css.match(/\.detail-media-viewer \.detail-media-viewer-frame > \.detail-media-viewer-close\s*\{([\s\S]*?)\}/)?.[1] || "";
assert.match(viewerCloseRule, /z-index:\s*10000/, "viewer close control must stay above expanded media");
assert.match(viewerCloseRule, /position:\s*absolute/, "viewer close control must anchor to the image frame");
assert.match(viewerCloseRule, /top:\s*12px/, "viewer close control must sit at the image top edge");
assert.match(viewerCloseRule, /right:\s*12px/, "viewer close control must sit at the image right edge");
const viewerFrameRule = css.match(/\.detail-media-viewer-frame\s*\{([\s\S]*?)\}/)?.[1] || "";
assert.match(viewerFrameRule, /position:\s*relative/, "viewer image frame must establish the close control containing block");
const viewerMediaRule = css.match(/\.detail-media-viewer \.expanded-media\s*\{([\s\S]*?)\}/)?.[1] || "";
assert.match(viewerMediaRule, /position:\s*static/, "expanded media must be positioned inside its frame");
assert.match(viewerMediaRule, /transform:\s*none/, "expanded media must not keep the legacy viewport translation");
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
