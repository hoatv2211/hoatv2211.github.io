#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const required = ["robots.txt", "sitemap.xml", "404.html"];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Site metadata contract failed: missing ${missing.join(", ")}`);
  process.exit(1);
}
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
if (!robots.includes("Sitemap: https://hoatv2211.github.io/sitemap.xml")) throw new Error("robots.txt sitemap missing");
if (!sitemap.includes("https://hoatv2211.github.io/index.html")) throw new Error("sitemap homepage missing");
console.log("Site metadata contract passed.");
