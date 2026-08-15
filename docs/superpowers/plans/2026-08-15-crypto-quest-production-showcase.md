# Crypto Quest Production Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Crypto Quest into a project-specific game-production showcase while preserving canonical data, shared rendering, accessibility, and existing detail behavior.

**Architecture:** Add optional presentation metadata to the Crypto Quest detail record, validate and generate it through the existing portfolio pipeline, and route it through a reusable `production-showcase` renderer. Existing Tier A/B/C rendering remains the fallback for every other project. CSS is scoped to the showcase variant and Crypto Quest theme.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS Grid/Flexbox, Node.js contract tests, Playwright-backed local browser QA.

**Constraint:** Do not commit automatically. The repository has a heavily dirty worktree and the user has not requested commits.

---

### Task 1: Define Presentation Data Contract

**Files:**
- Modify: `scripts/test-portfolio-detail-validation.js`
- Modify: `scripts/generate-portfolio-data.js:35`

- [ ] **Step 1: Add failing validation tests**

Extend the Tier B fixture with optional presentation data and an invalid media reference:

```js
const showcase = validCanonical();
const cryptoQuest = showcase.projects.find((project) => project.detailKey === "cryptoquest");
cryptoQuest.detail.media[0].key = "revive";
cryptoQuest.detail.presentation = {
  layoutVariant: "production-showcase",
  theme: "cryptoquest",
  eyebrow: "Turn-based GameFi RPG",
  storyBeats: [{ id: "world", kicker: "World and gameplay", title: "A connected RPG loop", body: "Players move between quests, combat, recovery, and progression.", mediaKeys: ["revive"], layout: "wide" }],
};
assert.doesNotThrow(() => validateCanonical(showcase));
const missingMedia = structuredClone(showcase);
missingMedia.projects.find((project) => project.detailKey === "cryptoquest").detail.presentation.storyBeats[0].mediaKeys = ["unknown"];
assert.throws(() => validateCanonical(missingMedia), /unknown presentation media key/);
```

- [ ] **Step 2: Run test and verify failure**

Run: `node scripts/test-portfolio-detail-validation.js`

Expected: FAIL because presentation metadata is not validated.

- [ ] **Step 3: Implement optional validation**

Add `validatePresentation(project, detail)`. Require `layoutVariant`, `theme`, `eyebrow`, and at least one story beat. Require each beat's `id`, `kicker`, `title`, `body`, `mediaKeys`, and a layout from `wide`, `split`, or `offset`. Build a set from `detail.media[].key` and reject unknown references. Call the helper after common detail checks and before tier-specific returns.

- [ ] **Step 4: Run focused validation**

Run: `node scripts/test-portfolio-detail-validation.js`

Expected: `Portfolio detail validation contract passed.`

### Task 2: Add Crypto Quest Showcase Metadata

**Files:**
- Modify: `scripts/test-detail-content-contract.js`
- Modify: `portfolio.json:2561`
- Regenerate: `assets/js/portfolio-data.js`
- Regenerate: `assets/js/portfolio-detail-index.js`
- Regenerate: `assets/data/portfolio-details.json`

- [ ] **Step 1: Add failing content assertions**

```js
const cryptoQuest = project("cryptoquest");
assert.strictEqual(cryptoQuest.detail.presentation.layoutVariant, "production-showcase");
assert.strictEqual(cryptoQuest.detail.presentation.theme, "cryptoquest");
assert.deepStrictEqual(cryptoQuest.detail.presentation.storyBeats.map((beat) => beat.id), ["world", "quests", "progression", "production"]);
assert.deepStrictEqual(cryptoQuest.detail.media.map((media) => media.key), ["revive", "quest", "npc", "home", "equipment", "tooling"]);
```

- [ ] **Step 2: Run contract and verify failure**

Run: `node scripts/test-detail-content-contract.js`

Expected: FAIL because Crypto Quest lacks presentation metadata and media keys.

- [ ] **Step 3: Add canonical showcase configuration**

Add stable keys to the six media items. Add `detail.presentation` with `layoutVariant: "production-showcase"`, `theme: "cryptoquest"`, `eyebrow: "Turn-based GameFi RPG"`, `heroMediaKey: "revive"`, and these beats:

- `world`: home image, wide layout, browser-first turn-based RPG loop.
- `quests`: quest and NPC images, split layout, dynamic objectives and actor-condition integration.
- `progression`: equipment image, offset layout, connected beasts/equipment/skills/items/localization ecosystem.
- `production`: tooling image, split layout, internal tools, live-ops fixes, and optimization.

Use only claims already present in `description`, `myContributions`, `summary`, and `detail.contribution`.

- [ ] **Step 4: Regenerate runtime data**

Run: `npm run generate:portfolio`

Expected: all three generated portfolio outputs update.

- [ ] **Step 5: Verify data contracts**

Run: `node scripts/test-detail-content-contract.js && node scripts/test-portfolio-detail-data.js && npm run check:portfolio-sync`

Expected: all commands pass.

### Task 3: Render The Production Showcase

**Files:**
- Modify: `scripts/test-detail-renderer.js`
- Modify: `assets/js/portfolio-detail-renderer.js:27`

- [ ] **Step 1: Add a failing renderer contract**

Create a showcase fixture and assert:

```js
const showcaseHtml = renderer.render(showcase, '<section project-detail data-detail-category="cryptoquest"></section>');
assert.match(showcaseHtml, /detail-case-study--production-showcase/);
assert.match(showcaseHtml, /detail-theme--cryptoquest/);
assert.match(showcaseHtml, /detail-showcase-hero/);
assert.match(showcaseHtml, /detail-production-strip/);
assert.match(showcaseHtml, /data-story-beat="quests"/);
assert.ok(showcaseHtml.indexOf("World and gameplay") < showcaseHtml.indexOf("Quest pipeline"));
assert.match(showcaseHtml, />Play Demo</);
assert.match(showcaseHtml, />Visit Website</);
assert.strictEqual((showcaseHtml.match(/src="quest\.jpg"/g) || []).length, 1);
```

Keep existing flagship, sample, and archived assertions to prove fallback rendering remains unchanged.

- [ ] **Step 2: Run renderer test and verify failure**

Run: `node scripts/test-detail-renderer.js`

Expected: FAIL because the production-showcase renderer does not exist.

- [ ] **Step 3: Implement reusable showcase primitives**

Add `mediaByKey(detail)`, `renderShowcaseActions(detail)`, `renderShowcaseHero(project, mediaMap)`, `renderProductionStrip(project)`, `renderStoryBeat(beat, mediaMap)`, and `renderProductionShowcase(project)`.

Resolve media through stable keys and reuse `renderMediaItem()` so expansion, loading, intrinsic dimensions, and escaping remain intact. Render each image once. Map evidence labels `Demo` and `Website` to `Play Demo` and `Visit Website`.

In `render()`, select the showcase renderer only when `detail.presentation.layoutVariant === "production-showcase"`; otherwise retain current Tier A/B/C rendering. Add sanitized variant and theme classes to the root.

- [ ] **Step 4: Run renderer and interaction contracts**

Run: `node scripts/test-detail-renderer.js && node scripts/test-detail-interaction.js`

Expected: both pass.

### Task 4: Build Crypto Quest Visual System

**Files:**
- Modify: `scripts/test-detail-style-contract.js`
- Modify: `assets/css/portfolio-details.css:265`

- [ ] **Step 1: Add failing CSS assertions**

```js
for (const selector of [
  ".detail-case-study--production-showcase",
  ".detail-theme--cryptoquest",
  ".detail-showcase-hero",
  ".detail-production-strip",
  ".detail-story-beat--wide",
  ".detail-story-beat--split",
  ".detail-story-beat--offset",
  "@media (prefers-reduced-motion: reduce)",
]) assert.ok(css.includes(selector), `missing showcase CSS ${selector}`);
```

- [ ] **Step 2: Run style contract and verify failure**

Run: `node scripts/test-detail-style-contract.js`

Expected: FAIL for missing showcase selectors.

- [ ] **Step 3: Add scoped showcase CSS**

Define Crypto Quest tokens for obsidian, antique gold, emerald, panel, primary text, and muted text. Implement:

- Media-dominant asymmetric hero grid.
- Inline production strip with separators instead of equal cards.
- Alternating `wide`, `split`, and `offset` story-beat layouts.
- Strong media framing, controlled crops, and visible expand affordance.
- Distinct primary and secondary CTAs.
- One-column mobile flow at `760px`, with tighter handling at `600px`.
- Reduced-motion overrides for showcase transforms and transitions.

Scope selectors under `.detail-case-study--production-showcase` or `.detail-theme--cryptoquest` so other projects are unaffected.

- [ ] **Step 4: Run style and renderer contracts**

Run: `node scripts/test-detail-style-contract.js && node scripts/test-detail-renderer.js`

Expected: both pass.

### Task 5: Verify Data, Runtime, And Visual Quality

**Files:**
- Verify: `assets/portfolio-details/cryptoquest.html`
- Verify: `index.html`
- Verify: all modified and generated files

- [ ] **Step 1: Run focused validation**

Run: `npm run validate:portfolio && npm run validate:project-routes && npm run check:portfolio-sync`

Expected: all commands pass with 22 active cards and synchronized detail data.

- [ ] **Step 2: Run complete automated suite**

Run: `npm test`

Expected: all portfolio, detail, route, security, and backup contracts pass. Report unrelated pre-existing failures instead of expanding scope.

- [ ] **Step 3: Inspect local page in Browser**

Open `http://127.0.0.1:8080`, select Crypto Quest, and inspect near 1280px and 390px widths. Verify:

- First viewport reads as a game showcase.
- Hero image, title, role, and CTA hierarchy are clear.
- Story beats follow canonical order.
- All six images render once and expand correctly.
- No horizontal overflow or clipped controls.
- Mobile is a coherent single-column editorial sequence.
- Keyboard focus and Escape-to-close remain functional.

- [ ] **Step 4: Compare released reference**

Compare local Crypto Quest with `https://hoatv2211.github.io/` for richness and project identity. Accept deliberate improvements in length, semantics, responsiveness, and claim safety; reject a return to a uniform gallery or documentation layout.

- [ ] **Step 5: Review final diff**

Run: `git diff --check` and `git diff --stat`

Expected: no whitespace errors; changes remain limited to pilot metadata, reusable primitives, generated outputs, tests, and design/plan documents.
