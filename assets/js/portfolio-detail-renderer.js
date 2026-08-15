(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function externalAttributes(url) {
    return /^https?:\/\//i.test(url || "") ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  function listSection(title, items, className) {
    if (!Array.isArray(items) || items.length === 0) return "";
    return `<section class="detail-section ${className}"><h3 class="detail-section-title">${escapeHtml(title)}</h3><ul class="detail-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`;
  }

  function textSection(title, text, className) {
    if (!text) return "";
    return `<section class="detail-section ${className}"><h3 class="detail-section-title">${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></section>`;
  }

  function renderFacts(project) {
    const facts = [];
    if (project.role) facts.push(["Role", project.role]);
    if (project.teamSize) facts.push(["Team", `team of ${project.teamSize}`]);
    if (project.period) facts.push(["Period", project.period]);
    if (Array.isArray(project.platforms) && project.platforms.length) facts.push(["Platforms", project.platforms.join(" · ")]);
    if (!facts.length) return "";
    return `<dl class="detail-facts">${facts.map(([label, value]) => `<div class="detail-fact"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
  }

  function renderImage(media, featured) {
    const fit = ["cover", "contain", "portrait"].includes(media.fit) ? media.fit : "cover";
    const dimensions = Number.isFinite(media.width) && Number.isFinite(media.height)
      ? ` width="${media.width}" height="${media.height}"`
      : "";
    const loading = featured ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
    return `<figure class="detail-media detail-media--${fit}"><button class="detail-media-trigger" type="button" data-expand-media aria-label="Expand ${escapeHtml(media.alt)}"><img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt)}"${dimensions}${loading} decoding="async"></button>${media.caption ? `<figcaption>${escapeHtml(media.caption)}</figcaption>` : ""}</figure>`;
  }

  function renderVideo(media) {
    const preload = media.featured ? "metadata" : "none";
    const poster = media.poster ? ` poster="${escapeHtml(media.poster)}"` : "";
    const fallback = media.fallbackUrl || media.src;
    return `<figure class="detail-media detail-media--video"><video controls preload="${preload}"${poster}><source src="${escapeHtml(media.src)}">Your browser cannot play this video. <a href="${escapeHtml(fallback)}"${externalAttributes(fallback)}>Open video</a></video>${media.caption ? `<figcaption>${escapeHtml(media.caption)}</figcaption>` : ""}</figure>`;
  }

  function renderEmbed(media) {
    const allow = media.allow || "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    return `<figure class="detail-media detail-media--embed"><iframe src="${escapeHtml(media.src)}" title="${escapeHtml(media.title || media.alt || "Embedded project media")}" loading="lazy" allow="${escapeHtml(allow)}" allowfullscreen></iframe>${media.caption ? `<figcaption>${escapeHtml(media.caption)}</figcaption>` : ""}</figure>`;
  }

  function renderDemo(media) {
    const label = media.label || "Launch demo";
    return `<article class="detail-media detail-media--demo">${media.poster ? `<img src="${escapeHtml(media.poster)}" alt="${escapeHtml(media.alt || `${label} preview`)}" loading="lazy" decoding="async">` : ""}<div class="detail-demo-copy"><h4>${escapeHtml(label)}</h4>${media.note ? `<p>${escapeHtml(media.note)}</p>` : ""}<a class="detail-cta" href="${escapeHtml(media.src)}"${externalAttributes(media.src)}>${escapeHtml(label)}</a></div></article>`;
  }

  function renderMediaItem(media, featured) {
    if (!media || !media.src) return "";
    if (media.type === "video") return renderVideo(media);
    if (media.type === "embed") return renderEmbed(media);
    if (media.type === "demo") return renderDemo(media);
    return renderImage(media, featured);
  }

  function renderMedia(detail) {
    const media = Array.isArray(detail.media) ? detail.media : [];
    if (!media.length) return { featured: "", gallery: "" };
    const featuredIndex = Math.max(0, media.findIndex((item) => item.featured));
    const featuredItem = media[featuredIndex];
    const supporting = media.filter((_, index) => index !== featuredIndex);
    return {
      featured: `<section class="detail-section detail-featured-media" aria-label="Featured project media">${renderMediaItem(featuredItem, featuredItem.type === "image")}</section>`,
      gallery: supporting.length ? `<section class="detail-section detail-supporting-media"><h3 class="detail-section-title">Supporting gallery</h3><div class="detail-gallery detail-gallery--mixed">${supporting.map((item) => renderMediaItem(item, false)).join("")}</div></section>` : "",
    };
  }

  function renderEvidence(detail) {
    if (!Array.isArray(detail.evidence) || !detail.evidence.length) return "";
    return `<section class="detail-section detail-evidence"><h3 class="detail-section-title">Evidence and links</h3><ul class="detail-link-list">${detail.evidence.map((item) => `<li><a href="${escapeHtml(item.url)}"${externalAttributes(item.url)}>${escapeHtml(item.label)}</a>${item.status ? `<span class="detail-evidence-status">${escapeHtml(item.status)}</span>` : ""}</li>`).join("")}</ul></section>`;
  }

  function classToken(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function mediaByKey(detail) {
    return new Map((detail.media || []).filter((media) => media.key).map((media) => [media.key, media]));
  }

  const SHOWCASE_ACTIONS = [
    ["Demo", "Play Demo"],
    ["Webgl", "Play WebGL"],
    ["Website", "Visit Website"],
    ["App Store", "App Store"],
    ["Google Play", "Google Play"],
    ["Youtube Trailer", "Watch Trailer"],
    ["World App", "Open World App"],
    ["Github", "View GitHub"],
    ["Github Org", "GitHub Organization"],
    ["Sensor Tower Android", "Market Listing"],
  ];

  const SHOWCASE_VARIANTS = new Set([
    "production-showcase",
    "flagship-worlds",
    "mobile-campaign",
    "gameplay-editorial",
    "product-console",
    "compact-proof",
  ]);

  function renderShowcaseActions(detail, limit, offset = 0) {
    const evidence = Array.isArray(detail.evidence) ? detail.evidence : [];
    const actions = SHOWCASE_ACTIONS.map(([evidenceLabel, label]) => {
      const item = evidence.find((candidate) => candidate.label === evidenceLabel);
      return item ? { item, label } : null;
    }).filter(Boolean);
    const visibleActions = actions.slice(offset, limit ? offset + limit : actions.length);
    return visibleActions.map(({ item, label }, index) => `<a class="detail-showcase-action detail-showcase-action--${index === 0 ? "primary" : "secondary"}" href="${escapeHtml(item.url)}"${externalAttributes(item.url)}>${escapeHtml(label)}</a>`).join("");
  }

  function renderPaletteStyle(palette) {
    const tokens = [
      ["ink", "--showcase-ink"],
      ["panel", "--showcase-panel"],
      ["accent", "--showcase-accent"],
      ["accentAlt", "--showcase-accent-alt"],
      ["text", "--showcase-text"],
      ["muted", "--showcase-muted"],
    ];
    const declarations = tokens.map(([key, property]) => {
      const value = String(palette?.[key] || "").trim();
      return /^#[0-9a-f]{6}$/i.test(value) ? `${property}: ${value.toLowerCase()}` : "";
    }).filter(Boolean);
    return declarations.length ? ` style="${declarations.join("; ")}"` : "";
  }

  function renderProductionStrip(project) {
    const facts = [
      ["Role", project.role],
      ["Team", project.teamSize ? `Team of ${project.teamSize}` : ""],
      ["Period", project.period],
      ["Platform", Array.isArray(project.platforms) ? project.platforms.join(" / ") : ""],
    ].filter(([, value]) => value);
    return `<dl class="detail-production-strip">${facts.map(([label, value]) => `<div class="detail-production-fact"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
  }

  function renderStoryBeat(beat, mediaMap) {
    const media = beat.mediaKeys.map((key) => mediaMap.get(key)).filter(Boolean);
    const layout = classToken(beat.layout) || "wide";
    return `<section class="detail-story-beat detail-story-beat--${layout}" data-story-beat="${escapeHtml(beat.id)}"><div class="detail-story-copy"><p class="detail-story-kicker">${escapeHtml(beat.kicker)}</p><h3>${escapeHtml(beat.title)}</h3><p>${escapeHtml(beat.body)}</p></div><div class="detail-story-media detail-story-media--count-${media.length}">${media.map((item) => renderMediaItem(item, false)).join("")}</div></section>`;
  }

  function renderShowcaseHero(project, mediaMap) {
    const detail = project.detail;
    const presentation = detail.presentation;
    const heroMedia = mediaMap.get(presentation.heroMediaKey);
    const actions = renderShowcaseActions(detail, 2);
    return `<header class="detail-showcase-hero"><div class="detail-showcase-hero-media">${heroMedia ? renderMediaItem(heroMedia, true) : ""}</div><div class="detail-showcase-hero-copy"><span class="detail-status">${escapeHtml(detail.statusLabel)}</span><p class="detail-showcase-eyebrow">${escapeHtml(presentation.eyebrow)}</p><h2 class="detail-title">${escapeHtml(project.title)}</h2>${project.summary ? `<p class="detail-showcase-summary">${escapeHtml(project.summary)}</p>` : ""}${actions ? `<div class="detail-showcase-actions">${actions}</div>` : ""}</div></header>`;
  }

  function renderShowcaseClosing(project) {
    const actions = renderShowcaseActions(project.detail, undefined, 2);
    if (!actions) return "";
    return `<footer class="detail-showcase-closing"><p class="detail-story-kicker">Explore the project</p><h3>See ${escapeHtml(project.title)} in motion.</h3><p>Review the public build and project presence for a closer look at the shipped experience.</p><div class="detail-showcase-actions">${actions}</div></footer>`;
  }

  function renderNarrativeShowcase(project, bespoke, family) {
    const detail = project.detail;
    const mediaMap = mediaByKey(detail);
    const story = detail.presentation.storyBeats.map((beat) => renderStoryBeat(beat, mediaMap)).join("");
    const familyClass = `detail-showcase--${classToken(family)}`;
    const storyClass = family === "mobile-campaign"
      ? "detail-showcase-story detail-mobile-rail"
      : family === "product-console"
        ? "detail-showcase-story detail-console-journey"
        : "detail-showcase-story";
    return `<div class="detail-showcase-shell ${familyClass}">${renderShowcaseHero(project, mediaMap)}${renderProductionStrip(project)}<div class="${storyClass}">${story}</div>${listSection("Production contribution", detail.contribution, "detail-showcase-contribution")}${bespoke}${renderShowcaseClosing(project)}</div>`;
  }

  function renderCompactProof(project) {
    const detail = project.detail;
    const presentation = detail.presentation;
    const mediaMap = mediaByKey(detail);
    const heroMedia = mediaMap.get(presentation.heroMediaKey);
    const supporting = (detail.media || []).filter((media) => media.key !== presentation.heroMediaKey);
    const actions = renderShowcaseActions(detail);
    return `<div class="detail-compact-proof"><header class="detail-compact-proof-hero"><div class="detail-compact-proof-copy"><span class="detail-status">${escapeHtml(detail.statusLabel)}</span><p class="detail-showcase-eyebrow">${escapeHtml(presentation.eyebrow)}</p><h2 class="detail-title">${escapeHtml(project.title)}</h2>${project.summary ? `<p class="detail-showcase-summary">${escapeHtml(project.summary)}</p>` : ""}</div>${heroMedia ? `<div class="detail-compact-proof-media">${renderMediaItem(heroMedia, true)}</div>` : ""}</header>${renderProductionStrip(project)}${textSection("Purpose", detail.purpose || project.summary, "detail-purpose")}${supporting.length ? `<section class="detail-section detail-compact-gallery" aria-label="Project proof gallery"><div class="detail-gallery detail-gallery--mixed">${supporting.map((media) => renderMediaItem(media, false)).join("")}</div></section>` : ""}${listSection("Technical notes", detail.technicalNotes, "detail-technical-notes")}${textSection("Archive reason", detail.archiveReason, "detail-archive-reason")}${actions ? `<div class="detail-showcase-actions">${actions}</div>` : ""}</div>`;
  }

  function renderShowcase(project, bespoke) {
    const family = project.detail.presentation.layoutVariant;
    return family === "compact-proof"
      ? renderCompactProof(project)
      : renderNarrativeShowcase(project, bespoke, family);
  }

  function extractBespoke(fragmentHtml, detailKey, mode) {
    const rootKey = fragmentHtml.match(/data-detail-category=["']([^"']+)["']/i)?.[1];
    if (rootKey !== detailKey) throw new Error(`Fragment ${rootKey || "unknown"} does not match project detail key ${detailKey}`);
    if (mode !== "hybrid") return "";
    const bespoke = fragmentHtml.match(/<([a-z0-9-]+)\b[^>]*data-detail-slot=["']bespoke["'][^>]*>([\s\S]*?)<\/\1>/i)?.[2];
    if (bespoke) return `<section class="detail-section detail-bespoke" data-detail-slot="bespoke">${bespoke}</section>`;
    const legacyInner = fragmentHtml.match(/<section\b[^>]*>([\s\S]*)<\/section>\s*$/i)?.[1]?.trim();
    return legacyInner ? `<section class="detail-section detail-bespoke detail-bespoke--legacy" data-detail-slot="bespoke">${legacyInner}</section>` : "";
  }

  function renderTierA(project, media, bespoke) {
    const detail = project.detail;
    return [
      media.featured,
      textSection("Product context", detail.context, "detail-context"),
      textSection("Problem", detail.problem, "detail-problem"),
      listSection("My contribution", detail.contribution, "detail-contribution"),
      listSection("Technical decisions", detail.technicalDecisions, "detail-decisions"),
      listSection("Personal outcome", detail.personalOutcome, "detail-personal-outcome"),
      listSection("Product context and evidence", detail.productContext, "detail-product-context"),
      renderEvidence(detail),
      media.gallery,
      bespoke,
    ].join("");
  }

  function renderTierB(project, media, bespoke) {
    const detail = project.detail;
    return [
      project.summary ? `<p class="detail-summary">${escapeHtml(project.summary)}</p>` : "",
      listSection("My contribution", detail.contribution, "detail-contribution"),
      media.featured,
      media.gallery,
      renderEvidence(detail),
      bespoke,
    ].join("");
  }

  function renderTierC(project, media) {
    const detail = project.detail;
    return [
      textSection("Purpose", detail.purpose || project.summary, "detail-purpose"),
      media.featured,
      media.gallery,
      listSection("Technical notes", detail.technicalNotes, "detail-technical-notes"),
      textSection("Archive reason", detail.archiveReason, "detail-archive-reason"),
      renderEvidence(detail),
    ].join("");
  }

  function render(project, fragmentHtml) {
    if (!project || !project.detail) throw new Error("Project detail data is required");
    const detail = project.detail;
    const bespoke = extractBespoke(fragmentHtml, project.detailKey, detail.mode);
    const presentation = detail.presentation;
    const isShowcase = SHOWCASE_VARIANTS.has(presentation?.layoutVariant);
    const media = isShowcase ? null : renderMedia(detail);
    const body = isShowcase
      ? renderShowcase(project, bespoke)
      : detail.tier === "A"
        ? renderTierA(project, media, bespoke)
        : detail.tier === "B"
          ? renderTierB(project, media, bespoke)
          : renderTierC(project, media);
    const variantClass = isShowcase ? ` detail-case-study--${classToken(presentation.layoutVariant)} detail-theme--${classToken(presentation.theme)}` : "";
    const defaultHeader = isShowcase ? "" : `<header class="detail-header"><span class="detail-status">${escapeHtml(detail.statusLabel)}</span><h2 class="detail-title">${escapeHtml(project.title)}</h2>${renderFacts(project)}</header>`;

    const paletteStyle = isShowcase ? renderPaletteStyle(presentation.palette) : "";
    const projectContext = ` data-project-title="${escapeHtml(project.title)}" data-project-role="${escapeHtml(project.role || "")}" data-showcase-family="${escapeHtml(presentation?.layoutVariant || "")}"`;
    return `<section class="timeline project-item detail-case-study detail-case-study--tier-${detail.tier.toLowerCase()}${variantClass}"${paletteStyle} data-filter-item data-deactive-item project-detail data-detail-category="${escapeHtml(project.detailKey)}"${projectContext}>${defaultHeader}${body}</section>`;
  }

  window.PortfolioDetailRenderer = { render };
})();
