# Portfolio Backup Styles Design

## Goal

Build three standalone portfolio backup styles that reuse the existing project data and assets without changing the main portfolio route.

## Design Read

This is a developer/game portfolio for recruiters, studio clients, and technical collaborators. The backups should feel intentionally different from each other while staying credible for senior Unity/WebGL/GameFi work.

## Styles

### Recruiter Clean

Fast scan resume-style portfolio. Light background, compact proof points, clear contact actions, and direct project evidence. This variant favors readability and job application use.

### Dev Console

Dark terminal/devtool portfolio. It uses shell prompts, compact command output, build metrics, and project cards that feel like a technical runtime. This variant favors engineering credibility and agentic/devtool alignment.

### Game Studio Casebook

Media-led studio portfolio. It emphasizes large gameplay imagery, case-study rhythm, shipped work, and a premium dark presentation. This variant favors client-facing game project review.

## Architecture

Each backup is a static microsite under `backup/<style>/`. All variants load the existing `assets/js/portfolio-data.js` and a shared adapter at `backup/shared/backup-data-adapter.js`. Each style owns its own HTML, CSS, and JS so visual experiments do not leak into the main portfolio.

The adapter normalizes project data, fixes relative asset paths for nested backup routes, groups projects by category, and exposes a small `window.PortfolioBackup` API.

## Constraints

- Preserve existing main site URLs and page behavior.
- Do not duplicate portfolio data.
- Use native HTML, CSS, and vanilla JavaScript.
- Keep routes GitHub Pages friendly.
- Avoid adding new package dependencies.
- Use accessible landmarks, readable contrast, and responsive layouts.

## Routes

- `backup/recruiter-clean/index.html`
- `backup/dev-console/index.html`
- `backup/game-studio/index.html`

## Verification

- Run `npm.cmd run validate:portfolio`.
- Run `node --check` on all new JavaScript files.
- Serve locally and smoke-test each backup route.
- Capture or inspect desktop/mobile layout for obvious overlap, missing images, or broken rendering.
