# README Hand-Drawn Job Conversion Design

## Purpose

Redesign the repository README as a concise hiring and client-conversion surface for international game-development clients and studio recruiters. The README should present a senior game-production partner who can take work from scope and prototype through production, optimization, release, and iteration.

The new README must not read like technical documentation, a technology inventory, or a generic GitHub profile. It should lead with production value, delivery ownership, and evidence from real work.

## Audience

- International clients hiring a full-cycle game developer or embedded production partner.
- Studio recruiters evaluating senior Unity and game-development capability.
- Technical decision-makers looking for gameplay, monetization, optimization, WebGL, Telegram, GameFi, backend integration, or technical leadership experience.

## Content Direction

The README combines two approved ideas:

1. **Production Partner:** a clear senior positioning statement and a visual path from idea to release.
2. **Service Catalog:** scannable descriptions of what can be delivered and how an engagement can work.

The planned content order is:

1. Hero and positioning.
2. Proof summary grounded in `portfolio.json`.
3. What I Can Deliver.
4. Selected Work using real project screenshots.
5. How I Work.
6. Production Architecture.
7. Engagement Model.
8. Contact call to action.

All factual claims must be traceable to repository content or existing portfolio evidence. Do not invent clients, reviews, ratings, revenue, downloads, pricing, awards, or performance metrics.

## Visual Direction

Use a full hand-drawn technical editorial system:

- Near-white paper background: `#FCFBF7`.
- Thin, slightly irregular graphite lines in `#2F3437`.
- Restrained accents: mint, pale blue, light peach, and optional pale lavender.
- Generous whitespace and low-to-moderate visual density.
- Small, precise diagrams rather than poster-sized illustrations.
- A small developer character may appear at most once per image.
- English-only visible labels for the international audience.
- Main copy remains Markdown or HTML for accessibility, accuracy, searchability, and easy maintenance.

Avoid literal whiteboards, marker trays, decorative stickers, childish cartoons, yellow paper, dense handwriting, dashboard UI, fake screenshots, generic AI gradients, excessive glow, and copied platform branding.

## Image System

Create five hand-drawn editorial illustrations, subject to approval of the first sample:

1. **Hero:** idea to prototype to production to release.
2. **What I Can Deliver:** gameplay, production and monetization, optimization and release.
3. **How I Work:** scope to prototype to build to test to ship to improve, with a feedback loop.
4. **Production Architecture:** Unity client connected to gameplay, UI, ads, IAP, analytics, backend, WebGL, Telegram, and Web3 concerns.
5. **Engagement Model:** contract delivery, embedded development, and technical leadership.

Selected Work must use real screenshots already available in the repository. AI-generated images must not redraw or imitate shipped projects.

## First Sample

Generate only the **How I Work** illustration first because its pipeline, arrows, labels, and feedback loop expose the visual system more clearly than a cover image.

Required visible text:

- `HOW I WORK`
- `SCOPE`
- `PROTOTYPE`
- `BUILD`
- `TEST`
- `SHIP`
- `IMPROVE`

Composition requirements:

- Landscape 3:2 or 16:9 reference frame.
- Small developer sketch on the left.
- Six compact hand-drawn stages across the center.
- A clear loop from Improve back to Prototype.
- Calm technical-article tone with substantial empty space.
- No logo, watermark, portrait, fake game screen, or extra marketing copy.

## Asset Constraints

- Generate references inside ignored `audits/` paths first.
- Do not place generated references in production asset folders until approved.
- Final selected assets should target approximately `1200x675` WebP.
- Target approximately `150–300 KB` per final illustration.
- Keep the complete new README image set near or below `1.5 MB` where practical.
- Preserve readable contrast and meaningful alt text in the final README.

## Approval Criteria

The first sample is approved only if all five qualities work together:

1. **Paper tone:** clean near-white, not warm yellow or gray.
2. **Line quality:** thin graphite sketching, controlled rather than messy.
3. **Accent palette:** sparse mint, pale blue, and peach emphasis.
4. **Character style:** small, mature, and secondary to the diagram.
5. **Density:** understandable at README width with generous whitespace.

After sample approval, write a detailed implementation plan before generating the remaining illustrations or rewriting `README.md`.

## Out of Scope

- Creating a PPTX or slide deck.
- Publishing generated references directly as final assets.
- Changing portfolio project data.
- Redesigning portfolio detail pages.
- Adding fabricated social proof or employment claims.

## Validation

- Compare every claim against `portfolio.json` and current portfolio copy.
- Preview README visuals at desktop and narrow/mobile widths.
- Verify all image paths and links.
- Check final image dimensions, formats, and total file size.
- Confirm ignored reference files do not enter Git status.
- Preserve unrelated existing changes in `.github/workflows/portfolio-quality.yml` and `.gitignore`.
