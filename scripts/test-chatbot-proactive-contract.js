#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");

const source = fs.readFileSync("assets/js/portfolio-chatbot.js", "utf8");
const css = fs.readFileSync("assets/css/portfolio-chatbot.css", "utf8");
const renderer = fs.readFileSync("assets/js/portfolio-detail-renderer.js", "utf8");
const shell = fs.readFileSync("assets/js/script.js", "utf8");

for (const contract of [
  ["proactiveEnabled", /proactiveEnabled:\s*true/],
  ["five-second delay", /proactiveDelayMs:\s*5000/],
  ["eight-second detail delay", /proactiveDetailDelayMs:\s*8000/],
  ["detail scroll threshold", /proactiveDetailScrollThreshold:\s*0\.3/],
  ["four-second visibility", /proactiveVisibleMs:\s*4000/],
  ["four-message maximum", /proactiveMaxPerSession:\s*4/],
  ["session storage", /sessionStorage\.(?:getItem|setItem)/],
  ["visibility handling", /visibilitychange/],
  ["status semantics", /setAttribute\("role",\s*"status"\)[\s\S]*setAttribute\("aria-live",\s*"polite"\)/],
  ["general invitation", /Hi! Looking for a Game developer\?/],
  ["portfolio invitation", /Need help choosing which projects to review first\?/],
  ["detail invitation", /Planning something similar\? Ask me how Hoa can help\./],
  ["flagship detail invitation", /Want Hoa's production highlights for/],
  ["mobile detail invitation", /Want the mobile delivery highlights for/],
  ["gameplay detail invitation", /Want the gameplay highlights for/],
  ["product detail invitation", /Want the product architecture behind/],
  ["compact detail invitation", /Want a quick role summary for/],
]) {
  assert.match(source, contract[1], `Missing proactive chatbot contract: ${contract[0]}`);
}

assert.match(source, /safeSessionSet\("ProactiveState"/);
assert.match(source, /detailSeen/);
assert.match(source, /detailScrollArmed/);
assert.match(source, /portfolio:detail-opened/);
assert.match(source, /input\.value\s*=\s*detailPrompt/);
assert.match(source, /function makeDraggable\(button\)[\s\S]*isMobileViewport\(\)[\s\S]*resetMobilePosition\(button\)/);
assert.doesNotMatch(source, /messages\.push\([^\n]*proactive/i, "Proactive invitations must not enter chat history");
assert.match(css, /\.portfolio-chatbot-invitation\s*\{[^}]*max-width:\s*280px/s);
assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.portfolio-chatbot-invitation\s*\{[^}]*max-width:\s*220px/s);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.portfolio-chatbot-invitation/);
assert.match(renderer, /data-project-title=/);
assert.match(renderer, /data-project-role=/);
assert.match(renderer, /data-showcase-family=/);
assert.match(shell, /portfolio:detail-opened/);

console.log("Chatbot proactive contract passed.");
