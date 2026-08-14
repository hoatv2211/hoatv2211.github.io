#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const root = path.resolve(__dirname, "..");
const portfolio = JSON.parse(fs.readFileSync(path.join(root, "portfolio.json"), "utf8"));
const failures = [];

function localExists(value, source) {
  if (value && typeof value === "object") value = value.src || value.url || "";
  if (typeof value !== "string") return;
  if (!value || /^https?:\/\//i.test(value) || value.startsWith("#") || value.startsWith("mailto:") || value.startsWith("tel:")) return;
  const clean = value.split(/[?#]/)[0].replace(/^\//, "");
  if (clean && !fs.existsSync(path.join(root, clean))) failures.push(`${source}: missing local path ${value}`);
}

for (const project of portfolio.projects || []) {
  if (project.status !== "active") continue;
  if (project.detailRoute) {
    if (!fs.existsSync(path.join(root, project.detailRoute.replace(/^\//, "")))) failures.push(`${project.id}: missing detailRoute`);
  } else if (!project.detailKey || !fs.existsSync(path.join(root, "assets", "portfolio-details", `${project.detailKey}.html`))) {
    failures.push(`${project.id}: missing detailRoute and detail fragment`);
  }
  localExists(project.image, `${project.id}.image`);
  localExists(project.playableUrl || project.demoUrl, `${project.id}.playableUrl`);
  for (const url of project.storeUrls || []) {
    try { new URL(url); } catch (_) { failures.push(`${project.id}: invalid store URL ${url}`); }
  }
}

for (const file of ["index.html", "backup/recruiter-clean/index.html", "backup/dev-console/index.html", "backup/game-studio/index.html"]) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`missing route ${file}`);
}

if (failures.length) {
  console.error(`Link validation failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("Link validation passed.");
process.exit(0);
