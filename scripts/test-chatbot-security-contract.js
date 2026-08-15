#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const source = fs.readFileSync(path.join(__dirname, "..", "assets/js/portfolio-chatbot.js"), "utf8");
const failures = [];
if (/visitorMeta\s*:/.test(source)) failures.push("chat client sends unsupported visitorMeta");
if (!/turnstileToken/.test(source)) failures.push("chat client does not send Turnstile token");
if (!/panel\.inert\s*=/.test(source)) failures.push("hidden chat panel does not disable focus with inert");
if (failures.length) {
  console.error(`Chatbot security contract failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("Chatbot security contract passed.");
