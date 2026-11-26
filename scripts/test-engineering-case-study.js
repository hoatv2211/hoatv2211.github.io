#!/usr/bin/env node
"use strict";
const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("assets/js/portfolio-detail-renderer.js", "utf8"), context);
const project = {
  title: "Technical & delivery", detailKey: "example", summary: "Scope", role: "Developer",
  detail: { tier: "B", mode: "rendered", contribution: ["Built systems"], media: [],
    engineering: { challenge: "Connect <client> & backend", implementation: ["Implemented API-connected quests"], outcome: "Delivered connected progression", evidenceNote: "Inspect footage; no latency benchmark is claimed." },
    presentation: { layoutVariant: "product-console", heroMediaKey: "none", storyBeats: [] }
  }
};
const render = () => context.window.PortfolioDetailRenderer.render(project, '<section data-detail-category="example"></section>');
let html = render();
assert.match(html, /Engineering breakdown/);
assert.match(html, /Connect &lt;client&gt; &amp; backend/);
assert.match(html, /Implemented API-connected quests/);
assert.match(html, /Inspect footage; no latency benchmark is claimed\./);
assert.match(html, /mailto:hoatv\.mad@gmail\.com\?subject=Technical%20discussion/);
assert.match(html, /Download CV/);
assert.ok(html.indexOf("Engineering breakdown") < html.indexOf("Production contribution"));
delete project.detail.engineering;
html = render();
assert.doesNotMatch(html, /Engineering breakdown/);
assert.match(html, /Discuss the technical scope/);
console.log("Engineering case-study rendering and hiring CTA contract passed.");
