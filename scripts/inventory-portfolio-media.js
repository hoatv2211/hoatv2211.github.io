#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { imageSize } = require("image-size");

function isExternal(src) {
  return /^(?:https?:|data:|blob:)/i.test(src || "");
}

function orientation(width, height) {
  if (width === height) return "square";
  return width > height ? "landscape" : "portrait";
}

function inspectFile(root, src) {
  const normalized = String(src || "").replace(/&amp;/g, "&").replace(/^\/+/, "");
  const filePath = path.resolve(root, normalized);
  if (!fs.existsSync(filePath)) {
    return { src: normalized, exists: false, width: null, height: null, bytes: 0, orientation: null, error: "missing local media" };
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const dimensions = imageSize(buffer);
    if (!dimensions.width || !dimensions.height) throw new Error("dimensions unavailable");
    return {
      src: normalized,
      exists: true,
      width: dimensions.width,
      height: dimensions.height,
      bytes: buffer.length,
      orientation: orientation(dimensions.width, dimensions.height),
      format: dimensions.type || path.extname(normalized).slice(1).toLowerCase(),
      error: null,
    };
  } catch (error) {
    return { src: normalized, exists: true, width: null, height: null, bytes: fs.statSync(filePath).size, orientation: null, error: error.message };
  }
}

function buildInventory(root) {
  const canonical = JSON.parse(fs.readFileSync(path.join(root, "portfolio.json"), "utf8"));
  const bySource = new Map();

  for (const project of canonical.projects) {
    const media = [
      ...(project.detail?.media || []),
      ...(project.detail?.bespokeMedia || []),
    ];
    for (const item of media) {
      if (!item?.src || isExternal(item.src)) continue;
      const src = item.src.replace(/&amp;/g, "&").replace(/^\/+/, "");
      if (!bySource.has(src)) bySource.set(src, { projects: new Set(), usages: [] });
      const entry = bySource.get(src);
      entry.projects.add(project.detailKey);
      entry.usages.push({
        project: project.detailKey,
        featured: Boolean(item.featured),
        budgetException: item.budgetException || "",
      });
    }
  }

  const media = [...bySource.entries()]
    .map(([src, entry]) => ({
      ...inspectFile(root, src),
      projects: [...entry.projects].sort(),
      usages: entry.usages,
    }))
    .sort((left, right) => left.src.localeCompare(right.src));
  const missing = media.filter((item) => !item.exists || item.error);
  const budgetViolations = media.flatMap((item) => item.usages
    .map((usage) => {
      const limitBytes = (usage.featured ? 500 : 250) * 1024;
      if (item.bytes <= limitBytes) return null;
      return {
        project: usage.project,
        src: item.src,
        bytes: item.bytes,
        limitBytes,
        featured: usage.featured,
        budgetException: usage.budgetException,
      };
    })
    .filter(Boolean));

  return {
    generatedAt: new Date().toISOString(),
    projectCount: canonical.projects.length,
    localMediaCount: media.length,
    totalBytes: media.reduce((sum, item) => sum + item.bytes, 0),
    media,
    missing,
    budgetViolations,
  };
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function main() {
  const root = path.resolve(__dirname, "..");
  const inventory = buildInventory(root);
  const output = argumentValue("--json");
  if (output) {
    const outputPath = path.resolve(root, output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
    console.log(`Wrote ${path.relative(root, outputPath)}`);
  } else {
    console.log(JSON.stringify(inventory, null, 2));
  }

  if (inventory.missing.length) {
    for (const item of inventory.missing) console.error(`ERROR ${item.src}: ${item.error}`);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { buildInventory, inspectFile, isExternal, orientation };