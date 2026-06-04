# Portfolio Patterns

## Portfolio Data Entry

Each `assets/js/portfolio-data.js` item normally includes:

```js
{
  id: "slug",
  title: "Project Title",
  category: "unity",
  detailCategory: "slug",
  description: "One concise card summary.",
  image: {
    src: "assets/images/game/Project/icon.png",
    alt: "Project Title"
  },
  tag: { label: "Unity", className: "unity-icon" }
}
```

Optional fields seen in repo: `demoUrl`, `externalUrl`, `apiUrlAndroid`.

Allowed categories in validator:

- `unity`
- `unreal`
- `applications`
- `agentic`

Common tag classes:

- Unity: `{ label: "Unity", className: "unity-icon" }`
- Applications/agentic: follow nearby entries and existing CSS classes.

## Detail Fragment

File path must match `detailCategory`:

`assets/portfolio-details/<detailCategory>.html`

Root section pattern:

```html
<section class="timeline project-item" data-filter-item data-deactive-item project-detail
  data-detail-category="slug">
  <ul class="project-list"></ul>
  ...content...
</section>
```

Use existing classes: `video-demo`, `video-wrapper`, `project-gallery`, `project-img`, `title-wrapper`, `timeline-list`, `timeline-item`, `timeline-description-list`, `service`, `service-list`, `service-item`.

## Recommended Detail Sections

Use only sections relevant to available evidence:

- Intro video or demo media.
- Screenshot gallery with lazy images and meaningful `alt` text.
- Project summary with dates when known.
- `My Roles` bullets.
- `Production Highlights` bullets.
- `Technical Challenges Solved` bullets.
- Links: WebGL demo, App Store, Google Play, GitHub, trailer, website.

## Copy Rules

- Card `description`: 1 sentence, compact and searchable.
- Detail paragraphs: concrete responsibilities and outcomes.
- Role bullets: start with verbs: `Led`, `Built`, `Implemented`, `Optimized`, `Integrated`, `Shipped`.
- Do not invent download counts, revenue, funding, publisher names, or team sizes.
- If source data is weak, phrase as contribution scope, not proven business impact.

## Asset Rules

- Prefer local assets under `assets/images/...` when present.
- External image URLs are acceptable when already used or user supplies them, but local assets are safer.
- Use `loading="lazy"` on gallery images.
- Keep image `alt` useful and project-specific.
- Do not move large Unity build files for portfolio copy tasks.

