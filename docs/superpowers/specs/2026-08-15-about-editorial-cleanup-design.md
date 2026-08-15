# About Editorial Cleanup Design Specification

**Status:** Draft for user review  
**Date:** 2026-08-15  
**Surface:** Main portfolio About page  
**Audience:** International game studios, recruiters, founders, and production partners

## 1. Summary

The About page already has a strong personal identity through its game-production art direction, graphite palette, gold accents, and hand-drawn character illustrations. The remaining problem is information architecture rather than visual quality.

The current page combines positioning, results, process, engagement options, public proof, case studies, services, skills, community links, and repeated calls to action. This creates card fatigue and makes the page feel closer to technical documentation than a focused senior game-production portfolio.

This specification recommends **Balanced Compression**: retain both approved illustrations and the strongest production evidence while reducing repeated sections, claims, cards, CTAs, and mobile page length.

## 2. Current-State Findings

- Approximately 6,433 px page height at 1440 × 900.
- Approximately 9,372 px page height at 390 × 844.
- Approximately 740 words inside the About article.
- 15 action links or CTA labels.
- More than 30 card, list, service, skill, and case-study blocks.
- Five consecutive evidence-oriented sections repeat Unity, GameFi, funded-product, shipping, and optimization claims.
- Results, process, engagement, proof, cases, services, and skills reuse the same dark bordered card family.
- The document contains two visible `h1` elements and one empty `h2`.
- Several project actions use `href="#"`, preventing crawlable and shareable fallback navigation.

## 3. Design Read

This is a personal senior game-production portfolio for international recruiters and clients. It should feel like an authored production casebook rather than a generic developer template or technical capability document.

- **Design variance:** 7/10 — personal without sacrificing clarity.
- **Motion intensity:** 4/10 — restrained reveal and hover feedback.
- **Visual density:** 3/10 — evidence-rich but editorial and breathable.

## 4. Goals

1. Make About understandable within a 30–45 second recruiter scan.
2. Preserve both illustrations and the curly-haired avatar identity.
3. Establish the story: positioning → evidence → working style → selected work → contact.
4. Reduce page length by approximately 30–40%.
5. Reduce repeated claims without weakening credibility.
6. Replace repeated card grids with multiple layout families.
7. Improve heading semantics, project links, and CTA priority.
8. Preserve existing routes, themes, structure, and GitHub Pages compatibility.

## 5. Non-Goals

- Redesigning the sidebar, six-tab navigation, theme toggle, chatbot, Resume, Portfolio, or GitShare.
- Creating new illustrations or replacing the approved About assets.
- Rewriting project detail showcases.
- Changing canonical project facts in `portfolio.json`.
- Introducing a framework, dependency, build system, or routing library.
- Splitting the single-page portfolio into separate HTML documents in this phase.

## 6. Considered Approaches

### Approach A — Minimal Trim

Keep every current section and shorten its copy.

**Advantages:** Lowest implementation risk and smallest diff.  
**Disadvantages:** Card fatigue and repeated information architecture remain.

### Approach B — Balanced Compression — Recommended

Keep the strongest evidence and both illustrations, merge overlapping sections, vary layouts, and remove service/skill repetition from About.

**Advantages:** Best balance of personality, credibility, scanability, and implementation safety.  
**Disadvantages:** Requires deliberate markup and responsive CSS restructuring.

### Approach C — Aggressive Editorial

Reduce About to an introduction, one illustration, three results, one case study, and one CTA.

**Advantages:** Maximum clarity and shortest page.  
**Disadvantages:** Removes useful proof for clients assessing production breadth.

## 7. Target Information Architecture

The final About article contains eight content moments in this order.

### 7.1 Gameplay Reel

- Keep the autoplay, muted, looping gameplay reel.
- Do not add text overlays, trust badges, or additional controls.
- Preserve the poster and accessible label.

### 7.2 Positioning Introduction

- Use one visible section heading: `About Me`.
- Reduce the introduction from approximately 113 words to 75–95 words.
- Answer only: who Hoa is, which production problems he can own, and which studios or clients are the strongest fit.
- Keep a maximum of three actions:
  1. `Hire Me` — primary.
  2. `View Case Studies` — secondary.
  3. `Download CV` — tertiary.
- Telegram remains available globally in the sidebar and bottom navigation.

### 7.3 Production Identity

- Keep `assets/images/about-editorial/production-identity.webp` as the dominant visual anchor.
- Keep the legend labels Gameplay & Player Experience, Production Systems, and Optimize & Ship.
- Do not add explanatory paragraphs below the illustration.
- Let the illustration replace another capability list.

### 7.4 Selected Results

- Reduce five cards to four evidence points:
  1. `8+ Years` — production experience.
  2. `100+ Games` — delivered or published, including private outsource work.
  3. `3 Flagship Tracks` — idle defense, GameFi MMORPG, licensed mobile MMORPG.
  4. `Teams Up To 15` — technical leadership and cross-functional delivery.
- Do not use multiple `FUNDED` cards. Funded context belongs in case studies.
- Present the section as one editorial metric band, not four floating cards.

### 7.5 How I Work

- Keep `assets/images/about-editorial/how-i-work.webp`.
- Desktop uses a two-column composition with the illustration and a compact numbered timeline.
- Mobile stacks the illustration above four compact rows.
- Retain Scope, Prototype, Ship, and Improve.
- Each step contains one sentence and does not use a large standalone card.
- Height target: approximately 620 px desktop and 800 px mobile maximum.

### 7.6 Engagement Strip

- Keep Contract Delivery, Embedded Team Support, and Technical Leadership.
- Present all three inside one shared framed strip or typographic row.
- Do not use three additional proof cards.
- Limit each option to a title and 20–24 words.
- Do not add CTA buttons inside this section.

### 7.7 Flagship Case Studies

- Remove the standalone `Public Proof` section.
- Move its strongest proof into the result band or relevant case studies.
- Use one featured and two compact case studies:
  - Featured: Idle Cyber.
  - Compact: Nekoverse.
  - Compact: MU: Loren Mobile.
- Each case study communicates product context, role, production contribution, evidence-safe result, and one action.
- Supporting studies must not repeat the featured card structure.
- Use real fallback URLs:
  - `projects/idle-cyber/`
  - `projects/nekoverse/`
  - `projects/mu-loren-mobile/`
- JavaScript may enhance these anchors, but they must work without JavaScript.

### 7.8 Final Contact Moment

- End About after case studies with one compact contact strip.
- Message intent: available for game development, production support, or technical leadership.
- Maximum actions:
  - `Discuss a Project` — email, primary.
  - `Telegram` — secondary.
- Do not repeat CV, GitHub, community, or project links here.

## 8. Content Removed or Relocated

### Remove From About

- Standalone `Public Proof`.
- `🔥 More` capability checklist.
- Service cards under `What I'm doing`.
- `Main Skill` grid.
- `Community & Download` strip.

### Preserve Elsewhere

- Service breadth remains in Resume, Portfolio, detail pages, and canonical portfolio data.
- Skill keywords remain in Resume and structured metadata.
- Community and GitHub links remain in the sidebar or GitShare.
- Download CV remains in the introduction.

## 9. Visual System Requirements

### Layout Variety

Use at least four distinct composition families across gameplay media, editorial text, full-width illustration, metric band, illustration-plus-timeline, engagement strip, and featured-plus-compact cases.

No two consecutive sections use the same equal-card-grid structure.

### Section Rhythm

- Retain generous spacing around the illustrations.
- Use larger spacing before narrative transitions than between related items.
- Use decorative heading underlines only for major anchors.
- Do not add eyebrow labels above every heading.
- Limit desktop body copy to approximately 65–72 characters per line.

### Card Budget

- One featured case-study card maximum.
- Two compact supporting case-study surfaces maximum.
- Metrics and engagement options must not look like generic independent cards.
- No more than 10 visibly bordered content surfaces, excluding video and illustration frames.

### Color and Typography

- Preserve graphite, gold, mint, lavender, and magenta accents.
- Do not introduce AI-purple gradients, glassmorphism, or new accent colors.
- Preserve current heading and body font families.
- Reserve gold for evidence, numbering, and primary actions.

## 10. Responsive Requirements

### Desktop — 1440 × 900

- Sidebar and navbar remain unchanged.
- No horizontal overflow.
- Final About article height does not exceed approximately 4,800 px.
- Production Identity remains visually dominant over the workflow image.

### Tablet — 768 px

- Multi-column content collapses when necessary.
- Metric and engagement bands may use two columns before collapsing.
- Bottom navigation behavior remains unchanged.

### Mobile — 390 × 844 and 320 × 720

- Final About article height does not exceed approximately 6,500 px at 390 px width.
- No horizontal overflow or truncated CTA labels.
- Interactive tap targets remain at least 44 × 44 CSS pixels.
- Bottom navigation does not prevent access to the final CTA or project actions.
- Legend pills may wrap but remain readable.
- Workflow steps use compact rows instead of tall cards.

## 11. Content and Evidence Rules

- Preserve `games delivered/published, including private outsource work` for the 100+ claim.
- Do not publish funding amounts.
- Do not claim sole ownership for collaborative work.
- Use `contributed`, `delivered`, `led`, or `supported` according to evidence.
- Avoid unnecessary repetition of `funded`, `GameFi`, and `full-cycle`.
- Give each case study a distinct proof angle:
  - Idle Cyber: full-cycle gameplay and multi-platform delivery.
  - Nekoverse: RPG, Web3, and economy systems.
  - MU: Loren Mobile: licensed MMORPG production and mobile optimization.

## 12. Semantic and SEO Requirements

- Use one document-level `h1` for person and positioning.
- Render `MAD` as supporting text, not a second `h1`.
- Remove the empty About `h2`.
- Use `h2` for About sections and `h3` for case-study titles.
- Do not skip from `h2` to `h4`.
- Replace project `href="#"` actions with real project URLs.
- Keep title, canonical URL, meta description, and Person JSON-LD unless separately approved through query research.
- Remove obsolete `meta keywords`.
- Align Open Graph locale with the English document language.
- Use empty alt text or `aria-hidden="true"` for decorative icons.
- Retain meaningful alt text and intrinsic dimensions for both editorial illustrations.

## 13. Interaction Requirements

- Existing project-detail enhancement may intercept supported project links.
- Modified clicks must still open canonical project URLs in a new tab.
- Email and Telegram remain ordinary anchors.
- Do not add carousel, accordion, auto-rotation, scroll hijacking, or mandatory animation.
- Respect `prefers-reduced-motion`.

## 14. Performance Requirements

- Reuse the two existing WebP assets.
- Preserve `loading="lazy"`, `decoding="async"`, width, and height.
- Do not introduce dependencies or increase initial image transfer size.
- Removed sections should reduce DOM size and layout work.

## 15. Expected File Scope

- `index.html` — About structure, copy hierarchy, headings, and project URLs.
- `assets/css/modern-enhancements.css` — editorial composition and responsive rules.
- `assets/css/style.css` — only when an existing base rule cannot be safely overridden.
- `assets/js/script.js` — only when link enhancement needs fallback or modified-click fixes.
- `scripts/test-home-experience-contract.js` — structural regression contracts.
- `scripts/test-site-metadata.js` — only for metadata contracts.

No portfolio-data generation is expected because canonical project records do not change.

## 16. Acceptance Criteria

### Information Architecture

- Order is reel → introduction → Production Identity → results → workflow → engagement → case studies → contact.
- `Public Proof`, `What I'm doing`, `Main Skill`, `🔥 More`, and `Community & Download` no longer appear inside About.
- Both approved illustrations remain.

### Content Density

- About copy is reduced from approximately 740 to 450–550 words.
- Visible actions are reduced from 15 to no more than 9, including three project actions.
- Visibly bordered content surfaces do not exceed 10.
- No evidence claim appears verbatim in more than two sections.

### Semantic Quality

- Exactly one visible `h1` exists.
- No empty headings exist.
- Heading levels do not skip from `h2` to `h4`.
- No About project action uses `href="#"`.
- Both illustrations retain meaningful alt text and dimensions.

### Visual QA

- No horizontal overflow at 1440, 768, 390, or 320 px.
- The page remains readable in dark and light themes.
- Production Identity is visually dominant.
- Mobile workflow steps render as compact rows.
- Fixed navigation does not permanently cover the final interactive element.

### Regression QA

- `node scripts/test-home-experience-contract.js` passes.
- `node scripts/test-site-metadata.js` passes when metadata changes are included.
- `npm test` passes without modifying unrelated failures.
- Smoke-check `backup/recruiter-clean/index.html`, `backup/dev-console/index.html`, and `backup/game-studio/index.html`.

## 17. Implementation Sequence

1. Add or update failing structural contracts.
2. Correct headings and crawlable project links.
3. Restructure and shorten About markup.
4. Implement the metric band and engagement strip.
5. Implement the responsive workflow composition.
6. Implement featured and compact case-study layouts.
7. Remove obsolete About-only styles and markup.
8. Run focused contracts, full tests, and browser QA.

## 18. Risks and Mitigations

### Keyword breadth decreases

Keep essential expertise in the introduction, results, cases, Resume, project pages, and structured data instead of repeated visible lists.

### The page feels less senior after trimming

Replace breadth-by-volume with quantified results, team scale, distinct flagship contributions, and stronger case-study hierarchy.

### JavaScript depends on `href="#"`

Preserve `data-detail-category` and enhance real project anchors instead of relying on empty URLs.

### Workflow image and timeline repeat each other

Treat the illustration as the visual explanation and the timeline as concise operational labels.

## 19. Review Decisions Requested

Approve or revise these decisions before an implementation plan is written:

1. Use Approach B — Balanced Compression.
2. Keep both illustrations, with Production Identity dominant.
3. Remove `Public Proof`, `What I'm doing`, `Main Skill`, `🔥 More`, and `Community & Download` from About.
4. Use four results: 8+ years, 100+ games, three flagship tracks, teams up to 15.
5. Feature Idle Cyber and render Nekoverse and MU: Loren as compact supporting cases.
6. Limit the introduction to three actions and finish with a two-action contact strip.
7. Correct heading semantics and real project fallback URLs in the same redesign.
