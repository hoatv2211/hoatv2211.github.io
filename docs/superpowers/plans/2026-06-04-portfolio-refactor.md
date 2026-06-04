# Portfolio Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce maintenance risk in the static portfolio while preserving current URLs, content structure, and visual identity.

**Architecture:** Keep the GitHub Pages static architecture. Add lightweight validation around portfolio data and detail fragments, move inline behavior into focused JavaScript files, and remove debug/dead paths without changing public routing.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js validation scripts, GitHub Pages static hosting.

---

### Task 1: Portfolio Data Validation

**Files:**
- Create: `scripts/validate-portfolio.js`
- Modify: `package.json`

- [x] Add a Node validation script that loads `assets/js/portfolio-data.js` with a browser-like `window` object.
- [x] Check every project has `id`, `title`, `category`, `detailCategory`, `description`, `image.src`, `image.alt`, and `tag.label`.
- [x] Check `id` and `detailCategory` values are unique.
- [x] Check every non-external `detailCategory` has a matching file in `assets/portfolio-details/`.
- [x] Add `npm run validate:portfolio`.
- [x] Run `npm run validate:portfolio` and fix any reported errors.

### Task 2: Inline Media Behavior Extraction

**Files:**
- Create: `assets/js/media-orientation.js`
- Modify: `index.html`

- [x] Move the inline portrait-image observer from the end of `index.html` into `assets/js/media-orientation.js`.
- [x] Load it with `defer` alongside other page scripts.
- [x] Keep the same custom behavior: add `.portrait` to `.project-img` when image natural height exceeds natural width.
- [x] Avoid duplicate observers when scripts re-run.

### Task 3: Debug Output Cleanup

**Files:**
- Modify: `assets/js/script.js`
- Modify: `assets/js/fetchdownloadcount.js`
- Review: `assets/js/contact.js`

- [x] Remove page-load `console.log` from production runtime.
- [x] Replace expected empty download-count states with silent returns.
- [x] Keep real network failures as `console.error` because they help diagnose API problems.
- [x] Leave `assets/js/contact.js` untouched unless it is loaded by `index.html`; current page uses Formspree form handled by `bootstrap.js`.

### Task 4: Verification

**Files:**
- Test: `package.json`
- Test: `scripts/validate-portfolio.js`

- [x] Run `npm run validate:portfolio`.
- [x] Run `node --check` on changed JavaScript files.
- [x] Review `git diff --check`.
- [x] Report residual risks, especially performance items not handled by this small refactor pass.

### Task 5: Portfolio Data Cleanup

**Files:**
- Modify: `assets/js/portfolio-data.js`
- Test: `scripts/validate-portfolio.js`

- [x] Remove dead `image.style` values because the portfolio renderer does not read them.
- [x] Keep image sizing in CSS through `.project-img img` and related responsive rules.
- [x] Run `npm run validate:portfolio` and confirm the cleanup introduced no missing data fields.
