#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "portfolio.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "scripts/generate-cv.py"), "utf8");
const normalize = value => value.replace(/\s+/g, " ").trim();

// Use the same documents interpreter as the generator; no machine-specific path.
const python = process.env.CV_PYTHON || process.env.PYTHON || "python3";
const result = spawnSync(python, ["-c", `
import json, sys
from pypdf import PdfReader
reader = PdfReader(sys.argv[1])
links = []
for page in reader.pages:
    for ref in page.get('/Annots', []):
        uri = ref.get_object().get('/A', {}).get('/URI')
        if uri:
            links.append(str(uri))
print(json.dumps({'pages': [page.extract_text() for page in reader.pages], 'links': links}))
`, path.join(root, "assets/Tran-Van-Hoa-CV.pdf")], { encoding: "utf8" });
assert.equal(result.status, 0, `PDF extraction failed; set CV_PYTHON to the documents interpreter.\n${result.stderr || result.error || ""}`);
const pdf = JSON.parse(result.stdout);
const fullText = normalize(pdf.pages.join(" "));
const profile = normalize(pdf.pages[0].split("PROFILE")[1]?.split("SELECTED RESULTS")[0] || "");

assert(source.includes('DATA["about"]["summary"]') && source.includes('DATA["about"]["pitch"]'),
  "Generator must derive the Profile from canonical about.summary and about.pitch, not an incidental tools sentence");
for (const field of ["summary", "pitch"]) {
  assert(profile.includes(normalize(data.about[field])), `PDF Profile must include canonical about.${field}`);
}
assert.match(profile, /8\+ years in the game industry/, "Eight years must describe game experience, not backend tenure");
for (const phrase of ["full-stack", "server", "system architecture", "automation", "AI", "agent workflows"]) {
  assert(profile.includes(phrase), `PDF Profile must communicate confirmed scope: ${phrase}`);
}
assert.match(fullText, /Senior Unity Developer & Technical Lead/, "Retain the formal senior Unity positioning");
assert.equal(pdf.pages.length, 3, "Preserve the original three-page CV");
assert.match(pdf.pages[1], /EXPERIENCE \/ CONTINUED/, "Preserve the experience continuation page");
assert.match(pdf.pages[2], /SELECTED PROJECTS/, "Preserve the selected-projects page");
assert.match(pdf.pages[2], /EDUCATION/, "Education must remain on page three");
for (const entry of data.experience) {
  assert(fullText.includes(normalize(entry.company)), `Preserve employer: ${entry.company}`);
  assert(fullText.includes(normalize(entry.position)), `Preserve formal role: ${entry.position}`);
  for (const highlight of entry.highlights) {
    assert(fullText.includes(normalize(highlight)), `Preserve canonical experience bullet: ${highlight}`);
  }
}
for (const key of ["idleCyber", "nekoverse", "muloren", "jx1", "dalgona"]) {
  assert(pdf.links.includes(`https://hoatv2211.github.io/?project=${key}`), `Preserve PDF project detail link: ${key}`);
}
assert(!/\(cid:/.test(fullText), "PDF must retain machine-readable bullets");
console.log("CV technical positioning passed: canonical full-stack Profile, game-scoped tenure, three pages, experience and PDF project links preserved.");
