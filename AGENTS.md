# AGENTS

Project-local agent guidance for this repository.

## Superpowers Default Mode
Use Superpowers-style process as the default for any multi-step coding task:
- Brainstorming
- Writing plans
- Executing plans
- Requesting code review
- Verification before completion

For tiny one-file edits, keep process lightweight but still verify outcomes.

## Project Structure Quick Notes
- Root page: `index.html`
- Canonical portfolio data: `portfolio.json`
- Generated runtime data: `assets/js/portfolio-data.js`
- Portfolio detail pages: `assets/portfolio-details/`
- Portfolio backup styles: `backup/recruiter-clean/`, `backup/dev-console/`, `backup/game-studio/`
- Backup data adapter: `backup/shared/backup-data-adapter.js`
- Additional agents: `.github/agents/`
- UI/UX prompt pack: `.github/prompts/ui-ux-pro-max/`

## Portfolio Backup Sync Rule
- Treat `portfolio.json` as the single source of truth. Generate `assets/js/portfolio-data.js` with `npm run generate:portfolio`; never edit generated records manually.
- When adding a game, changing project info, changing contact/profile content, or editing the main `index.html` portfolio surface, check whether the three backup styles also need to reflect the change.
- Do not duplicate project data inside backup pages. Update `backup/shared/backup-data-adapter.js` if the backup variants need new derived fields, labels, grouping, or links.
- Verify these routes after portfolio data or main portfolio information changes:
  - `backup/recruiter-clean/index.html`
  - `backup/dev-console/index.html`
  - `backup/game-studio/index.html`
- Keep backup routes static and GitHub Pages friendly.

## Guardrails
- Preserve existing site structure and naming conventions.
- Do not introduce breaking URL/path changes unless requested.
- Prefer minimal diffs and clear rollback path.
- Report findings first when doing code review.

## Done Criteria
- Feature/change implemented as requested.
- Key flows validated.
- Portfolio backup routes validated when project/profile/contact data changes.
- Any residual risks stated clearly.
