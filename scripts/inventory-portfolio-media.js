#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
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

function listSparseFiles(root) {
  try {
    return new Set(execFileSync("git", ["ls-files", "-v", "-z"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).split("\0")
      .filter((entry) => entry.startsWith("S "))
      .map((entry) => entry.slice(2)));
  } catch {
    return new Set();
  }
}

function buildInventory(root) {
  const canonical = JSON.parse(fs.readFileSync(path.join(root, "portfolio.json"), "utf8"));
  const bySource = new Map();
  const sparseFiles = listSparseFiles(root);

  for (const project of canonical.projects) {
    const media = [
      ...(project.detail?.media || []),
      ...(project.detail?.bespokeMedia || []),
    ];
    for (const item of media) {
      if (!item?.src || isExternal(item.src)) continue;
      const src = item.src.replace(/&amp;/g, "&").replace(/^\/+/, "");
      if (!bySource.has(src)) bySource.set(src, { projects: new Set(), usages: [], width: item.width, height: item.height });
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
    .map(([src, entry]) => {
      const inspected = inspectFile(root, src);
      if (!inspected.exists && sparseFiles.has(src)) {
        const hasDimensions = Number.isFinite(entry.width) && Number.isFinite(entry.height);
        return {
          ...inspected,
          exists: true,
          materialized: false,
          sparse: true,
          width: hasDimensions ? entry.width : null,
          height: hasDimensions ? entry.height : null,
          bytes: null,
          orientation: hasDimensions ? orientation(entry.width, entry.height) : null,
          format: path.extname(src).slice(1).toLowerCase(),
          error: null,
          projects: [...entry.projects].sort(),
          usages: entry.usages,
        };
      }
      return {
        ...inspected,
        materialized: inspected.exists,
        sparse: false,
        projects: [...entry.projects].sort(),
        usages: entry.usages,
      };
    })
    .sort((left, right) => left.src.localeCompare(right.src));
  const missing = media.filter((item) => !item.exists || item.error);
  const budgetViolations = media.flatMap((item) => item.usages
    .map((usage) => {
      const limitBytes = (usage.featured ? 500 : 250) * 1024;
      if (!Number.isFinite(item.bytes) || item.bytes <= limitBytes) return null;
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
    totalBytes: media.reduce((sum, item) => sum + (Number.isFinite(item.bytes) ? item.bytes : 0), 0),
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

module.exports = { buildInventory, inspectFile, isExternal, listSparseFiles, orientation };