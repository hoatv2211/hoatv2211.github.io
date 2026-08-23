# Flying Phoenix Chronicles Portfolio Design

Date: 2026-08-23

## Goal

Add Flying Phoenix Chronicles as a new personal MMORPG project in the HoaTV portfolio using the existing canonical project-detail system and the eleven approved portrait showcase images.

The project must read as an owned, in-development Unity MMORPG. It must not imply a commercial release, store launch, public demo, or verified business outcome.

## Design Read

This is a personal flagship game case study for recruiters, studio leads, and potential clients. It should feel cinematic and production-oriented while preserving the existing HoaTV portfolio shell and project-detail conventions.

- Design variance: 6/10. Asymmetric enough to feel authored, but still consistent with existing flagships.
- Motion intensity: 5/10. Existing reveal and interaction behavior only, with reduced-motion support.
- Visual density: 4/10. Large portrait media, concise copy, and a five-beat production narrative.
- Design system: existing repository-native HTML, CSS, and JavaScript. No new frontend framework or broad dependency.
- Theme: one dark navy theme with a restrained gold accent family across the full project detail.

## Canonical Architecture

`portfolio.json` remains the source of truth.

Add one project with these stable identifiers:

- `id`: `flying-phoenix-chronicles`
- `slug`: `flying-phoenix-chronicles`
- `legacyId`: `flyingphoenix`
- `detailKey`: `flyingphoenix`
- `category`: `unity`
- `layoutVariant`: `flagship-worlds`
- `theme`: `flying-phoenix-chronicles`
- `detail.tier`: B
- `detail.mode`: rendered
- `status`: active
- `type`: personal
- `role`: Creator / Lead Developer
- `period`: 2026 - Present
- `platforms`: Mobile
- `engine`: Unity

The project detail uses a thin rendered fragment at `assets/portfolio-details/flyingphoenix.html`. Generated runtime data continues to come from `npm run generate:portfolio`.

Create the SEO route `projects/flying-phoenix-chronicles/index.html` using the same compact metadata and breadcrumb pattern as the existing MU Loren Mobile and Tinh Thien Ha routes. Add the route to `sitemap.xml`.

## Portrait-Led Flagship Treatment

Keep `flagship-worlds` as the family. Add a reusable `portrait-led` modifier derived from the featured media fit or orientation. Do not branch on the Flying Phoenix Chronicles slug.

The modifier must:

- Preserve the full 9:16 showcase composition with `object-fit: contain`.
- Present the hero media and copy as an asymmetric desktop split.
- Keep portrait images large enough to read.
- Collapse to a strict single column below 768px.
- Preserve media expansion, keyboard focus, lazy loading, and reduced motion.
- Avoid horizontal overflow at 390px.

## Media Pipeline

Source images remain unchanged in:

`D:/2026/FlyingPhoenixChronicles/artifacts/google-play-showcase-en-20260823/final/portfolio/phone`

Create optimized WebP derivatives under:

`assets/images/portfolio-details/flying-phoenix-chronicles/`

Keep the source dimensions and portrait ratio. Use stable descriptive filenames based on the existing PNG names. The strongest combat frame is the card image and hero media. Supporting media remains lazy-loaded.

Every image appears exactly once in the narrative:

1. Hero: `01-combat-boss-mobs`
2. Combat and skills: `02-combat-skill-impact`, `04-skill-build`
3. Hero construction: `03-hero-equipment`, `06-inventory-gear`
4. Companion progression: `05-mount-advancement`, `07-pet-collection`
5. World traversal: `08-mounted-exploration`, `09-world-exploration`
6. Connected systems: `10-hero-pet-party`, `11-main-menu`

This uses all eleven images once without creating a generic equal-card gallery.

## Narrative Content

Use concise professional English.

Project summary:

> A personal Unity MMORPG project built around live combat, hero progression, companions, traversal, and interconnected feature systems for mobile play.

Status label:

> Personal project in development

Production contribution must describe only the ownership and systems supported by the supplied project and captures:

- Designed and developed the Unity MMORPG project and its core gameplay presentation.
- Built combat, skill, character, inventory, mount, and pet progression flows.
- Integrated feature navigation, English presentation, and portrait mobile showcase delivery.
- Maintained the local client and supporting development environment during production.

Five story beats:

1. Combat foundation: live encounters and skill impact establish the player experience.
2. Hero construction: character identity, equipment, inventory, and build decisions shape progression.
3. Companion progression: mounts and pets extend movement, collection, and long-term growth.
4. World traversal: arenas and exploration frames show the spatial MMORPG experience.
5. Connected systems: hero, companions, and main-menu access show how the feature set fits together.

Do not add download counts, revenue, team size, publisher claims, public release claims, app-store links, or performance metrics.

## Visual Tokens

- Ink: `#071426`
- Panel: `#0b1d31`
- Accent: `#efc86c`
- Accent alternative: `#f5d98c`
- Text: `#f5f2e9`
- Muted: `#b9ccdc`

The project detail stays within this dark navy and gold family. Radius treatment follows existing flagship styles. Buttons keep the existing project-detail action treatment and WCAG contrast.

## Portfolio And Backup Behavior

Keep the repository invariant of exactly five featured projects. Add Flying Phoenix Chronicles at `featuredOrder: 5` and remove only the featured flag/order from JX1. JX1 remains active, keeps its route and flagship detail, and retains its current `displayOrder`. Flying Phoenix Chronicles uses the next available `displayOrder` so the broader project list does not require a mechanical reorder.

The three backup routes continue to consume canonical project data through the shared adapter. Do not duplicate the project record in backup HTML.

Verify:

- `backup/recruiter-clean/index.html`
- `backup/dev-console/index.html`
- `backup/game-studio/index.html`

## Error And Fallback Behavior

- Missing media references fail generation and validation.
- The thin detail fragment must match `detailKey` exactly.
- Images include project-specific alt text and explicit dimensions.
- If a derivative cannot be decoded or optimized, stop and report the failing source instead of inserting a placeholder.
- No public CTA is rendered until a real public demo, repository, store page, or project website is supplied.

## Verification

Automated checks:

1. Generate canonical runtime data.
2. Validate portfolio records, links, routes, detail content, renderer output, styles, media inventory, and data synchronization.
3. Run the full `npm test` suite.
4. Run `git diff --check`.
5. Confirm every copied WebP decodes and retains a 1080 x 1920 portrait dimension.
6. Confirm all eleven media keys resolve and render exactly once.

Browser QA:

- Main portfolio project card opens the new detail.
- Desktop at 1440 x 900.
- Mobile at 390 x 844.
- Narrow mobile at 320px when feasible.
- No horizontal overflow, clipped text, tiny portrait media, or controls covering content.
- Media viewer opens and closes with keyboard, including Escape.
- Light and dark global shell states remain usable while the project detail keeps one coherent internal theme.

## Scope Boundaries

Included:

- Canonical project data.
- Optimized showcase assets.
- Thin detail fragment and SEO route.
- Reusable portrait-led flagship renderer and CSS behavior.
- Generated outputs, focused tests, full validation, and browser QA.

Excluded:

- Editing the Flying Phoenix Chronicles source project.
- Adding a WebGL build or Android package.
- Publishing, pushing, or deploying the portfolio.
- Inventing public links or production metrics.
- Redesigning the global portfolio shell.

## Success Criteria

- Flying Phoenix Chronicles appears as a new featured personal project.
- The featured set remains exactly five projects and JX1 remains available as an active flagship detail.
- The case study uses all eleven approved images once.
- Portrait screenshots remain readable on desktop and mobile.
- The page clearly states Creator / Lead Developer and in-development status.
- No commercial-release or public-demo claim appears.
- Existing portfolio and backup routes continue to pass their contracts.
- The full automated suite and browser QA pass.
