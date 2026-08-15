# README Hand-Drawn Job Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated root README with an evidence-safe, international-facing senior game developer profile supported by a cohesive hand-drawn technical editorial image system.

**Architecture:** Keep `README.md` as accessible Markdown/HTML and use five optimized WebP illustrations under `assets/images/readme/` as visual section anchors. Claims and project descriptions come from `portfolio.json`; selected work uses existing real screenshots and public project routes rather than AI-generated game imagery.

**Tech Stack:** GitHub-flavored Markdown, static HTML, local WebP assets, Python Pillow for deterministic image optimization, 9Router image generation for reference artwork.

---

## File Structure

- Create `assets/images/readme/hero-production-partner.webp`: hero production journey illustration.
- Create `assets/images/readme/what-i-deliver.webp`: delivery-capability illustration.
- Create `assets/images/readme/how-i-work.webp`: optimized approved V2 workflow illustration.
- Create `assets/images/readme/production-architecture.webp`: Unity-centered production architecture illustration.
- Create `assets/images/readme/engagement-model.webp`: contract, embedded, and leadership illustration.
- Create `audits/readme-handdrawn-reference/prompts/hero-production-partner.txt`: reference-generation prompt.
- Create `audits/readme-handdrawn-reference/prompts/what-i-deliver.txt`: reference-generation prompt.
- Create `audits/readme-handdrawn-reference/prompts/production-architecture.txt`: reference-generation prompt.
- Create `audits/readme-handdrawn-reference/prompts/engagement-model.txt`: reference-generation prompt.
- Modify `audits/readme-handdrawn-reference/preview.html`: review all generated references together.
- Modify `README.md`: replace the legacy profile with the approved conversion-focused structure.

### Task 1: Lock Evidence-Safe README Copy

**Files:**
- Read: `portfolio.json`
- Modify: `README.md`

- [ ] **Step 1: Use only canonical identity and proof**

Use these repository-backed claims:

```text
Senior Game Developer
8+ years of experience
100+ games delivered/published, including private outsource work
Full-cycle delivery from concept through live operations
Team leadership across 5–15 developers, artists, and designers
Unity, mobile, WebGL, GameFi/Web3, Telegram/World App, backend, and automation
```

- [ ] **Step 2: Use four representative case studies**

```text
MU Loren Mobile — mobile MMORPG systems and optimization
JX1 Mobile / Tình Thiên Hạ — publisher-backed MMORPG delivery
Idle Cyber — mobile/WebGL tower defense and GameFi prototype work
Nekoverse — real-time GameFi MMORPG systems and blockchain integration
```

- [ ] **Step 3: Keep conversion copy concise**

Write sections in this order: positioning, proof bar, deliverables, selected work, workflow, architecture, engagement model, contact. Link project cards to their existing `projects/<slug>/` routes.

### Task 2: Generate Remaining Editorial References

**Files:**
- Create: `audits/readme-handdrawn-reference/prompts/hero-production-partner.txt`
- Create: `audits/readme-handdrawn-reference/prompts/what-i-deliver.txt`
- Create: `audits/readme-handdrawn-reference/prompts/production-architecture.txt`
- Create: `audits/readme-handdrawn-reference/prompts/engagement-model.txt`
- Create: `audits/readme-handdrawn-reference/*.png`

- [ ] **Step 1: Reuse approved visual DNA**

Every prompt must specify near-white `#FCFBF7`, graphite `#2F3437`, restrained mint/blue/peach accents, asymmetric editorial composition, game-production metaphors, generous whitespace, and no fake screenshots or proof.

- [ ] **Step 2: Generate exactly four new references**

Use 9Router `/v1/responses` with `cx/gpt-5.5` and:

```json
{
  "type": "image_generation",
  "size": "1536x1024",
  "quality": "high",
  "output_format": "png"
}
```

- [ ] **Step 3: Inspect all four images**

Reject any image containing fake game screens, misspelled prominent copy, logos, watermarks, literal whiteboard furniture, repeated card grids, or childish characters.

### Task 3: Build Production README Assets

**Files:**
- Create: `assets/images/readme/*.webp`

- [ ] **Step 1: Create the asset directory**

Use `apply_patch` to add a placeholder file only if the image export cannot create the directory directly; remove no existing asset.

- [ ] **Step 2: Resize and encode approved images**

Use Pillow with LANCZOS resampling, fit each image inside `1200x800`, and save WebP at quality `82`, method `6`:

```python
from PIL import Image

image.thumbnail((1200, 800), Image.Resampling.LANCZOS)
image.save(target, "WEBP", quality=82, method=6)
```

- [ ] **Step 3: Enforce asset budget**

Run a file-size report and target approximately `150–300 KB` per image and no more than `1.5 MB` total. Reduce quality or dimensions only when necessary.

### Task 4: Rewrite Root README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace broken legacy content**

Remove encoding-corrupted bullets, the generic technology icon wall, remote third-party icon dependencies, and vague copy.

- [ ] **Step 2: Add production-partner hero**

Use the role `Senior Game Developer` and the message `From playable prototype to optimized release.` Add direct links to Portfolio, Email, Telegram, LinkedIn, and GitHub.

- [ ] **Step 3: Add proof and services**

Present proof as plain readable text and organize delivery around gameplay production, monetization/platform integration, optimization/release, and technical leadership.

- [ ] **Step 4: Add real selected work**

Use existing local screenshots from MU Loren, JX1, Idle Cyber, and Nekoverse. Do not redraw them or state outcomes beyond `portfolio.json`.

- [ ] **Step 5: Add workflow, architecture, engagement, and CTA**

Pair each section with its corresponding local illustration. Keep all critical wording outside the generated images so the README remains searchable and accessible.

### Task 5: Validate README Delivery

**Files:**
- Verify: `README.md`
- Verify: `assets/images/readme/*.webp`

- [ ] **Step 1: Verify local paths**

Run a script that extracts local `src` and Markdown image paths from `README.md` and fails if any file is missing.

- [ ] **Step 2: Verify image dimensions and budget**

Run Pillow inspection and report each asset's dimensions, file size, and total size.

- [ ] **Step 3: Run repository validation**

Run:

```powershell
npm test
```

Expected: exit code `0` with all portfolio contracts passing.

- [ ] **Step 4: Preview rendered README**

Create an ignored local HTML preview if necessary, then inspect desktop and narrow widths in the in-app browser. Confirm headings, links, screenshots, and illustrations remain readable.

- [ ] **Step 5: Confirm Git scope**

Run `git status --short` and verify only `README.md`, the five production README assets, the design spec, and this implementation plan are new task-related tracked changes. Preserve existing edits in `.github/workflows/portfolio-quality.yml` and `.gitignore`.
