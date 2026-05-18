# Copilot Project Instructions

This repository uses Superpowers workflow by default for non-trivial tasks.

## Required Workflow (for medium/large changes)
1. Brainstorm and confirm scope before coding.
2. Write a short implementation plan with verification steps.
3. Execute tasks in small increments and verify each step.
4. Run focused review before completion (bugs, regressions, tests).
5. Summarize changed files and validation results.

## Engineering Priorities
- Prefer small, reversible edits.
- Do not change unrelated files.
- Keep behavior stable unless the request explicitly changes behavior.
- Add or update tests when behavior changes.
- Verify production assets continue to load on desktop and mobile.

## Repo-Specific Conventions
- Main site entry: `index.html`.
- Frontend assets live under `assets/` and `js/`.
- Portfolio detail pages live under `assets/portfolio-details/`.
- Existing custom agents are in `.github/agents/`.
- Keep existing visual language unless user asks for redesign.

## Preferred Quality Checks
- For JS/HTML/CSS changes: smoke test affected pages and interactive features.
- For data updates in `assets/js/portfolio-data.js`: verify rendering paths and links.
- For game entry updates: ensure matching detail page + data entry consistency.

## Completion Checklist
- Request fully addressed.
- No unrelated refactors.
- Validation done and reported.
- Risks/assumptions called out briefly.
