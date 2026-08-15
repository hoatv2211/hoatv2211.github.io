#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "portfolio.json");
const OUTPUTS = Object.freeze({
  cards: path.join(ROOT, "assets", "js", "portfolio-data.js"),
  detailIndex: path.join(ROOT, "assets", "js", "portfolio-detail-index.js"),
  detailPayload: path.join(ROOT, "assets", "data", "portfolio-details.json"),
});

const CATEGORY_PRESENTATION = Object.freeze({
  unity: { label: "Unity", className: "unity-icon" },
  unreal: { label: "Unreal Engine", className: "unreal-icon" },
  agentic: { label: "Agentic AI", className: "applications-icon" },
  applications: { label: "Applications", className: "applications-icon" },
});

const TIER_A_KEYS = new Set(["dalgona", "idleCyber", "muloren", "nekoverse", "jx1"]);
const SAMPLE_KEYS = new Set(["share001-ludo", "share002-pixelshooter3d"]);
const SHOWCASE_FAMILIES = new Set([
  "production-showcase",
  "flagship-worlds",
  "mobile-campaign",
  "gameplay-editorial",
  "product-console",
  "compact-proof",
]);
const SHOWCASE_LAYOUTS = new Set(["wide", "split", "offset", "rail", "stack", "console"]);
const SHOWCASE_PALETTE_KEYS = ["ink", "panel", "accent", "accentAlt", "text", "muted"];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function loadCanonical() {
  return JSON.parse(fs.readFileSync(SOURCE, "utf8"));
}

function requireString(project, pathName, value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${project.detailKey}: missing ${pathName}`);
  }
}

function requireArray(project, pathName, value, minimum) {
  if (!Array.isArray(value) || value.length < minimum) {
    throw new Error(`${project.detailKey}: ${pathName} requires at least ${minimum} items`);
  }
}

function validatePresentation(project, detail) {
  const presentation = detail.presentation;
  if (!presentation) return;

  requireString(project, "detail.presentation.layoutVariant", presentation.layoutVariant);
  if (!SHOWCASE_FAMILIES.has(presentation.layoutVariant)) {
    throw new Error(`${project.detailKey}: unsupported presentation family ${presentation.layoutVariant}`);
  }
  requireString(project, "detail.presentation.theme", presentation.theme);
  requireString(project, "detail.presentation.eyebrow", presentation.eyebrow);
  requireString(project, "detail.presentation.heroMediaKey", presentation.heroMediaKey);
  if (!presentation.palette || typeof presentation.palette !== "object") {
    throw new Error(`${project.detailKey}: missing detail.presentation.palette`);
  }
  for (const paletteKey of SHOWCASE_PALETTE_KEYS) {
    if (!HEX_COLOR.test(presentation.palette[paletteKey] || "")) {
      throw new Error(`${project.detailKey}: invalid presentation palette ${paletteKey}`);
    }
  }
  const compact = presentation.layoutVariant === "compact-proof";
  requireArray(project, "detail.presentation.storyBeats", presentation.storyBeats, compact ? 0 : 1);

  const mediaKeys = new Set();
  for (const media of detail.media || []) {
    requireString(project, "detail.media.key", media.key);
    if (mediaKeys.has(media.key)) throw new Error(`${project.detailKey}: duplicate presentation media key ${media.key}`);
    mediaKeys.add(media.key);
  }

  if (!mediaKeys.has(presentation.heroMediaKey)) {
    throw new Error(`${project.detailKey}: unknown presentation media key ${presentation.heroMediaKey}`);
  }

  const usedMediaKeys = new Set([presentation.heroMediaKey]);
  for (const beat of presentation.storyBeats) {
    requireString(project, "detail.presentation.storyBeat.id", beat.id);
    requireString(project, "detail.presentation.storyBeat.kicker", beat.kicker);
    requireString(project, "detail.presentation.storyBeat.title", beat.title);
    requireString(project, "detail.presentation.storyBeat.body", beat.body);
    requireArray(project, "detail.presentation.storyBeat.mediaKeys", beat.mediaKeys, 1);
    if (!SHOWCASE_LAYOUTS.has(beat.layout)) {
      throw new Error(`${project.detailKey}: unsupported story beat layout ${beat.layout}`);
    }
    for (const mediaKey of beat.mediaKeys) {
      if (!mediaKeys.has(mediaKey)) throw new Error(`${project.detailKey}: unknown presentation media key ${mediaKey}`);
      if (usedMediaKeys.has(mediaKey)) throw new Error(`${project.detailKey}: duplicate presentation media reference ${mediaKey}`);
      usedMediaKeys.add(mediaKey);
    }
  }

  if (!compact && usedMediaKeys.size !== mediaKeys.size) {
    const unused = [...mediaKeys].filter((mediaKey) => !usedMediaKeys.has(mediaKey));
    throw new Error(`${project.detailKey}: unused presentation media ${unused.join(", ")}`);
  }
}

function validateDetail(project) {
  const detail = project.detail;
  if (!detail || typeof detail !== "object") {
    throw new Error(`${project.detailKey}: missing detail`);
  }
  if (!["A", "B", "C"].includes(detail.tier)) {
    throw new Error(`${project.detailKey}: unsupported detail tier ${detail.tier}`);
  }
  if (!["rendered", "hybrid", "archived"].includes(detail.mode)) {
    throw new Error(`${project.detailKey}: unsupported detail mode ${detail.mode}`);
  }
  requireString(project, "detail.statusLabel", detail.statusLabel);
  validatePresentation(project, detail);

  if (detail.tier === "A") {
    requireString(project, "role", project.role);
    requireString(project, "period", project.period);
    requireArray(project, "platforms", project.platforms, 1);
    requireString(project, "detail.context", detail.context);
    requireString(project, "detail.problem", detail.problem);
    requireArray(project, "detail.contribution", detail.contribution, 1);
    requireArray(project, "detail.technicalDecisions", detail.technicalDecisions, 1);
    requireArray(project, "detail.personalOutcome", detail.personalOutcome, 1);
    requireArray(project, "detail.productContext", detail.productContext, 1);
    requireArray(project, "detail.evidence", detail.evidence, 1);
    requireArray(project, "detail.media", detail.media, 4);
    return;
  }

  if (detail.tier === "B") {
    requireArray(project, "platforms", project.platforms, 0);
    requireArray(project, "detail.contribution", detail.contribution, 3);
    requireArray(project, "detail.media", detail.media, 2);
    return;
  }

  if (project.status === "archived") {
    if (project.type !== "archived" || detail.mode !== "archived") {
      throw new Error(`${project.detailKey}: archived project requires archived type and mode`);
    }
    requireString(project, "detail.archiveReason", detail.archiveReason);
    return;
  }

  requireString(project, "detail.purpose", detail.purpose);
  requireArray(project, "detail.technicalNotes", detail.technicalNotes, 1);
  requireArray(project, "detail.media", detail.media, 1);
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

  for (const project of data.projects) validateDetail(project);

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

function inferTier(project) {
  if (TIER_A_KEYS.has(project.detailKey)) return "A";
  if (project.status === "archived" || SAMPLE_KEYS.has(project.detailKey)) return "C";
  return "B";
}

function compactRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function toDetailIndex(project) {
  return {
    detailKey: project.detailKey,
    status: project.status,
    type: project.type,
    tier: project.detail?.tier || inferTier(project),
  };
}

function toDetailPayload(project) {
  return compactRecord({
    id: project.id,
    title: project.title,
    detailKey: project.detailKey,
    status: project.status,
    type: project.type,
    role: project.role,
    teamSize: project.teamSize,
    period: project.period,
    platforms: project.platforms,
    summary: project.summary,
    detail: project.detail,
  });
}

function serializeAssignment(property, value) {
  return `// Generated from portfolio.json. Do not edit manually.\nwindow.${property} = ${JSON.stringify(value, null, 2)};\n`;
}

function serializePayload(projects) {
  return `${JSON.stringify({ projects }, null, 2)}\n`;
}

const CR = String.fromCharCode(13);

function normalizeEol(text) {
  return text.split(CR + "\n").join("\n");
}

function generateOutputs() {
  const canonical = loadCanonical();
  const active = validateCanonical(canonical)
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const allProjects = canonical.projects.slice().sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    cards: serializeAssignment("PORTFOLIO_DATA", active.map(toRuntimeProject)),
    detailIndex: serializeAssignment("PORTFOLIO_DETAIL_INDEX", allProjects.map(toDetailIndex)),
    detailPayload: serializePayload(allProjects.map(toDetailPayload)),
  };
}

function generate() {
  return generateOutputs().cards;
}

function writeAtomic(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, content, "utf8");
  fs.renameSync(temporary, filePath);
}

function main() {
  const generated = generateOutputs();

  if (process.argv.includes("--check")) {
    const mismatches = Object.entries(OUTPUTS).filter(([key, filePath]) => {
      const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
      return normalizeEol(current) !== normalizeEol(generated[key]);
    });

    if (mismatches.length) {
      console.error(`portfolio generated data is out of sync: ${mismatches.map(([, filePath]) => path.relative(ROOT, filePath)).join(", ")}; run npm run generate:portfolio`);
      process.exit(1);
    }
    console.log("Portfolio generated data is in sync.");
    return;
  }

  for (const [key, filePath] of Object.entries(OUTPUTS)) {
    writeAtomic(filePath, generated[key]);
    console.log(`Generated ${path.relative(ROOT, filePath)}`);
  }
}

if (require.main === module) main();

module.exports = {
  generate,
  generateOutputs,
  inferTier,
  loadCanonical,
  normalizeEol,
  toDetailIndex,
  toDetailPayload,
  toRuntimeProject,
  validateCanonical,
};
