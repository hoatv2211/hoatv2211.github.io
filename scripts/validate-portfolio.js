const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "assets", "js", "portfolio-data.js");
const detailsDir = path.join(root, "assets", "portfolio-details");
const allowedCategories = new Set(["unity", "unreal", "applications", "agentic"]);

global.window = {};
require(dataPath);

const projects = window.PORTFOLIO_DATA;
const errors = [];
const warnings = [];

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function requireValue(project, field, value) {
  if (!hasValue(value)) {
    errors.push(`${project.id || "<missing id>"}: missing ${field}`);
  }
}

function checkUnique(projects, field) {
  const seen = new Map();
  projects.forEach((project) => {
    const value = project[field];
    if (!hasValue(value)) return;
    if (seen.has(value)) {
      errors.push(`${project.id}: duplicate ${field} "${value}" also used by ${seen.get(value)}`);
      return;
    }
    seen.set(value, project.id);
  });
}

if (!Array.isArray(projects)) {
  errors.push("window.PORTFOLIO_DATA must be an array");
} else {
  checkUnique(projects, "id");
  checkUnique(projects, "detailCategory");

  projects.forEach((project) => {
    requireValue(project, "id", project.id);
    requireValue(project, "title", project.title);
    requireValue(project, "category", project.category);
    requireValue(project, "detailCategory", project.detailCategory);
    requireValue(project, "description", project.description);
    requireValue(project, "image.src", project.image && project.image.src);
    requireValue(project, "image.alt", project.image && project.image.alt);
    requireValue(project, "tag.label", project.tag && project.tag.label);

    if (hasValue(project.category) && !allowedCategories.has(project.category)) {
      errors.push(`${project.id}: category "${project.category}" is not supported by portfolio filters`);
    }

    if (!project.externalUrl && hasValue(project.detailCategory)) {
      const detailPath = path.join(detailsDir, `${project.detailCategory}.html`);
      if (!fs.existsSync(detailPath)) {
        errors.push(`${project.id}: missing detail file ${path.relative(root, detailPath)}`);
      }
    }

    if (project.image && project.image.style) {
      warnings.push(`${project.id}: image.style should move to CSS/data flags in a future pass`);
    }
  });
}

warnings.forEach((warning) => console.warn(`WARN ${warning}`));

if (errors.length > 0) {
  errors.forEach((error) => console.error(`ERROR ${error}`));
  process.exit(1);
}

console.log(`Portfolio validation passed for ${projects.length} projects`);
