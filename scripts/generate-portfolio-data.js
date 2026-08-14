#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "portfolio.json");
const OUTPUT = path.join(ROOT, "assets", "js", "portfolio-data.js");

const CATEGORY_PRESENTATION = Object.freeze({
  unity: { label: "Unity", className: "unity-icon" },
  unreal: { label: "Unreal Engine", className: "unreal-icon" },
  agentic: { label: "Agentic AI", className: "applications-icon" },
  applications: { label: "Applications", className: "applications-icon" },
});

function loadCanonical() {
  return JSON.parse(fs.readFileSync(SOURCE, "utf8"));
}

function validateCanonical(data) {
  if (!data || !Array.isArray(data.projects)) {
    throw new Error("portfolio.json must contain a projects array");
  }

  const uniqueFields = ["id", "slug", "legacyId", "detailKey"];
  for (const field of uniqueFields) {
    const seen = new Set();
    for (const project of data.projects) {
      if (!project[field] || typeof project[field] !== "string") {
        throw new Error(`${project.id || "project"}: missing ${field}`);
      }
      if (seen.has(project[field])) {
        throw new Error(`duplicate ${field}: ${project[field]}`);
      }
      seen.add(project[field]);
    }
  }

  const active = data.projects.filter((project) => project.status === "active");
  for (const project of active) {
    if (!CATEGORY_PRESENTATION[project.category]) {
      throw new Error(`${project.id}: unsupported category ${project.category}`);
    }
    for (const field of ["title", "summary"]) {
      if (!project[field] || typeof project[field] !== "string") {
        throw new Error(`${project.id}: missing ${field}`);
      }
    }
    if (!project.image || !project.image.src || !project.image.alt) {
      throw new Error(`${project.id}: missing image src/alt`);
    }
  }

  const featured = active.filter((project) => project.featured);
  const orders = featured.map((project) => project.featuredOrder).sort((a, b) => a - b);
  if (featured.length !== 5 || JSON.stringify(orders) !== JSON.stringify([1, 2, 3, 4, 5])) {
    throw new Error("featured projects must have unique order 1..5");
  }

  for (const detailKey of ["citybuilder", "iceBreakingBattle", "neighborhood"]) {
    const project = data.projects.find((candidate) => candidate.detailKey === detailKey);
    if (!project || project.status !== "archived") {
      throw new Error(`${detailKey} must be archived`);
    }
  }

  return active;
}

function toRuntimeProject(project) {
  const runtime = {
    id: project.legacyId,
    title: project.title,
    category: project.category,
    detailCategory: project.detailKey,
    detailUrl: project.detailRoute || "",
    description: project.summary,
    image: {
      src: project.image.src,
      alt: project.image.alt,
    },
    tag: CATEGORY_PRESENTATION[project.category],
  };

  const links = project.runtimeLinks || {};
  if (links.apiUrlAndroid) runtime.apiUrlAndroid = links.apiUrlAndroid;
  if (links.apiUrlIos) runtime.apiUrlIos = links.apiUrlIos;
  if (project.playableUrl) runtime.demoUrl = project.playableUrl;
  if (project.externalUrl) runtime.externalUrl = project.externalUrl;
  return runtime;
}

function serialize(projects) {
  const body = JSON.stringify(projects, null, 2);
  return `// Generated from portfolio.json. Do not edit manually.\nwindow.PORTFOLIO_DATA = ${body};\n`;
}

// Compare content independent of platform line endings. Git's core.autocrlf
// rewrites the checked-out file to CRLF on Windows, so a byte-exact compare
// would report a false "out of sync" on every Windows machine.
const CR = String.fromCharCode(13);

function normalizeEol(text) {
  return text.split(CR + "\n").join("\n");
}

function generate() {
  const canonical = loadCanonical();
  const active = validateCanonical(canonical)
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);
  return serialize(active.map(toRuntimeProject));
}

function main() {
  const generated = generate();
  if (process.argv.includes("--check")) {
    const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : "";
    if (normalizeEol(current) !== normalizeEol(generated)) {
      console.error("portfolio generated data is out of sync; run npm run generate:portfolio");
      process.exit(1);
    }
    console.log("Portfolio generated data is in sync.");
    return;
  }

  const temporary = `${OUTPUT}.tmp`;
  fs.writeFileSync(temporary, generated, "utf8");
  fs.renameSync(temporary, OUTPUT);
  console.log(`Generated ${path.relative(ROOT, OUTPUT)}`);
}

if (require.main === module) main();

module.exports = { generate, loadCanonical, toRuntimeProject, validateCanonical, normalizeEol };
