# Flying Phoenix Chronicles Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Flying Phoenix Chronicles as a featured personal Unity MMORPG case study using all eleven approved portrait showcase images.

**Architecture:** Keep `portfolio.json` canonical, generate runtime card/detail payloads with the existing scripts, and reuse `flagship-worlds`. Add one generic portrait-led renderer modifier inferred from the hero media fit, plus scoped responsive CSS. Store optimized WebP derivatives locally and add the same thin fragment and SEO route used by other projects.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js contract tests, Python Pillow for deterministic WebP conversion.

**Commit policy:** Do not commit or push. The repository requires explicit commit authorization, which was not provided.

---

## File Structure

Create:

- `assets/images/portfolio-details/flying-phoenix-chronicles/*.webp`: eleven optimized portrait showcase derivatives.
- `assets/portfolio-details/flyingphoenix.html`: thin canonical detail fragment.
- `projects/flying-phoenix-chronicles/index.html`: SEO route and accessible portfolio backlink.

Modify:

- `portfolio.json`: new canonical project and featured-set adjustment.
- `assets/js/portfolio-detail-renderer.js`: generic portrait-led class inference.
- `assets/css/portfolio-details.css`: desktop and mobile portrait-led flagship treatment.
- `sitemap.xml`: new canonical project route.
- `scripts/test-detail-renderer.js`: portrait-led renderer contract.
- `scripts/test-detail-style-contract.js`: portrait-led responsive CSS contract.
- `scripts/test-portfolio-detail-data.js`: 23 active cards and 26 detail records.
- `scripts/test-backup-portfolio-contract.js`: 23 active backup records.
- `scripts/test-portfolio-compatibility.js`: expected Flying Phoenix runtime record and ordering.
- `scripts/test-media-inventory.js`: 26 canonical projects and Flying Phoenix media presence.
- `scripts/test-detail-audit-contract.js`: six canonical routes and 26 detail keys.
- `scripts/audit-portfolio-details.js`: add the new route to browser audit coverage.

Generate:

- `assets/js/portfolio-data.js`
- `assets/js/portfolio-detail-index.js`
- `assets/data/portfolio-details.json`

## Task 1: Lock the new project contracts

**Files:**

- Modify: `scripts/test-detail-renderer.js`
- Modify: `scripts/test-detail-style-contract.js`
- Modify: `scripts/test-portfolio-detail-data.js`
- Modify: `scripts/test-backup-portfolio-contract.js`
- Modify: `scripts/test-portfolio-compatibility.js`
- Modify: `scripts/test-media-inventory.js`
- Modify: `scripts/test-detail-audit-contract.js`

- [ ] **Step 1: Add the portrait-led renderer assertion**

Add a portrait hero case after `flagshipFamilyHtml`:

```js
const portraitFlagship = structuredClone(showcase);
portraitFlagship.detailKey = "portrait-flagship";
portraitFlagship.detail.presentation.layoutVariant = "flagship-worlds";
portraitFlagship.detail.presentation.theme = "portrait-flagship";
portraitFlagship.detail.presentation.heroMediaKey = "revive";
portraitFlagship.detail.media[0].fit = "portrait";
const portraitFlagshipHtml = renderer.render(
  portraitFlagship,
  '<section project-detail data-detail-category="portrait-flagship"></section>'
);
assert.match(portraitFlagshipHtml, /detail-showcase--portrait-led/);
```

- [ ] **Step 2: Add the responsive style assertions**

Add these selectors to `scripts/test-detail-style-contract.js`:

```js
assert.ok(css.includes(".detail-showcase--portrait-led"), "missing portrait-led flagship CSS");
assert.match(
  css,
  /@media \(max-width: 760px\)[\s\S]*\.detail-showcase--portrait-led \.detail-showcase-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/,
  "portrait-led flagship hero must collapse to one column"
);
```

- [ ] **Step 3: Update canonical record counts and compatibility order**

Change active card counts from 22 to 23 and detail/project counts from 25 to 26. Append `flyingphoenix` to the expected legacy runtime id array and assert its detail route:

```js
assert.strictEqual(current.length, 23, "runtime compatibility set must contain 23 active records");
assert.ok(current.some((project) => project.id === "flyingphoenix"));
assert.strictEqual(
  current.find((project) => project.id === "flyingphoenix").detailUrl,
  "projects/flying-phoenix-chronicles/"
);
```

Update `test-detail-audit-contract.js` to expect six canonical routes and 26 detail keys. Update backup and media inventory tests to expect 23 active records and 26 canonical projects.

- [ ] **Step 4: Run focused tests and confirm the expected failures**

Run:

```powershell
node scripts/test-detail-renderer.js
node scripts/test-detail-style-contract.js
node scripts/test-portfolio-detail-data.js
node scripts/test-backup-portfolio-contract.js
node scripts/test-portfolio-compatibility.js
node scripts/test-media-inventory.js
node scripts/test-detail-audit-contract.js
```

Expected: failures for missing portrait-led class/CSS and absent Flying Phoenix project/counts.

## Task 2: Create optimized portrait media

**Files:**

- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/01-combat-boss-mobs.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/02-combat-skill-impact.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/03-hero-equipment.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/04-skill-build.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/05-mount-advancement.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/06-inventory-gear.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/07-pet-collection.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/08-mounted-exploration.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/09-world-exploration.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/10-hero-pet-party.webp`
- Create: `assets/images/portfolio-details/flying-phoenix-chronicles/11-main-menu.webp`

- [ ] **Step 1: Convert the approved PNG files deterministically**

Use Pillow to preserve `1080 x 1920`, metadata-free RGB output, and reduce quality only until each file meets the repository budget: 500 KiB for the hero and 250 KiB for supporting media. Start at quality 84 and stop at quality 58. If an image is still over budget at 58, stop and record a narrow `budgetException` in canonical media instead of reducing text readability further.

```powershell
@'
from pathlib import Path
from PIL import Image

source = Path(r"D:/2026/FlyingPhoenixChronicles/artifacts/google-play-showcase-en-20260823/final/portfolio/phone")
target = Path(r"D:/2026/hoatv2211.github.io/assets/images/portfolio-details/flying-phoenix-chronicles")
target.mkdir(parents=True, exist_ok=True)

for png in sorted(source.glob("*.png")):
    out = target / f"{png.stem}.webp"
    limit = 500 * 1024 if png.name.startswith("01-") else 250 * 1024
    image = Image.open(png).convert("RGB")
    if image.size != (1080, 1920):
        raise SystemExit(f"unexpected dimensions: {png} {image.size}")
    for quality in range(84, 57, -2):
        image.save(out, "WEBP", quality=quality, method=6, exact=True)
        if out.stat().st_size <= limit:
            break
    print(out.name, out.stat().st_size)
'@ | python -B -
```

- [ ] **Step 2: Decode and inspect all derivatives**

Run a Pillow check that asserts every output is WebP, `1080 x 1920`, RGB, and non-empty.

Expected: eleven valid WebP files with no source PNG mutation.

## Task 3: Add the canonical project and featured-set adjustment

**Files:**

- Modify: `portfolio.json`

- [ ] **Step 1: Demote only JX1 from the featured set**

Change JX1 to:

```json
"featured": false,
"featuredOrder": null
```

Keep its status, route, display order, detail data, and `flagship-worlds` presentation unchanged.

- [ ] **Step 2: Add Flying Phoenix Chronicles as active project 26**

Use these identity and presentation fields:

```json
{
  "id": "flying-phoenix-chronicles",
  "title": "Flying Phoenix Chronicles",
  "category": "unity",
  "genre": "Mobile MMORPG",
  "period": "2026 - Present",
  "engine": "Unity",
  "role": "Creator / Lead Developer",
  "description": "A personal Unity MMORPG project built around live combat, hero progression, companions, traversal, and interconnected feature systems for mobile play.",
  "slug": "flying-phoenix-chronicles",
  "legacyId": "flyingphoenix",
  "detailKey": "flyingphoenix",
  "status": "active",
  "type": "personal",
  "featured": true,
  "featuredOrder": 5,
  "platforms": ["Mobile"],
  "summary": "A personal Unity MMORPG project built around live combat, hero progression, companions, traversal, and interconnected feature systems for mobile play.",
  "image": {
    "src": "assets/images/portfolio-details/flying-phoenix-chronicles/01-combat-boss-mobs.webp",
    "alt": "Flying Phoenix Chronicles combat showcase"
  },
  "detailRoute": "projects/flying-phoenix-chronicles/",
  "playableUrl": null,
  "externalUrl": null,
  "runtimeLinks": { "apiUrlAndroid": null, "apiUrlIos": null },
  "displayOrder": 26
}
```

- [ ] **Step 3: Add Tier B rendered detail data**

Use status `Personal project in development`, four contribution bullets from the approved spec, eleven portrait image records with unique keys `hero`, `combat-impact`, `hero-profile`, `skill-build`, `mount`, `inventory`, `pets`, `traversal`, `world`, `party`, and `main-menu`, and no evidence links.

Use this story mapping:

```json
"storyBeats": [
  { "id": "combat", "kicker": "Combat foundation", "mediaKeys": ["combat-impact", "skill-build"], "layout": "wide" },
  { "id": "hero", "kicker": "Hero construction", "mediaKeys": ["hero-profile", "inventory"], "layout": "split" },
  { "id": "companions", "kicker": "Companion progression", "mediaKeys": ["mount", "pets"], "layout": "offset" },
  { "id": "world", "kicker": "World traversal", "mediaKeys": ["traversal", "world"], "layout": "wide" },
  { "id": "systems", "kicker": "Connected systems", "mediaKeys": ["party", "main-menu"], "layout": "split" }
]
```

Use these exact story titles and bodies:

```json
[
  {
    "id": "combat",
    "title": "Combat defines the first decision",
    "body": "Live encounters and skill impact establish the immediate player experience, while the skill wheel exposes deliberate build choices."
  },
  {
    "id": "hero",
    "title": "Hero identity grows through connected systems",
    "body": "Character presentation, equipment, inventory, and build decisions turn each reward into visible progression."
  },
  {
    "id": "companions",
    "title": "Mounts and pets extend long-term progression",
    "body": "Companion systems support collection, movement, formation choices, and a stronger sense of ownership across the journey."
  },
  {
    "id": "world",
    "title": "Traversal connects arenas and encounters",
    "body": "Floating platforms, forest paths, and combat spaces establish a readable world built for mobile exploration."
  },
  {
    "id": "systems",
    "title": "The feature set works as one MMORPG loop",
    "body": "Hero, companions, progression, crafting access, and guild navigation converge in one connected player journey."
  }
]
```

Set every image to `fit: "portrait"`, `width: 1080`, and `height: 1920`. Mark only `hero` as featured.

Use this palette:

```json
{
  "ink": "#071426",
  "panel": "#0b1d31",
  "accent": "#efc86c",
  "accentAlt": "#f5d98c",
  "text": "#f5f2e9",
  "muted": "#b9ccdc"
}
```

- [ ] **Step 4: Validate canonical data**

Run:

```powershell
npm run validate:portfolio
```

Expected: canonical validation passes with five featured projects ordered 1 through 5.

## Task 4: Add fragment, SEO route, sitemap, and browser audit route

**Files:**

- Create: `assets/portfolio-details/flyingphoenix.html`
- Create: `projects/flying-phoenix-chronicles/index.html`
- Modify: `sitemap.xml`
- Modify: `scripts/audit-portfolio-details.js`

- [ ] **Step 1: Create the thin fragment**

Use exactly:

```html
<section class="timeline project-item" data-filter-item data-deactive-item project-detail data-detail-category="flyingphoenix"></section>
```

- [ ] **Step 2: Create the SEO route**

Create this route document:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Flying Phoenix Chronicles | HoaTV</title>
  <meta name="description" content="Personal Unity MMORPG project covering live combat, hero progression, companions, traversal, and connected mobile feature systems.">
  <link rel="canonical" href="https://hoatv2211.github.io/projects/flying-phoenix-chronicles/">
  <link rel="icon" href="../../assets/logo.png">
  <meta property="og:type" content="website"><meta property="og:site_name" content="HoaTV Portfolio">
  <meta property="og:title" content="Flying Phoenix Chronicles | HoaTV">
  <meta property="og:description" content="An in-development personal Unity MMORPG built around combat, progression, companions, traversal, and connected feature systems.">
  <meta property="og:url" content="https://hoatv2211.github.io/projects/flying-phoenix-chronicles/">
  <meta property="og:image" content="https://hoatv2211.github.io/assets/images/portfolio-details/flying-phoenix-chronicles/01-combat-boss-mobs.webp">
  <style>body{margin:0;background:#071426;color:#f5f2e9;font:1rem/1.65 system-ui,sans-serif}main{max-width:52rem;margin:auto;padding:4rem 1.25rem}a{color:#efc86c}p{max-width:70ch}.meta{color:#b9ccdc}h1{line-height:1.15}</style>
</head>
<body><main id="project-detail" data-project-slug="flying-phoenix-chronicles"><nav aria-label="Breadcrumb"><a href="../../">&larr; Back to HoaTV portfolio</a></nav><article>
  <p class="meta">Personal project in development &middot; Unity &middot; Mobile MMORPG</p><h1>Flying Phoenix Chronicles</h1>
  <p>A personal Unity MMORPG project built around live combat, hero progression, companions, traversal, and connected feature systems.</p>
  <p><strong>Role:</strong> Creator / Lead Developer</p>
</article></main></body></html>
```

- [ ] **Step 3: Add route discovery and audit coverage**

Add `https://hoatv2211.github.io/projects/flying-phoenix-chronicles/` to `sitemap.xml` and append the new route to `CANONICAL_ROUTES` in `scripts/audit-portfolio-details.js`.

- [ ] **Step 4: Validate routes**

Run:

```powershell
npm run validate:project-routes
node scripts/test-detail-audit-contract.js
```

Expected: six canonical routes pass.

## Task 5: Implement the generic portrait-led flagship primitive

**Files:**

- Modify: `assets/js/portfolio-detail-renderer.js`
- Modify: `assets/css/portfolio-details.css`

- [ ] **Step 1: Infer the portrait modifier in the renderer**

In `renderNarrativeShowcase`, resolve the hero media and append the modifier without slug checks:

```js
const heroMedia = mediaMap.get(detail.presentation.heroMediaKey);
const portraitClass = heroMedia?.fit === "portrait" ? " detail-showcase--portrait-led" : "";
const familyClass = `detail-showcase--${classToken(family)}${portraitClass}`;
```

- [ ] **Step 2: Add desktop portrait-led CSS**

Add scoped rules that keep the hero at `minmax(280px, 0.7fr) minmax(0, 1.3fr)`, cap the hero media near 430px, use `object-fit: contain`, and render two-media story beats as large portrait columns with consistent flagship radii. Do not add glow, theme inversion, or slug selectors.

```css
.detail-showcase--portrait-led .detail-showcase-hero {
  grid-template-columns: minmax(280px, 0.7fr) minmax(0, 1.3fr);
  min-height: 0;
}

.detail-showcase--portrait-led .detail-showcase-hero-media {
  width: min(100%, 430px);
  justify-self: center;
  transform: none;
}

.detail-showcase--portrait-led .detail-showcase-hero-media img,
.detail-showcase--portrait-led .detail-story-media img {
  width: 100%;
  height: auto;
  aspect-ratio: 9 / 16;
  object-fit: contain;
}

.detail-showcase--portrait-led .detail-story-media--count-2 {
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  align-items: start;
}
```

- [ ] **Step 3: Add mobile collapse**

Under the existing `@media (max-width: 760px)` block, collapse `.detail-showcase--portrait-led .detail-showcase-hero` and story beats to `minmax(0, 1fr)`, clear negative hero-copy margins, and keep media width at 100% without horizontal overflow.

```css
@media (max-width: 760px) {
  .detail-showcase--portrait-led .detail-showcase-hero,
  .detail-showcase--portrait-led .detail-story-beat,
  .detail-showcase--portrait-led .detail-story-media--count-2 {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-showcase--portrait-led .detail-showcase-hero-copy {
    width: 100%;
    margin: 0;
  }

  .detail-showcase--portrait-led .detail-showcase-hero-media,
  .detail-showcase--portrait-led .detail-story-media {
    width: 100%;
    min-width: 0;
  }
}
```

- [ ] **Step 4: Run renderer and style contracts**

Run:

```powershell
node scripts/test-detail-renderer.js
node scripts/test-detail-style-contract.js
```

Expected: PASS.

## Task 6: Generate runtime data and update count contracts

**Files:**

- Generate: `assets/js/portfolio-data.js`
- Generate: `assets/js/portfolio-detail-index.js`
- Generate: `assets/data/portfolio-details.json`

- [ ] **Step 1: Generate canonical outputs**

Run:

```powershell
npm run generate:portfolio
```

Expected: generated cards contain 23 active records and detail outputs contain 26 records.

- [ ] **Step 2: Run data, compatibility, backup, and media contracts**

Run:

```powershell
node scripts/test-portfolio-detail-data.js
node scripts/test-portfolio-compatibility.js
node scripts/test-backup-portfolio-contract.js
node scripts/test-media-inventory.js
node scripts/test-portfolio-detail-validation.js
```

Expected: PASS with eleven Flying Phoenix media files present and within budget or carrying explicit narrow exceptions.

## Task 7: Full verification and browser QA

**Files:**

- Verify all changed and generated files.

- [ ] **Step 1: Run the full suite**

Run:

```powershell
npm test
git diff --check
```

Expected: all portfolio, route, security, renderer, style, media, backup, and smoke contracts pass.

- [ ] **Step 2: Start the existing local portfolio server**

Use the repository's existing `run.py` or static-server workflow without changing dependencies.

- [ ] **Step 3: Browser QA at desktop and mobile**

Check the main portfolio and the new route at 1440 x 900, 390 x 844, and 320px narrow mobile when feasible. Verify project card discovery, detail opening, all eleven images, media expansion and Escape close, readable text, no overflow, no overlapping fixed controls, and the three backup routes.

- [ ] **Step 4: Run the design-taste pre-flight**

Confirm one dark project theme, one gold accent family, consistent radii, no em-dash or en-dash in new visible copy, no duplicate CTA intent, no decorative status dots, no tiny portrait cards, no fake metrics, no broken alt text, and reduced-motion compatibility.

- [ ] **Step 5: Report without publishing**

List changed files, generated artifacts, image sizes, automated results, browser breakpoints, and residual risks. Do not commit, push, deploy, or publish.
