# Crypto Quest Production Showcase Design

Date: 2026-08-15

## Goal

Redesign the Crypto Quest portfolio detail as a game production showcase for recruiters, game studios, and prospective collaborators. The page should communicate shipped product scope and Hoa's contribution through visual storytelling rather than reading like technical documentation.

## Design Read

This is a flagship game-production case study for a senior Unity developer. It should feel cinematic and project-specific while remaining concise, credible, responsive, accessible, and consistent with the existing portfolio shell.

Design dials:

- Design variance: 8/10.
- Motion intensity: 6/10.
- Visual density: 4/10.

## Selected Direction

Use the **Game Production Showcase** direction. Preserve the visual richness and project identity of the released site, but rebuild it on the current canonical-data renderer rather than restoring the old gallery markup.

Crypto Quest receives its own presentation theme:

- Obsidian base surfaces.
- Antique-gold primary accent.
- Emerald secondary accent drawn from the game artwork.
- Editorial typography hierarchy with restrained game-HUD details.
- Asymmetric media compositions instead of uniform card grids.
- No generic purple AI gradients, excessive glassmorphism, or decorative motion without narrative purpose.

## Audience And Story

The primary reader is a recruiter or studio lead scanning for production credibility. The page should answer these questions in order:

1. What kind of shipped game is this?
2. What was Hoa's role and production context?
3. Which player-facing systems did he build?
4. What breadth of work did he own across gameplay, tooling, backend integration, and live operations?
5. Where can the reader see or play the project?

## Page Structure

### 1. Cinematic Hero

- Use one strong gameplay image as the dominant visual surface.
- Present the project title, concise genre statement, role, and status over or beside the image depending on viewport width.
- Include direct `Play Demo` and `Visit Website` actions when public evidence links remain available.
- Avoid a centered marketing hero; use an asymmetric composition with the media carrying most visual weight.

### 2. Production Strip

Show compact, high-signal facts immediately after the hero:

- Senior Unity Developer.
- Team of 14.
- May 2023 — February 2024.
- WebGL.

The strip should read as production context, not four identical dashboard cards.

### 3. World And Gameplay

- Establish Crypto Quest as a turn-based GameFi RPG.
- Use the home or revive gameplay image at large scale.
- Keep copy short and product-facing, describing the player experience without unsupported commercial claims.

### 4. Quest Pipeline

- Pair quest and NPC imagery with a story beat about dynamic quest creation and completion.
- Explain backend actor-condition integration in plain production language.
- Present this as a shipped gameplay pipeline, not an API documentation section.

### 5. Character And Progression Systems

- Use equipment-evolution and supporting system imagery in an offset two-up composition.
- Group beast, equipment, skills, consumables, rarity, inventory, and localization as a connected progression ecosystem.
- Avoid separate repetitive cards for every system.

### 6. Production Contribution

- Summarize Hoa's contribution across gameplay systems, internal tools, ScriptableObject workflows, live-ops fixes, and optimization.
- Use three concise outcome-oriented statements based only on canonical project data.
- Technical specificity supports the production story but does not dominate the page.

### 7. Closing CTA

- End with a visually distinct invitation to play the demo or visit the project website.
- Repeat the role and project category only if it strengthens recruiter recall.
- Do not add invented performance metrics, download counts, revenue, or client claims.

## Media Strategy

Use the six currently localized Crypto Quest images. Every image must serve a named story beat instead of appearing in a generic supporting gallery.

- Featured gameplay image: cinematic hero.
- Home or revive image: world and gameplay.
- Quest image: quest pipeline.
- NPC behaviour image: quest pipeline support.
- Equipment evolution image: progression systems.
- Remaining tooling/debug image: production contribution, labeled carefully so it does not appear as player-facing UI.

Images retain expansion behavior. Non-hero media remains lazy-loaded. Existing intrinsic dimensions and optimized WebP assets remain intact.

## Renderer Architecture

Keep `portfolio.json` and the generated detail payload as the source of truth. Do not place project copy back into `assets/portfolio-details/cryptoquest.html`.

Extend the shared detail renderer with presentation metadata rather than adding a standalone hard-coded page. The pilot may introduce:

- A `layoutVariant` identifying the showcase family.
- A project theme or accent token set.
- Ordered story beats that reference canonical media items.
- Media presentation roles such as `hero`, `wide`, `paired`, or `supporting`.
- Reusable production-showcase rendering primitives.

Crypto Quest-specific configuration is allowed; Crypto Quest-specific renderer conditionals scattered through shared rendering code are not.

The root fragment and public detail category remain unchanged so existing navigation and URLs continue to work.

## Responsive Behavior

Desktop uses asymmetry, overlapping visual planes, and alternating text/media alignment. Tablet reduces overlap while preserving varied media scale. Mobile becomes a deliberate single-column editorial sequence with the same narrative order.

Required safeguards:

- No horizontal overflow at 390px.
- CTA controls remain comfortably tappable.
- Text never overlays a visually busy image without a strong contrast surface.
- Images preserve useful crops and do not force excessively tall empty regions.
- Production facts wrap naturally without becoming four stacked oversized cards.

## Motion And Interaction

- Use restrained entrance reveals and image-depth transitions.
- Keep hover treatment focused on media expansion and CTA affordance.
- Avoid perpetual ambient animation.
- Honor `prefers-reduced-motion` by disabling nonessential transitions and transforms.
- Preserve keyboard access, focus visibility, semantic headings, and media viewer behavior.

## Scope Boundaries

Included:

- Crypto Quest pilot presentation metadata.
- Reusable renderer primitives required by the pilot.
- Crypto Quest theme and production-showcase CSS.
- Desktop and mobile browser verification.
- Portfolio data validation and generated-data consistency checks.

Excluded from the pilot:

- Redesigning the other 24 project details.
- Replacing the main portfolio shell.
- Restoring all 18 externally hosted release images.
- Adding frontend dependencies or a new framework.
- Inventing new project claims or metrics.

## Success Criteria

- Crypto Quest reads as a shipped game showcase within the first viewport.
- The six available images create a clear narrative rather than a uniform gallery.
- Role, team, period, platform, systems, and public actions remain easy to scan.
- The page feels recognizably specific to Crypto Quest while using reusable renderer architecture.
- Desktop and mobile presentation remain accessible and free from overflow.
- Existing project selection, lazy detail loading, media expansion, and public URLs continue to work.
- `npm run generate:portfolio` and `npm run validate:portfolio` complete successfully after implementation.

## Rollout After Pilot

After visual approval, extract the successful primitives into four or five showcase families. Flagship projects receive individual theme and composition metadata, while supporting projects share curated families. The pilot does not automatically authorize applying the design to every project.
