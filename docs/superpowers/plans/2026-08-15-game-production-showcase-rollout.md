# Game Production Showcase Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a specialized repo-local skill and GitHub agent, then migrate the remaining 24 portfolio details into five data-driven game-production showcase families.

**Architecture:** `portfolio.json` remains canonical. Optional `detail.presentation` metadata selects a family, palette, hero media, and ordered story beats. Shared renderer primitives dispatch by family rather than project slug; structural CSS is family-scoped and project identity is supplied through validated theme tokens.

**Tech Stack:** Vanilla JavaScript, JSON, CSS Grid/Flexbox, Node.js contract tests, Codex skill metadata, static GitHub Pages, in-app Browser QA.

**Constraint:** Do not commit, push, or discard existing dirty-worktree changes.

---

### Task 1: Create Skill And Agent Contract

**Files:**
- Create: `.codex/skills/game-production-showcase/SKILL.md`
- Create: `.codex/skills/game-production-showcase/agents/openai.yaml`
- Create: `.codex/skills/game-production-showcase/references/family-map.md`
- Create: `.codex/skills/game-production-showcase/references/presentation-schema.md`
- Create: `.codex/skills/game-production-showcase/references/qa-checklist.md`
- Create: `.github/agents/game-production-showcase.agent.md`
- Create: `scripts/test-game-production-showcase-skill.js`
- Modify: `package.json`

- [ ] Write a failing contract that requires every skill file, valid frontmatter, `openai.yaml`, the five family identifiers, and a thin GitHub agent that references the skill path.
- [ ] Run `node scripts/test-game-production-showcase-skill.js` and verify failure.
- [ ] Create the concise skill, references, UI metadata, and thin agent using the approved design spec.
- [ ] Add the skill contract to `npm test`.
- [ ] Run the skill contract and verify success.

### Task 2: Expand Presentation Validation

**Files:**
- Modify: `scripts/test-portfolio-detail-validation.js`
- Modify: `scripts/test-detail-content-contract.js`
- Modify: `scripts/generate-portfolio-data.js`

- [ ] Add failing tests for the supported families: `flagship-worlds`, `mobile-campaign`, `gameplay-editorial`, `product-console`, `compact-proof`, and the existing `production-showcase` pilot.
- [ ] Require safe six-digit hex palette values, valid hero references, unique media keys, allowed story layouts, and full media coverage for non-compact families.
- [ ] Require Compact Proof for samples and archived records after rollout; allow empty story beats only for Compact Proof.
- [ ] Add a content contract asserting every one of the 25 projects has presentation metadata and exactly one supported family.
- [ ] Run validation/content contracts and verify they fail before canonical migration.
- [ ] Implement the family-aware validator and keep old Tier A/B/C validation as compatibility checks.

### Task 3: Migrate Canonical Project Presentation

**Files:**
- Modify: `portfolio.json`
- Regenerate: `assets/js/portfolio-data.js`
- Regenerate: `assets/js/portfolio-detail-index.js`
- Regenerate: `assets/data/portfolio-details.json`

- [ ] Assign stable media keys to all media records not already keyed.
- [ ] Add family, project theme, accessible eyebrow, hero key, safe palette, and evidence-backed story beats to the five Flagship Worlds projects.
- [ ] Add portrait-first metadata to the seven Mobile Campaign projects.
- [ ] Add mixed-media editorial metadata to the six Gameplay Editorial projects.
- [ ] Add dashboard journey metadata to ProxyAPI.MAD.
- [ ] Add honest compact metadata to two samples and three archived projects.
- [ ] Ensure every media item appears exactly once as hero, story media, or Compact Proof gallery media.
- [ ] Run `npm run generate:portfolio` and verify generated data synchronization.
- [ ] Run detail validation and content contracts until green.

### Task 4: Build Family Renderers

**Files:**
- Modify: `scripts/test-detail-renderer.js`
- Modify: `assets/js/portfolio-detail-renderer.js`

- [ ] Add failing fixtures for all five new families plus the Crypto Quest pilot.
- [ ] Assert semantic family classes, dynamic project titles, evidence actions, media uniqueness, hero loading priority, and lazy supporting media.
- [ ] Generalize action rendering for Website, Demo, WebGL, stores, trailers, World App, GitHub, and market-proof links.
- [ ] Add shared narrative primitives and explicit family dispatch without slug checks.
- [ ] Add a portrait rail for Mobile Campaign, editorial sequencing for Gameplay Editorial, dashboard journey for Product Console, and concise proof/gallery rendering for Compact Proof.
- [ ] Preserve existing Tier A/B/C fallback behavior and media-viewer hooks.
- [ ] Run renderer and interaction contracts until green.

### Task 5: Build Family Visual Systems

**Files:**
- Modify: `scripts/test-detail-style-contract.js`
- Modify: `assets/css/portfolio-details.css`

- [ ] Add failing CSS contract assertions for all family roots, portrait rail, editorial split, console journey, compact proof, palette variables, focus states, desktop/mobile breakpoints, and reduced motion.
- [ ] Implement shared showcase tokens with inline validated palette overrides.
- [ ] Build premium flexible rhythm for Flagship Worlds without forcing identical compositions.
- [ ] Build readable portrait rails and staggered device framing for Mobile Campaign.
- [ ] Build media-led alternating layouts for Gameplay Editorial.
- [ ] Build structured interface framing for Product Console.
- [ ] Build concise status-first presentation for Compact Proof.
- [ ] Keep selectors family-scoped so fallback projects and the global shell remain unaffected.
- [ ] Run style and renderer contracts until green.

### Task 6: Verify Coverage And Visual Quality

**Files:**
- Verify: all canonical, generated, renderer, CSS, skill, agent, and contract files

- [ ] Run `npm run generate:portfolio` and `npm run check:portfolio-sync`.
- [ ] Run `npm test` and record the complete result.
- [ ] Run `node --check` on every modified JavaScript file.
- [ ] Run `git diff --check` and inspect scoped diffs for slug conditionals, unsupported claims, duplicated media, or unrelated edits.
- [ ] Use Browser at desktop and 390px for all five flagships plus one representative from Mobile Campaign, Gameplay Editorial, Product Console, and Compact Proof.
- [ ] Verify zero horizontal overflow, readable media, visible focus states, working CTAs, media expansion, and Escape-to-close.
- [ ] Compare representative pages with the released site for project identity and reject uniform gallery/documentation regressions.
- [ ] Report any pre-existing console errors separately and leave the branch uncommitted.
