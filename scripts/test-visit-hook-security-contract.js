#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const source = fs.readFileSync(path.join(__dirname, "..", "assets/js/visit-telegram-hook.js"), "utf8");
const failures = [];
if (!/\/visit/.test(source)) failures.push("visit endpoint must use exact /visit route");
if (!/turnstileToken/.test(source)) failures.push("visit payload must include Turnstile token");
if (/sendBeacon|getVisitorMeta|userAgent|hardwareConcurrency|deviceMemory|referrer/.test(source)) failures.push("visit hook still collects or sends fingerprint-rich legacy data");
if (!/getTurnstileToken/.test(source)) failures.push("visit hook must use an explicit challenge-token provider");
if (!/Promise\.resolve\(\)\.then/.test(source)) failures.push("visit hook must await asynchronous Turnstile acquisition");
if (failures.length) {
  console.error(`Visit hook security contract failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("Visit hook security contract passed.");
