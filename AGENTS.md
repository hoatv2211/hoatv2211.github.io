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
- Portfolio data: `assets/js/portfolio-data.js`
- Portfolio detail pages: `assets/portfolio-details/`
- Additional agents: `.github/agents/`
- UI/UX prompt pack: `.github/prompts/ui-ux-pro-max/`

## Guardrails
- Preserve existing site structure and naming conventions.
- Do not introduce breaking URL/path changes unless requested.
- Prefer minimal diffs and clear rollback path.
- Report findings first when doing code review.

## Done Criteria
- Feature/change implemented as requested.
- Key flows validated.
- Any residual risks stated clearly.
