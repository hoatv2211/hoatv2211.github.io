#!/usr/bin/env node
"use strict";

const assert = require("assert");
const { loadCanonical, validateCanonical } = require("./generate-portfolio-data");

function validDetail(project) {
  const tier = ["dalgona", "idleCyber", "muloren", "nekoverse", "jx1"].includes(project.detailKey)
    ? "A"
    : (project.status === "archived" || ["share001-ludo", "share002-pixelshooter3d"].includes(project.detailKey) ? "C" : "B");

  if (project.status === "archived") {
    return {
      tier,
      mode: "archived",
      statusLabel: "Archived / legacy work",
      archiveReason: "Preserved for historical portfolio compatibility.",
    };
  }

  if (tier === "C") {
    return {
      tier,
      mode: "rendered",
      statusLabel: "Sample",
      purpose: "Demonstrates a focused gameplay implementation sample.",
      technicalNotes: ["Implemented as a compact portfolio sample."],
      media: [{ type: "demo", src: "https://example.invalid/demo", label: "Open demo" }],
    };
  }

  if (tier === "A") {
    return {
      tier,
      mode: "hybrid",
      statusLabel: "Flagship case study",
      context: "Production project context.",
      problem: "Production delivery problem.",
      contribution: ["Implemented assigned production systems."],
      technicalDecisions: ["Used project-appropriate Unity architecture."],
      personalOutcome: ["Delivered assigned systems."],
      productContext: ["Product context is separated from personal contribution."],
      evidence: [{ label: "Project page", url: "https://example.invalid/project", status: "owner-approved" }],
      media: [1, 2, 3, 4].map((index) => ({
        type: "image",
        src: `assets/images/test-${index}.png`,
        alt: `Project evidence ${index}`,
        width: 100,
        height: 100,
        fit: "cover",
      })),
    };
  }

  return {
    tier,
    mode: "hybrid",
    statusLabel: "Project case study",
    contribution: [
      "Implemented assigned gameplay systems.",
      "Integrated project services and UI flows.",
      "Supported optimization and release delivery.",
    ],
    media: [1, 2].map((index) => ({
      type: "image",
      src: `assets/images/test-${index}.png`,
      alt: `Project evidence ${index}`,
      width: 100,
      height: 100,
      fit: "cover",
    })),
  };
}

function validCanonical() {
  const canonical = structuredClone(loadCanonical());
  for (const project of canonical.projects) project.detail = validDetail(project);
  return canonical;
}

assert.doesNotThrow(() => validateCanonical(validCanonical()));

const missingDetail = validCanonical();
delete missingDetail.projects[0].detail;
assert.throws(() => validateCanonical(missingDetail), /missing detail/);

const invalidMode = validCanonical();
invalidMode.projects[0].detail.mode = "legacy";
assert.throws(() => validateCanonical(invalidMode), /unsupported detail mode/);

const incompleteFlagship = validCanonical();
delete incompleteFlagship.projects.find((project) => project.detailKey === "dalgona").detail.problem;
assert.throws(() => validateCanonical(incompleteFlagship), /dalgona: missing detail\.problem/);

const incompleteSupporting = validCanonical();
incompleteSupporting.projects.find((project) => project.detailKey === "cryptoquest").detail.contribution = ["One", "Two"];
assert.throws(() => validateCanonical(incompleteSupporting), /cryptoquest: detail\.contribution requires at least 3 items/);

const showcase = validCanonical();
const showcaseProject = showcase.projects.find((project) => project.detailKey === "cryptoquest");
showcaseProject.detail.media[0].key = "revive";
showcaseProject.detail.media[1].key = "support";
showcaseProject.detail.presentation = {
  layoutVariant: "production-showcase",
  theme: "cryptoquest",
  eyebrow: "Turn-based GameFi RPG",
  heroMediaKey: "revive",
  palette: {
    ink: "#080a14",
    panel: "#111a35",
    accent: "#d9a84e",
    accentAlt: "#43bb79",
    text: "#f8f5eb",
    muted: "#aeb6ce",
  },
  storyBeats: [{
    id: "world",
    kicker: "World and gameplay",
    title: "A connected RPG loop",
    body: "Players move between quests, combat, recovery, and progression.",
    mediaKeys: ["support"],
    layout: "wide",
  }],
};
assert.doesNotThrow(() => validateCanonical(showcase));

const missingPresentationMedia = structuredClone(showcase);
missingPresentationMedia.projects.find((project) => project.detailKey === "cryptoquest")
  .detail.presentation.storyBeats[0].mediaKeys = ["unknown"];
assert.throws(() => validateCanonical(missingPresentationMedia), /unknown presentation media key/);

const invalidFamily = structuredClone(showcase);
invalidFamily.projects.find((project) => project.detailKey === "cryptoquest").detail.presentation.layoutVariant = "one-template";
assert.throws(() => validateCanonical(invalidFamily), /unsupported presentation family/);

const invalidPalette = structuredClone(showcase);
invalidPalette.projects.find((project) => project.detailKey === "cryptoquest").detail.presentation.palette.accent = "gold";
assert.throws(() => validateCanonical(invalidPalette), /invalid presentation palette/);

const compact = validCanonical();
const compactProject = compact.projects.find((project) => project.detailKey === "share001-ludo");
compactProject.detail.media[0].key = "demo";
compactProject.detail.presentation = {
  layoutVariant: "compact-proof",
  theme: "ludo-sample",
  eyebrow: "Playable sample",
  heroMediaKey: "demo",
  palette: {
    ink: "#0b1020",
    panel: "#18213a",
    accent: "#f2b84b",
    accentAlt: "#4fc18a",
    text: "#f7f7f2",
    muted: "#b5bdd0",
  },
  storyBeats: [],
};
assert.doesNotThrow(() => validateCanonical(compact));

const incompleteArchive = validCanonical();
delete incompleteArchive.projects.find((project) => project.detailKey === "citybuilder").detail.archiveReason;
assert.throws(() => validateCanonical(incompleteArchive), /citybuilder: missing detail\.archiveReason/);

console.log("Portfolio detail validation contract passed.");
