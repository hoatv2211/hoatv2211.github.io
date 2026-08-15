# Game Production Showcase Rollout Design

Date: 2026-08-15

## Goal

Create a repository-local skill and thin GitHub agent that consistently redesign portfolio details as game-production showcases, then apply the system to the 24 projects that have not received the approved Crypto Quest treatment.

The result should preserve project-specific identity while retaining canonical data, shared rendering, claim safety, accessibility, responsive behavior, lazy loading, and stable public URLs.

## Design Read

This is a senior game-developer portfolio for recruiters, studio leads, founders, and collaborators. Project details should read like shipped-product showcases: visual, selective, credible, and production-oriented rather than technical documentation or generated card grids.

Baseline design dials:

- Design variance: 8/10 for flagships, 7/10 for supporting projects, 5/10 for compact proof.
- Motion intensity: 6/10 for flagships, 4/10 elsewhere.
- Visual density: 4/10, reduced to 3/10 for portrait-first projects.

## Selected Architecture

Use a **repo-local skill + thin GitHub agent + five showcase families**.

The skill owns the durable workflow and design rules. The GitHub agent points to that skill and adds no duplicate source of truth. Portfolio presentation remains data-driven: project metadata chooses a family, theme, hero media, story beats, and media roles; shared renderer primitives produce the final page.

Avoid slug-specific rendering branches. Project-specific identity belongs in canonical presentation data and theme tokens.

## Skill And Agent Structure

Create:

- `.codex/skills/game-production-showcase/SKILL.md`
- `.codex/skills/game-production-showcase/agents/openai.yaml`
- `.codex/skills/game-production-showcase/references/family-map.md`
- `.codex/skills/game-production-showcase/references/presentation-schema.md`
- `.codex/skills/game-production-showcase/references/qa-checklist.md`
- `.github/agents/game-production-showcase.agent.md`

### Skill Responsibilities

- Read `AGENTS.md`, canonical portfolio data, current renderer, CSS, assets, and relevant release reference before editing.
- Infer project identity from genre, platform, media orientation, role, status, and evidence.
- Assign or verify one showcase family.
- Write concise, evidence-safe story beats from existing canonical claims.
- Add presentation metadata rather than bespoke HTML content.
- Extend reusable primitives only when the assigned family cannot be expressed cleanly.
- Use TDD for schema, renderer, and CSS contracts.
- Run automated validation and representative browser QA.
- Protect unrelated dirty-worktree changes and avoid automatic commits.

### GitHub Agent Responsibilities

The GitHub agent is a thin invocation layer. It instructs the agent to load `.codex/skills/game-production-showcase/SKILL.md`, preserve canonical data flow, report findings before edits, and stop if claims or media cannot be supported. It must not duplicate the family map or schema.

## Presentation Schema

Each redesigned project receives optional `detail.presentation` data with:

- `layoutVariant`: family renderer identifier.
- `theme`: project theme token identifier.
- `eyebrow`: short product category statement.
- `heroMediaKey`: stable reference to one media record.
- `storyBeats`: ordered narrative sections.
- Optional CTA or label configuration when evidence labels need controlled presentation.

Each media record used by presentation receives a stable `key`. Each story beat includes:

- `id`
- `kicker`
- `title`
- `body`
- `mediaKeys`
- `layout`

Validation ensures unique media keys, valid references, allowed family/layout values, and non-empty narrative fields.

## Showcase Families

### 1. Flagship Worlds

Projects:

- `muloren`
- `jx1`
- `dalgona`
- `idleCyber`
- `nekoverse`

Purpose: premium, project-specific case studies for the strongest production work.

Shared primitives:

- Cinematic hero with trailer, gameplay, or strong key art.
- Production facts strip.
- Product context and delivery challenge.
- Three to five alternating story beats.
- Technical decision or production contribution treatment.
- Evidence-led closing CTA.

Each flagship receives unique theme tokens and composition metadata. The family shares semantics and interaction behavior, not identical layouts.

### 2. Mobile Campaign

Projects:

- `archero`
- `MeowFlow`
- `galaxiga`
- `tilecandy`
- `sudoku`
- `ageofbattle`
- `surviver`

Purpose: present portrait-heavy mobile work like a concise launch campaign.

Shared primitives:

- Compact hero with product statement.
- Portrait device rail or staggered screenshot sequence.
- Gameplay-loop and progression story beats.
- Two or three concise contribution highlights.
- Optional demo/store CTA when evidence exists.

Mobile screenshots remain readable and are never reduced to tiny equal cards.

### 3. Gameplay Editorial

Projects:

- `shibainu`
- `sandwich`
- `bike`
- `homeDesign`
- `tilesmatch3`
- `metameAmusementPark`

Purpose: use mixed trailer, landscape, portrait, and store media in an editorial production narrative.

Shared primitives:

- Trailer or landscape hero where available.
- Alternating media/text sections.
- Feature or gameplay-loop highlights.
- Production contribution and platform proof.
- Strong closing media or public link.

### 4. Product Console

Project:

- `proxyapi-mad`

Purpose: present a developer product as a shipped operational tool rather than forcing it into a game layout.

Shared primitives:

- Product interface hero.
- Dashboard journey across keys, providers, chat, logs, and settings.
- Capability and operational-proof sections.
- Repository, organization, and website CTAs.

The visual language remains aligned with the portfolio but uses interface/editorial composition rather than fantasy-game styling.

### 5. Compact Proof

Projects:

- `share001-ludo`
- `share002-pixelshooter3d`
- `iceBreakingBattle`
- `citybuilder`
- `neighborhood`

Purpose: preserve samples and archived work as honest evidence without making them appear equivalent to flagship production projects.

Shared primitives:

- Clear sample/archive status.
- One dominant media or playable demo.
- Purpose or legacy context.
- Compact technical/gameplay notes.
- No oversized cinematic treatment or invented production narrative.

## Project Themes

Every active project receives project-specific color and framing tokens derived from its existing media. Theme selection should prefer colors already visible in game UI, artwork, environments, or product branding.

Themes control:

- Background and surface colors.
- Primary and secondary accents.
- Border and frame treatment.
- Media crop behavior.
- Type scale within family limits.
- Optional restrained texture or pattern.

Themes do not change global portfolio typography, navigation, media-viewer behavior, or accessibility requirements.

## Renderer Design

Keep the existing Tier A/B/C renderer as a compatibility fallback during rollout.

Add family renderers through reusable functions:

- Shared hero and action rendering.
- Production strip.
- Story beat layouts.
- Portrait media rail.
- Trailer/landscape feature block.
- Product console journey.
- Compact proof summary.
- Contribution and closing CTA sections.

Family selection is driven by `detail.presentation.layoutVariant`. Renderer code may branch by family, never by project slug.

## CSS Design

Keep shared structural styles under family selectors and project identity under theme selectors.

- Family selectors define layout, rhythm, breakpoints, and interaction states.
- Theme selectors define colors, borders, framing, and limited decorative treatment.
- Mobile-first safeguards prevent overflow and tiny media.
- Motion is restrained and disabled through `prefers-reduced-motion`.
- Text contrast remains at least 4.5:1.
- Focus states remain visible over every theme.

## Rollout Order

1. Create and validate the skill and GitHub agent.
2. Expand presentation validation and family coverage tests.
3. Build family renderers and structural CSS.
4. Migrate Flagship Worlds one project at a time.
5. Migrate Mobile Campaign projects.
6. Migrate Gameplay Editorial projects.
7. Migrate Product Console.
8. Migrate Compact Proof projects.
9. Remove no-longer-used fallback paths only if all 25 projects are covered and tests prove compatibility.

Crypto Quest remains the approved reference implementation and is not redesigned again unless a shared primitive change requires a compatibility adjustment.

## Testing Strategy

Automated contracts verify:

- Every project has a supported family after rollout.
- Every presentation media reference resolves uniquely.
- Every active project has required hero and story metadata for its family.
- Samples and archives use Compact Proof.
- Renderer output includes expected semantic and family classes.
- Every media item renders no more than once per project.
- CSS contains all family, responsive, focus, and reduced-motion contracts.
- Generated data remains synchronized.

Browser QA covers at least one representative of each family at desktop and 390px. All five flagships receive individual desktop/mobile review because they use bespoke composition metadata.

## Scope Boundaries

Included:

- Repo-local skill and GitHub agent.
- Presentation metadata for all remaining 24 projects.
- Reusable family renderer primitives.
- Shared family CSS and per-project theme tokens.
- Contract tests, full automated suite, and browser QA.
- Design and implementation documentation.

Excluded:

- New game screenshots or generated artwork.
- Rewriting claims beyond existing canonical evidence.
- Changing project URLs, ids, slugs, or detail filenames.
- Rebuilding the global portfolio shell.
- Adding a frontend framework or broad dependency.
- Committing, pushing, or creating a PR without explicit request.

## Success Criteria

- All 25 project details, including Crypto Quest, have intentional presentation families.
- Active projects feel like production showcases rather than technical documentation.
- Flagships are recognizably distinct from one another.
- Supporting projects reuse family primitives without looking like one uniform template.
- Samples and archives remain concise and honestly labeled.
- Canonical data and generated outputs remain synchronized.
- Existing lazy loading, navigation, media expansion, public links, accessibility, and responsive behavior continue to work.
- Full `npm test` passes.
- Browser QA finds no horizontal overflow at desktop or 390px.
