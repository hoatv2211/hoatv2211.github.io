---
name: game-production-showcase
description: Redesign and maintain portfolio project details in this repository as evidence-safe game-production showcases. Use when assigning showcase families, adding detail.presentation metadata, styling project-specific themes, extending shared portfolio detail renderers, or visually QAing assets/portfolio-details projects.
---

# Game Production Showcase

Turn project details into shipped-product showcases, not technical documentation.

## Start

1. Read `AGENTS.md` and `.codex/skills/portfolio-agent-full/SKILL.md`.
2. Read `references/family-map.md`, `references/presentation-schema.md`, and `references/qa-checklist.md`.
3. Inspect `portfolio.json`, the project's media, the shared renderer/CSS, current diff, and the released reference when relevant.
4. State one design read with audience, product identity, and design dials before editing.

## Workflow

1. Confirm the family from `references/family-map.md`.
2. Derive palette and framing from existing project media.
3. Write concise story beats using only canonical claims and evidence.
4. Add presentation data to `portfolio.json`; never hand-edit generated runtime records.
5. Extend renderer/CSS by family, never by project slug.
6. Use TDD for validation, renderer, and style behavior.
7. Run `npm run generate:portfolio`, focused contracts, then `npm test`.
8. Run desktop and 390px Browser QA using `references/qa-checklist.md`.

## Quality Bar

- The first viewport identifies the product, role, and proof.
- Media tells a sequence; it is not a uniform gallery dump.
- Flagships differ through composition as well as color.
- Portrait screenshots remain large enough to read.
- Samples and archives remain compact and honestly labeled.
- Every media item renders once unless the data explicitly documents a justified repeat.
- Public URLs, lazy loading, media expansion, focus states, and reduced motion remain intact.

## Guardrails

- Keep `portfolio.json` canonical.
- Preserve ids, slugs, filenames, and public paths.
- Prefer existing assets; do not fabricate screenshots or project metrics.
- Keep copy in professional English unless the user requests otherwise.
- Protect unrelated dirty-worktree changes.
- Do not commit, push, or create a PR without explicit instruction.

## Delivery

Report changed files, generated outputs, test results, browser breakpoints checked, and residual risks.
