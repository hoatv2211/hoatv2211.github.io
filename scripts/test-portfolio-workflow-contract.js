const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const workflowPath = path.join(root, ".github", "workflows", "portfolio-quality.yml");
const workflow = fs.readFileSync(workflowPath, "utf8");
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

const sparseCheckout = workflow.match(/sparse-checkout:\s*\|([\s\S]*?)sparse-checkout-cone-mode:/)?.[1] || "";
expect(
  /^\s*\/service-worker\.js\s*$/m.test(sparseCheckout),
  "Static/data sparse checkout must include the root-scoped service worker."
);

const generationStep = workflow.match(/- name:\s*Generate portfolio data and verify sync[\s\S]*?run:\s*\|([\s\S]*?)(?=\n\s*- name:)/)?.[1] || "";
for (const generatedPath of [
  "assets/js/portfolio-data.js",
  "assets/js/portfolio-detail-index.js",
  "assets/data/portfolio-details.json",
]) {
  expect(
    generationStep.includes(generatedPath),
    `Portfolio generation step must fail when ${generatedPath} is out of sync.`
  );
}

if (failures.length) {
  console.error("Portfolio workflow contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Portfolio workflow contract passed.");
