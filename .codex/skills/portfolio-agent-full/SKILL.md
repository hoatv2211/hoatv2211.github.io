---
name: portfolio-agent-full
description: Project-aware portfolio writing, editing, UI polish, asset selection, and QA for this hoatv2211.github.io repository. Use when Codex is asked to add a new portfolio project, update project copy, create or revise assets/portfolio-details/*.html, edit assets/js/portfolio-data.js, improve portfolio UI/UX, choose screenshots/videos, or validate portfolio changes.
---

# Portfolio Agent Full

Use this skill to work on this repository's portfolio site with local project context. Prefer minimal, reversible diffs and preserve public URL/path behavior unless the user explicitly asks for a breaking change.

## Start Here

1. Read `AGENTS.md` first.
2. Read [references/project-map.md](references/project-map.md) for repo structure and data flow.
3. For portfolio content work, read [references/portfolio-patterns.md](references/portfolio-patterns.md).
4. For UI polish or delivery checks, read [references/quality-checks.md](references/quality-checks.md).
5. Inspect nearby examples before editing: matching `assets/portfolio-details/*.html`, `assets/js/portfolio-data.js`, relevant CSS, and current git diff.

## Core Workflow

1. Classify request:
   - New portfolio project: add a data entry and detail fragment.
   - Existing project update: edit the matching data entry, detail fragment, assets, or links.
   - UI polish: improve existing components/CSS without changing content structure unnecessarily.
   - QA only: run validation and inspect likely breakpoints.
2. Confirm missing hard inputs only when they cannot be inferred safely: project title, canonical slug, category, role, dates, links, and primary image/video.
3. Keep `id`, `detailCategory`, detail filename, links, and image alt text consistent.
4. Reuse existing HTML section classes and CSS patterns. Do not invent a new page system.
5. Write portfolio copy in concise professional English unless user asks for Vietnamese or bilingual text.
6. Validate with `npm run validate:portfolio` after content/data edits.
7. For UI changes, run a local browser check when feasible and inspect mobile/desktop layout risks.
8. Final response must list touched files, validation result, and residual risks.

## Writing Style

- Position owner as senior Unity/game developer with technical leadership, delivery, optimization, monetization, WebGL/mobile, and GameFi experience where true.
- Prefer concrete contribution bullets over vague marketing claims.
- Avoid unverifiable metrics unless supplied by user or already present in repo.
- Use existing tone from strong detail pages such as `idleCyber.html`, `nekoverse.html`, and `jx1.html`.

## Guardrails

- Do not create files under `Games/` unless user asks for runnable WebGL builds.
- Do not rename existing detail files, ids, or public paths unless requested.
- Do not remove user edits from dirty worktree.
- Do not add broad dependencies for static portfolio tasks.
- Do not skip validation when `assets/js/portfolio-data.js` or detail fragments change.

