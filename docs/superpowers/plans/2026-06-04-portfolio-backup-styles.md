# Portfolio Backup Styles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three standalone portfolio backup styles that reuse existing project data and do not change the main portfolio route.

**Architecture:** Add one shared data adapter under `backup/shared/`, then create three self-contained static microsites under `backup/recruiter-clean/`, `backup/dev-console/`, and `backup/game-studio/`. Each style loads `assets/js/portfolio-data.js`, uses the shared adapter, then renders its own layout with vanilla JavaScript and scoped CSS.

**Tech Stack:** HTML, CSS, vanilla JavaScript, existing `assets/js/portfolio-data.js`, GitHub Pages static hosting.

---

### Task 1: Shared Data Adapter

**Files:**
- Create: `backup/shared/backup-data-adapter.js`

- [x] Expose `window.PortfolioBackup` with helpers for nested backup pages.
- [x] Normalize project fields: `id`, `title`, `category`, `detailCategory`, `description`, `image`, `tag`, and `demoUrl`.
- [x] Convert relative asset paths to `../../` paths while leaving absolute URLs untouched.
- [x] Provide `getFeaturedProjects()`, `getProjectsByCategory()`, `getStats()`, `getContactLinks()`, and `formatCategory()`.

### Task 2: Recruiter Clean Backup

**Files:**
- Create: `backup/recruiter-clean/index.html`
- Create: `backup/recruiter-clean/style.css`
- Create: `backup/recruiter-clean/main.js`

- [x] Build an ATS-friendly portfolio page with summary, proof metrics, skills, selected work, and contact actions.
- [x] Render projects from `window.PortfolioBackup` instead of duplicating portfolio data.
- [x] Use a responsive light layout with strong text contrast and compact scanning.

### Task 3: Dev Console Backup

**Files:**
- Create: `backup/dev-console/index.html`
- Create: `backup/dev-console/style.css`
- Create: `backup/dev-console/main.js`

- [x] Build a terminal/devtool style portfolio with prompt blocks, repo tree, runtime stats, and project cards.
- [x] Render projects from `window.PortfolioBackup` and keep interactions keyboard-safe.
- [x] Use restrained dark styling, monospaced UI, and readable green/cyan accents.

### Task 4: Game Studio Casebook Backup

**Files:**
- Create: `backup/game-studio/index.html`
- Create: `backup/game-studio/style.css`
- Create: `backup/game-studio/main.js`

- [x] Build a media-led game studio portfolio with hero imagery, featured case studies, capability bands, and project grid.
- [x] Render projects from `window.PortfolioBackup` and use existing project screenshots.
- [x] Use responsive dark premium styling without generic purple gradients.

### Task 5: Verification

**Files:**
- Test: `backup/shared/backup-data-adapter.js`
- Test: `backup/recruiter-clean/main.js`
- Test: `backup/dev-console/main.js`
- Test: `backup/game-studio/main.js`

- [x] Run `npm.cmd run validate:portfolio`.
- [x] Run `node --check` on all new JavaScript files.
- [x] Start local static server and request all three backup routes.
- [x] Inspect screenshots or browser render for all three variants on desktop/mobile.
- [x] Update this checklist with completed tasks.
