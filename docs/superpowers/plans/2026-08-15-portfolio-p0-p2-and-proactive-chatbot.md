# Portfolio P0-P2 And Proactive Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the portfolio audit's P0/P1/P2 findings and add a non-blocking proactive chatbot invitation bubble without fabricating project evidence.

**Architecture:** Keep `portfolio.json` canonical and preserve the shared family renderer. Add contracts before each behavior change, repair canonical records using repository history and existing public routes, make mobile overrides family-specific, and use small body/state classes for detail mode and chatbot invitations rather than project-slug CSS.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS Grid/Flexbox, Node.js contract tests, generated JSON/JavaScript data, in-app Browser QA.

**Constraints:** Preserve existing dirty-worktree changes. Do not commit, push, add dependencies, fabricate metrics, or invent unavailable project dates/assets.

---

### Task 1: Add Audit Regression Contracts

**Files:**
- Create: `scripts/test-portfolio-quality-contract.js`
- Modify: `scripts/test-detail-style-contract.js`
- Modify: `scripts/test-detail-renderer.js`
- Modify: `scripts/test-home-experience-contract.js`
- Modify: `package.json`

- [ ] Add a failing quality contract that loads `portfolio.json` and asserts:
  - `citybuilder` does not reference `assets/images/game/Archero/` and contains no Archero copy.
  - No project contains duplicate media `src` values.
  - Archived Compact Proof records may be text-only but cannot reference another project's assets.
  - `Meow Flow`, `City Builder`, and `Neighborhood Defense` use presentation-ready display titles.
  - Evidence labels are supported by the renderer and every evidence URL is non-empty.
- [ ] Add failing CSS assertions for family-specific mobile overrides:

```js
assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.detail-showcase--mobile-campaign \.detail-showcase-hero[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.detail-showcase--product-console \.detail-showcase-hero[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
```

- [ ] Add a renderer fixture proving an archived Compact Proof with no media renders an honest status panel without throwing.
- [ ] Add home-experience assertions for one showcase detail CTA intent, compact mobile navigation, and detail-mode shell hooks.
- [ ] Add `node scripts/test-portfolio-quality-contract.js` to `npm test`.
- [ ] Run the focused contracts and verify they fail for the expected current defects.

### Task 2: Repair P0 Canonical Data

**Files:**
- Modify: `portfolio.json`
- Modify: `scripts/generate-portfolio-data.js`
- Modify: `assets/js/portfolio-detail-renderer.js`
- Regenerate: `assets/js/portfolio-data.js`
- Regenerate: `assets/js/portfolio-detail-index.js`
- Regenerate: `assets/data/portfolio-details.json`

- [ ] Change `citybuilder` to display title `City Builder`, remove all Archero media and Arrow Survival notes, retain the archived status, and use an honest archive reason such as `Original project media and verified production notes are unavailable in the current portfolio archive.`
- [ ] Allow `compact-proof` records with `status === "archived"` to use an empty media array and no hero key. Keep active samples/media-bearing compact records subject to existing hero validation.
- [ ] Render text-only archived Compact Proof records with status, title, archive reason, and technical notes, but no empty media wrapper.
- [ ] Remove the duplicated second Metame image, keep the verified hero image once, and make its single editorial story beat text-only with an empty `mediaKeys` array.
- [ ] Update story validation to permit an empty `mediaKeys` array while still rejecting unknown or repeated keys.
- [ ] Rename `Meow flow` to `Meow Flow` and `neighborhood` to `Neighborhood Defense` without changing `detailKey`, slug, file, or route identifiers.
- [ ] Run `npm run generate:portfolio`, quality validation, renderer tests, and sync validation until green.

### Task 3: Fix P0 Mobile Family Layouts

**Files:**
- Modify: `assets/css/portfolio-details.css`
- Modify: `scripts/test-detail-style-contract.js`

- [ ] Add family-specific selectors inside the existing `max-width: 760px` block so Mobile Campaign and Product Console hero grids collapse to one column despite desktop selector specificity.
- [ ] Reset Product Console negative/right overlap margins on mobile and constrain all hero children with `min-width: 0; width: 100%`.
- [ ] Ensure Mobile Campaign hero media uses `width: min(86vw, 340px)` only after the single-column override.
- [ ] Add a narrow-screen rule for long titles so they remain within the detail container and do not rely on `overflow: hidden` to mask clipping.
- [ ] Run style contracts and visually verify Archero and ProxyAPI at 320px and 390px with every hero/copy rectangle inside the viewport.

### Task 4: Improve P1 Site Shell And Primary Sections

**Files:**
- Modify: `index.html`
- Modify: `assets/js/script.js`
- Modify: `assets/js/gaming-showcase.js`
- Modify: `assets/css/style.css`
- Modify: `assets/css/modern-enhancements.css`
- Modify: `scripts/test-home-experience-contract.js`

- [ ] Add a `portfolio-detail-open` body class in the existing detail open/close flow.
- [ ] While detail mode is active, hide the Portfolio heading, filter controls, showcase carousel, and project grid; show a compact back bar so the selected project's identity starts near the top of the content panel.
- [ ] Remove the second `DETAIL` button when the showcase item's primary action already opens the same detail. Preserve `PLAY NOW` plus one `VIEW DETAIL` action when both intents differ.
- [ ] Reduce the About visual/banner height on mobile so `About me` begins within the first viewport and keep the profile identity card compact.
- [ ] Replace the wrapping mobile navbar with a single horizontal, safe-area-aware row. Keep all destinations reachable, use the shortened `Telegram` label, and ensure the bar does not cover the last content block.
- [ ] Make GitShare cards fluid at tablet widths, remove fixed 700px card widths, prevent document overflow, and visually integrate repository cards with the dark portfolio surface.
- [ ] Hide the backup-style toggle by default on the public page and reveal it only when the URL contains `?backups=1`, preserving the existing selector implementation for development review.
- [ ] Add bottom padding to active articles based on navbar/chatbot safe areas.
- [ ] Run home experience, smoke, and backup route contracts.

### Task 5: Complete P2 Evidence And Recruiter Copy

**Files:**
- Modify: `portfolio.json`
- Modify: `scripts/test-portfolio-quality-contract.js`
- Regenerate: generated portfolio outputs

- [ ] Restore evidence-backed periods from tracked historical detail pages:
  - Shiba Inu `2024 — 2025`
  - Archero `2020 — 2021`
  - Rise of Trial Bike `2021 — 2022`
  - Meow Flow `2021 — 2022`
  - Home Design `2021 — 2022`
  - Tile Candy `2020 — 2021`
  - Tiles Match 3 `2023 — 2024`
  - Sudoku `2024 — 2025`
  - Survivor.IO `2021 — 2022`
- [ ] Add only verified public evidence from tracked history or existing repository routes:
  - Shiba Inu demo and Google Play.
  - Archero local WebGL demo.
  - Rise of Trial Bike App Store.
  - Meow Flow Google Play.
  - Home Design local demo and Google Play alongside Sensor Tower.
  - Tile Candy, Tiles Match 3, and Sudoku local demos; add their verified Google Play links.
  - Age of Battle, Galaxiga, Ludo, and Pixel Shooter public demos.
  - Survivor.IO local/public demo only; do not present the original inspiration's store page as Hoa's shipped proof.
  - Ice Breaking Battle Google Play and Sensor Tower.
  - Neighborhood Defense local demo.
- [ ] Add poster images to the two sample embeds using `assets/images/game/ludo.jpg` and `assets/images/game/pixcelshooter.png`.
- [ ] Use `Demo`, `Google Play`, `App Store`, and `Sensor Tower Android` labels already supported by the renderer; extend the mapping only if a genuinely new evidence label is required.
- [ ] Fix missing terminal punctuation and sentence joins in MU Loren, JX1, Dalgona, Idle Cyber, and Nekoverse story bodies.
- [ ] Do not invent periods, roles, teams, or platforms for Galaxiga, Age of Battle, Metame, or archived records when history does not establish them.
- [ ] Change showcase closing actions to render only evidence actions not already shown in the hero, eliminating duplicate CTA intent. Omit closing actions when no additional evidence remains.
- [ ] Regenerate canonical outputs and run content, link, renderer, quality, and backup contracts.

### Task 6: Add Proactive Chatbot Invitation Bubble

**Files:**
- Create: `scripts/test-chatbot-proactive-contract.js`
- Modify: `assets/js/portfolio-chatbot.js`
- Modify: `assets/css/portfolio-chatbot.css`
- Modify: `package.json`

- [ ] Write a failing contract for the approved configuration defaults: enabled, 5000ms delay, 4000ms visible time, maximum four invitations, general/contextual message pools, session storage, visibility handling, and no insertion into persistent chat history.
- [ ] Add a speech-bubble element adjacent to the existing pet button with `role="status"`, `aria-live="polite"`, a keyboard-accessible message action, and an explicit close control.
- [ ] Build a shuffled, no-repeat per-session queue that prefers the current About/Resume/Portfolio/detail/GitShare contextual invitation before general invitations.
- [ ] Use one schedule timer and one dismissal timer. Pause on hidden documents and restart a fresh five-second delay on visibility restoration.
- [ ] Stop proactive invitations for the session when the user opens the panel, clicks/dismisses the invitation, types, submits, starts a new chat, or reaches the maximum count.
- [ ] Keep invitation state out of the persistent `Messages` storage and out of remote endpoint payloads.
- [ ] Position the bubble above/left of the pet, cap it at 280px desktop and 220px mobile, keep it above the fixed navbar, and disable motion under `prefers-reduced-motion`.
- [ ] Reduce the default mobile pet footprint to avoid covering project screenshots while preserving the existing drag behavior on larger screens.
- [ ] Run proactive, security, and home-experience contracts.

### Task 7: Full Verification And Browser QA

**Files:**
- Modify only if a regression is found in touched scope.

- [ ] Run:

```powershell
npm run generate:portfolio
npm run check:portfolio-sync
npm test
node --check assets/js/portfolio-chatbot.js
node --check assets/js/portfolio-detail-renderer.js
node --check assets/js/script.js
git diff --check
```

- [ ] Browser QA at 1280px, 768px, 390px, and 320px for About, Resume, Portfolio, GitShare, chatbot, and representative details: MU Loren, Archero, Shiba Inu, ProxyAPI, Ludo, Metame, City Builder, and Neighborhood Defense.
- [ ] Verify no hero/copy rectangle exceeds the viewport, no horizontal document overflow, fixed controls do not cover the final content, and project details begin without the listing UI.
- [ ] Verify proactive invitations appear after five seconds, auto-hide, do not repeat, stop on interaction, pause in a hidden tab, open the chatbot on click, and never enter chat history.
- [ ] Verify media viewer keyboard behavior, CTA targets, reduced motion, focus visibility, generated sync, all three backup routes, and all 25 detail payloads.
- [ ] Report remaining evidence gaps explicitly; do not replace unavailable proof with guessed claims.
