# About Editorial Cleanup Design Specification

**Status:** Revised draft for user review
**Revision:** 1 — review blockers and QA gaps addressed
**Date:** 2026-08-15
**Surface:** Main portfolio About page
**Audience:** International game studios, recruiters, founders, and production partners

## 1. Summary

The About page already has a strong personal identity through its game-production art direction, graphite palette, gold accents, and hand-drawn character illustrations. The remaining problem is information architecture rather than visual quality.

The current page combines positioning, results, process, engagement options, public proof, case studies, services, skills, community links, playable links, and repeated calls to action. Compression must remove repetition without removing the strongest game-development evidence: playable builds.

This specification recommends **Balanced Compression**: retain both approved illustrations, preserve playable access, attribute every quantified claim, merge overlapping sections, reduce card repetition, and make the result measurable through Node contracts and Playwright QA.

## 2. Current-State Findings

- Approximately 6,433 px page height at 1440 × 900.
- Approximately 9,372 px page height at 390 × 844.
- Approximately 740 words inside the About article.
- 15 action links or CTA labels.
- More than 30 card, list, service, skill, and case-study blocks.
- Five consecutive evidence-oriented sections repeat Unity, GameFi, funded-product, shipping, and optimization claims.
- Results, process, engagement, proof, cases, services, and skills reuse the same dark bordered card family.
- The document contains two visible `h1` elements and one empty `h2`.
- Several project actions use `href="#"`, preventing crawlable fallback navigation.
- `Community & Download` currently owns the only direct About-page links to the Idle Cyber itch.io build and local Survivor.IO WebGL build.
- Existing home contracts encode the current adjacency of Production Identity, Selected Results, and the How I Work figure.

## 3. Design Read

This is a personal senior game-production portfolio for international recruiters and clients. It should feel like an authored production casebook rather than a generic developer template or technical capability document.

- **Design variance:** 7/10 — personal without sacrificing clarity.
- **Motion intensity:** 4/10 — restrained reveal and hover feedback.
- **Visual density:** 3/10 — evidence-rich but editorial and breathable.

## 4. Goals

1. Make About understandable within a 30–45 second recruiter scan.
2. Preserve both illustrations and the curly-haired avatar identity.
3. Establish the story: positioning → evidence → working style → selected work → contact.
4. Reduce page length by approximately 30–40% on desktop and mobile.
5. Preserve or improve access to playable game evidence.
6. Attribute every quantified claim to a project or canonical record.
7. Replace repeated card grids with multiple layout families.
8. Improve heading semantics, project links, and CTA priority.
9. Preserve existing routes, themes, structure, and GitHub Pages compatibility.

## 5. Non-Goals

- Do not redesign the sidebar layout, visual styling, interaction, or information shown. Semantic-only tag corrections inside the sidebar are allowed when they preserve the rendered appearance exactly.
- Do not redesign the six-tab navigation, theme toggle, chatbot UI, Resume, Portfolio layout, or GitShare layout.
- Do not create new illustrations or replace the approved About assets.
- Do not rewrite project detail showcases.
- Do not change canonical project claims except to restore the existing Survivor.IO playable URL to canonical data.
- Do not introduce a framework, dependency, build system, or routing library.
- Do not split the single-page portfolio into separate HTML documents in this phase.

## 6. Considered Approaches

### Approach A — Minimal Trim

Keep every current section and shorten its copy.

**Advantages:** Lowest implementation risk and smallest diff.
**Disadvantages:** Card fatigue and repeated information architecture remain.

### Approach B — Balanced Compression — Recommended

Keep the strongest evidence and both illustrations, preserve playable links, merge overlapping sections, vary layouts, and remove service/skill repetition from About.

**Advantages:** Best balance of personality, credibility, scanability, playable proof, and implementation safety.
**Disadvantages:** Requires deliberate markup, data, renderer cleanup, contracts, and responsive CSS restructuring.

### Approach C — Aggressive Editorial

Reduce About to an introduction, one illustration, three results, one case study, and one CTA.

**Advantages:** Maximum clarity and shortest page.
**Disadvantages:** Removes useful production breadth and playable discovery.

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
- Keep Gameplay & Player Experience, Production Systems, and Optimize & Ship.
- Do not add explanatory paragraphs below the illustration.
- Let the illustration replace another capability list.
- Preserve the `about-editorial-identity` class unless the associated contract is deliberately migrated in the same change.

### 7.4 Selected Results

- Reduce five cards to four evidence points:
  1. `8+ Years` — production experience.
  2. `100+ Games` — delivered or published, including private outsource work.
  3. `5 Release Channels` — App Store, Google Play, WebGL, Telegram Mini App, and World App.
  4. `Teams Up To 15` — attributed in visible copy to technical delivery leadership on Dalgona — World App. The supporting source remains the canonical Dalgona role/team record and its home-experience contract; this metric does not add another CTA.
- Do not use multiple `FUNDED` cards. Funded context belongs in case studies.
- Present the section as one editorial metric band, not four floating cards.
- Preserve the `selected-results` section class so existing selectors and migrated contracts have a stable hook.

### 7.5 How I Work

- Keep `assets/images/about-editorial/how-i-work.webp`.
- Desktop uses a two-column composition with the illustration and a compact numbered timeline.
- Mobile stacks the illustration above four compact rows.
- Retain Scope, Prototype, Ship, and Improve.
- Each step contains one sentence and does not use a large standalone card.
- Height target: approximately 620 px desktop and 800 px mobile maximum.
- Preserve `work-process` and `about-editorial-workflow` as stable hooks.
- A wrapper may be inserted around the figure and timeline; the home contract must be updated so it checks containment and ordering rather than direct heading-to-figure adjacency.

### 7.6 Engagement Strip

- Keep Contract Delivery, Embedded Team Support, and Technical Leadership.
- Present all three inside one shared framed strip or typographic row.
- Do not use three additional proof cards.
- Limit each option to a title and 20–24 words.
- Do not add CTA buttons inside this section.

### 7.7 Flagship Case Studies and Playable Proof

- Remove the standalone `Public Proof` section only after every proof item has an explicit destination:
  - `Shipping Platforms` becomes the `5 Release Channels` result metric.
  - `Flagship Details` becomes the three case-study summaries and their canonical project links.
  - `Agentic Tooling` moves to GitShare; the mad-agentic organization and Reclip links must remain discoverable there and are not duplicated in About.
- Use one featured and two compact case studies:
  - Featured: Idle Cyber.
  - Compact: Nekoverse.
  - Compact: MU: Loren Mobile.
- Each case study communicates product context, role, production contribution, evidence-safe result, and one project-detail action.
- Idle Cyber receives a second action: `Play Idle Cyber`, linking to `https://o0-mad-0o.itch.io/cyber-war` in a new tab with `rel="noopener noreferrer"`.
- Use real fallback project URLs:
  - `projects/idle-cyber/`
  - `projects/nekoverse/`
  - `projects/mu-loren-mobile/`
- JavaScript may enhance project anchors, but they must work without JavaScript and modified clicks must retain native behavior.
- Survivor.IO does not remain in About. Its existing playable evidence URL, `Games/SurvivorIO/index.html`, must move into canonical `portfolio.json` as `playableUrl`, regenerate `assets/js/portfolio-data.js`, and render as `PLAY NOW` from the Survivor.IO item in the Portfolio tab.

### 7.8 Final Contact Moment

- End About after case studies with one compact contact strip.
- Message intent: available for game development, production support, or technical leadership.
- Maximum actions:
  - `Discuss a Project` — email, primary.
  - `Telegram` — secondary.
- Do not repeat CV, GitHub, community, or project links here.

## 8. Content Removed or Relocated

### Remove From About

- Standalone `Public Proof` after completing the proof mapping in §7.7.
- `🔥 More` capability checklist.
- Service cards under `What I'm doing`.
- `Main Skill` grid.
- `Community & Download` container after relocating both playable links.

### Preserve Elsewhere

- Idle Cyber playable link moves into its featured case study.
- Survivor.IO playable link moves into canonical project data and the Portfolio tab.
- Service breadth remains in Resume, Portfolio, detail pages, and canonical portfolio data.
- Skill keywords remain in Resume and structured metadata.
- mad-agentic and Reclip public links remain in GitShare.
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

- Sidebar and navbar remain visually unchanged.
- No horizontal overflow.
- Final About article height does not exceed approximately 4,300 px, a reduction of about 33% from the measured baseline.
- Production Identity remains visually dominant over the workflow image.

### Tablet — 768 px

- Multi-column content collapses when necessary.
- Metric and engagement bands may use two columns before collapsing.
- Bottom navigation behavior remains unchanged.

### Mobile — 390 × 844 and 320 × 720

- Final About article height does not exceed approximately 6,500 px at 390 px width, a reduction of about 31%.
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
- Attribute the team-of-15 metric to Dalgona — World App in visible copy.
- Avoid unnecessary repetition of `funded`, `GameFi`, and `full-cycle`.
- Give each flagship case study a distinct proof angle:
  - Idle Cyber: full-cycle gameplay and multi-platform delivery plus playable build.
  - Nekoverse: RPG, Web3, and economy systems.
  - MU: Loren Mobile: licensed MMORPG production and mobile optimization.

## 12. Semantic and SEO Requirements

- Use one document-level `h1` for person and positioning.
- Keep the real name as the `h1`; render `MAD` as a `p` or `span` with the same existing class and appearance.
- The sidebar semantic tag change must not alter layout, styling, accessible label, or responsive behavior.
- Remove the empty About `h2`.
- Use `h2` for About sections and `h3` for case-study titles.
- Do not skip from `h2` to `h4`.
- Replace project `href="#"` actions with real project URLs.
- Keep title, canonical URL, meta description, and Person JSON-LD unless separately approved through query research.
- Remove obsolete `meta keywords`.
- Align Open Graph locale with the English document language.
- Use empty alt text or `aria-hidden="true"` for decorative icons that remain elsewhere.
- Retain meaningful alt text and intrinsic dimensions for both editorial illustrations.

## 13. Interaction and Chatbot Requirements

- Existing project-detail enhancement may intercept supported project links.
- Modified clicks must open canonical project URLs natively.
- Email, Telegram, itch.io, and Survivor.IO playable actions remain ordinary anchors.
- Do not add carousel, accordion, auto-rotation, scroll hijacking, or mandatory animation.
- Respect `prefers-reduced-motion`.
- The general About proactive invitation remains timer-based at 5 seconds; it is not coupled to About scroll depth.
- The 30% scroll threshold remains specific to project-detail invitations and must not change during this work.
- Browser QA must confirm the About invitation still appears after its configured delay and does not cover the primary introduction CTA, case-study playable action, final contact action, or fixed mobile navigation.

## 14. Performance Requirements

- Reuse the two existing WebP assets.
- Preserve `loading="lazy"`, `decoding="async"`, width, and height.
- Do not introduce dependencies or increase initial image transfer size.
- Removed sections should reduce DOM size and layout work.
- Remove About-specific rendering and animation code that becomes unreachable after deleting the service and main-skill containers.

## 15. Expected File Scope

### Required Markup, Data, and Styling

- `index.html` — About structure, playable relocation, sidebar semantic tag, headings, and project URLs.
- `portfolio.json` — set Survivor.IO `playableUrl` to `Games/SurvivorIO/index.html`.
- `assets/js/portfolio-data.js` — regenerate with `npm run generate:portfolio`; never edit manually.
- `assets/css/modern-enhancements.css` — editorial composition and responsive rules.
- `assets/css/style.css` — remove obsolete About-only service/community rules or adjust base rules when necessary.

### Required Dead-Code and Interaction Cleanup

- `assets/js/site-config.js` — remove `services` and `mainSkills` configuration after their only containers are removed; preserve Resume `skills`.
- `assets/js/site-render.js` — remove `renderServices()`, the `config.services` call, and the `main-skills` render call; preserve contact, social, and Resume skill rendering.
- `assets/js/modern-enhancements.js` — remove the dead `.service-item` animation selector. Keep `.skills-categories > *` because the Resume skills surface still uses it.
- `assets/js/script.js` — preserve real project fallback links, modified-click behavior, and remove the dead `skills-button` handler after the About button is removed.

### Required Contracts and Visual Audit

- `scripts/test-home-experience-contract.js` — mandatory update, including migration of the two existing positional assertions described in §16.
- `scripts/test-site-metadata.js` — enforce locale and metadata decisions when applicable.
- `scripts/test-chatbot-proactive-contract.js` — keep existing timing and detail-threshold contracts passing.
- Create `scripts/audit-about-page.js` — Playwright height, overflow, chatbot, theme, and screenshot audit.
- `package.json` — add an `audit:about` command if the new audit is not invoked directly by an existing command.

### Required Backup Review

- Review `backup/shared/backup-data-adapter.js` and all three backup renderers.
- Decision: backup styles do **not** mirror the main About metric band. Their `getStats()` output remains adapter-owned because each backup is a separate presentation variant.
- Modify the adapter only if the About rewrite exposes a factual contradiction; do not copy the four main metrics into backups by default.

## 16. Acceptance Criteria and Automation

### Static Node Contract — Mandatory

`node scripts/test-home-experience-contract.js` must automatically assert:

1. About article word count is between 450 and 550 words after stripping tags and non-content UI labels.
2. About contains no more than 9 action anchors, including three project-detail actions, one Idle Cyber playable action, three introduction actions, and two final contact actions.
3. The document contains exactly one `h1` element.
4. No `h1`–`h4` heading is empty.
5. No anchor inside About uses `href="#"`.
6. Both editorial figures, intrinsic dimensions, lazy loading, alt text, and approved identity legend remain.
7. `selected-results`, `work-process`, `about-editorial-identity`, and `about-editorial-workflow` remain as stable hooks.
8. Idle Cyber itch.io and Survivor.IO canonical playable URLs remain present in their approved destinations.
9. Removed About containers and their dead render hooks are absent.

The existing positional contracts at current lines 32–33 must be deliberately migrated:

- Replace the Production Identity adjacency regex with a structural assertion that the identity figure appears after `.about-text` and before `.selected-results`, without requiring direct sibling markup.
- Replace the How I Work heading-to-figure adjacency regex with a containment/order assertion that allows a two-column wrapper inside `.work-process`.

### Browser Audit — Mandatory

`scripts/audit-about-page.js` must use `playwright-core` and fail when:

- About root is missing.
- Document or About root has horizontal overflow.
- About scroll height exceeds 4,300 px at 1440 × 900.
- About scroll height exceeds 6,500 px at 390 × 844.
- Local images or videos are broken.
- Page errors occur.
- The final CTA or playable actions cannot be reached above fixed-navigation padding.
- The proactive About invitation fails to appear after the configured delay or overlaps protected actions.

The audit must save review artifacts under ignored `audits/about/`:

- Before and after screenshots at 1440 × 900 dark theme.
- Before and after screenshots at 390 × 844 dark theme.
- Final screenshot at 320 × 720 light theme.
- JSON report containing viewport, scroll height, overflow state, theme, chatbot state, and errors.

### Visual and Accessibility QA

- Production Identity is visually dominant.
- Mobile workflow steps render as compact rows.
- CTA labels do not truncate.
- Interactive targets are at least 44 × 44 CSS pixels where applicable.
- Keyboard focus remains visible for all retained actions.
- Both dark and light themes remain readable, including the required 320 px light-theme audit.

### Portfolio and Playable QA

- Idle Cyber featured case exposes both `View Project` and `Play Idle Cyber`.
- Survivor.IO Portfolio item exposes `PLAY NOW` pointing to `Games/SurvivorIO/index.html`.
- `npm run generate:portfolio` produces the Survivor.IO runtime link.
- `npm run check:portfolio-sync` passes.

### Backup QA

- Verify the following routes at 1280 and 390 px:
  - `backup/recruiter-clean/index.html`
  - `backup/dev-console/index.html`
  - `backup/game-studio/index.html`
- Confirm their existing adapter-owned stats remain internally consistent.
- Confirm no removed About selector or data dependency breaks backup rendering.

### Chatbot Regression QA

- `node scripts/test-chatbot-proactive-contract.js` passes unchanged unless an intentional contract improvement is documented.
- General About invitation still schedules at 5 seconds.
- Project detail invitation still uses the 8-second delay and 30% detail-scroll threshold.
- Mobile invitation does not overlap the six-tab navigation or case-study playable action.

### Full Regression QA

- `node scripts/test-home-experience-contract.js` passes.
- `node scripts/test-site-metadata.js` passes.
- `node scripts/test-chatbot-proactive-contract.js` passes.
- `npm test` passes without fixing unrelated failures.
- `npm run audit:about -- --base-url http://127.0.0.1:8080` passes when the local server is running.

## 17. Implementation Sequence

1. Capture baseline screenshots and measurements at 1440 dark, 390 dark, and 320 light.
2. Update `scripts/test-home-experience-contract.js` with the five measurable content/semantic assertions and migrate the two adjacency regexes at current lines 32–33.
3. Add the failing Survivor.IO playable-data contract and About playable-destination contracts.
4. Add `scripts/audit-about-page.js` with failing height, overflow, theme, chatbot, and screenshot checks.
5. Correct sidebar and About heading semantics without changing visuals.
6. Move Survivor.IO playable URL into `portfolio.json` and regenerate runtime data.
7. Restructure and shorten About markup while preserving stable hooks.
8. Implement the metric band, workflow composition, engagement strip, and case-study hierarchy.
9. Move Idle Cyber playable into the featured case and remove Community & Download.
10. Remove dead service/main-skill configuration, render calls, selectors, handlers, markup, and styles.
11. Verify backup adapter decision and all three backup routes.
12. Run focused contracts, full tests, Playwright audit, and compare before/after artifacts.

## 18. Risks and Mitigations

### Playable evidence disappears during compression

Relocate both playable links before deleting Community & Download. Contracts assert both destinations.

### Keyword breadth decreases

Keep essential expertise in introduction, metrics, cases, Resume, project pages, and structured data instead of repeated visible lists.

### The page feels less senior after trimming

Replace breadth-by-volume with quantified results, attributed leadership scale, playable evidence, and stronger case-study hierarchy.

### Existing contracts block the new wrapper structure

Update the two known adjacency regexes before restructuring markup, then keep stable semantic class hooks.

### Dead renderer/config code remains

Include site configuration, renderer, animation selectors, and skills-button handler in the mandatory cleanup scope.

### Chatbot timing changes unintentionally

Keep the 5-second general timer and detail-only 30% threshold contracts unchanged; add collision QA rather than changing behavior.

## 19. Rollback Plan

- Keep the redesign in one focused branch or commit series with tests separated from markup/style changes.
- Capture baseline screenshots and the initial audit report before editing.
- Do not delete the original playable URLs until their new destinations pass focused contracts.
- Keep `selected-results`, `work-process`, and editorial figure class hooks to support a CSS/markup rollback.
- If browser height or chatbot QA fails after three iterations, revert only the newest layout phase while retaining semantic fixes and playable-link preservation.
- A full rollback restores `index.html`, About-specific CSS, site renderer/config cleanup, Survivor.IO `playableUrl`, generated portfolio data, and related contracts from the pre-implementation revision.

## 20. Review Decisions Requested

Approve or revise these decisions before an implementation plan is written:

1. Use Approach B — Balanced Compression.
2. Keep both illustrations, with Production Identity dominant.
3. Remove Public Proof, services, Main Skill, More, and Community & Download only after explicit proof and playable relocation.
4. Use four results: 8+ years, 100+ games, 5 release channels, and teams up to 15 attributed to Dalgona.
5. Feature Idle Cyber with a second playable action; keep Nekoverse and MU: Loren as compact supporting cases.
6. Move Survivor.IO playable access into canonical data and the Portfolio tab.
7. Limit the introduction to three actions and finish with a two-action contact strip.
8. Permit semantic-only sidebar markup corrections without visual redesign.
9. Make static contracts, Playwright height checks, chatbot QA, backup verification, and before/after artifacts mandatory.
