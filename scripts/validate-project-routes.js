#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const portfolio = JSON.parse(fs.readFileSync(path.join(root, 'portfolio.json'), 'utf8'));
const expectedOrigin = 'https://hoatv2211.github.io/';
const errors = [];
const seen = { titles: new Set(), descriptions: new Set(), canonicals: new Set() };
const routeProjects = portfolio.projects.filter((project) => project.detailRoute);

function decodeHtml(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function attribute(html, selector, name) {
  const tag = html.match(new RegExp(`<${selector}\\b[^>]*>`, 'i'))?.[0];
  return tag?.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] || '';
}
function meta(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((item) => new RegExp(`\\b${key}=["']${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(item));
  return tag?.match(/\bcontent=["']([^"']+)["']/i)?.[1] || '';
}
function fail(route, message) { errors.push(`${route}: ${message}`); }

for (const project of routeProjects) {
  const route = project.detailRoute;
  if (!/^[a-z0-9-]+\/$/.test(route.replace(/^projects\//, '')) || !route.startsWith('projects/')) {
    fail(route, 'detailRoute must be a canonical projects/<slug>/ path');
    continue;
  }
  const file = path.join(root, ...route.split('/').filter(Boolean), 'index.html');
  if (!fs.existsSync(file)) { fail(route, 'missing index.html'); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const title = decodeHtml(html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || '');
  const description = decodeHtml(meta(html, 'name', 'description'));
  const canonical = decodeHtml(attribute(html, 'link(?=[^>]*\\brel=["\']canonical["\'])', 'href'));
  const expectedCanonical = new URL(route, expectedOrigin).href;
  const og = {
    title: decodeHtml(meta(html, 'property', 'og:title')),
    description: decodeHtml(meta(html, 'property', 'og:description')),
    url: decodeHtml(meta(html, 'property', 'og:url')),
    image: decodeHtml(meta(html, 'property', 'og:image'))
  };

  if (!title) fail(route, 'missing title');
  if (!description) fail(route, 'missing meta description');
  if (canonical !== expectedCanonical) fail(route, `canonical must be ${expectedCanonical}`);
  if (!og.title || !og.description || !og.image) fail(route, 'missing required Open Graph title, description, or image');
  if (og.url !== canonical) fail(route, 'og:url must match canonical');
  if (!html.includes(`data-project-slug="${project.slug}"`)) fail(route, 'detail host slug does not match portfolio.json');
  if (!/<a\b[^>]*href=["']\.\.\/\.\.\/["'][^>]*>/i.test(html)) fail(route, 'missing accessible link back home');

  for (const [kind, value] of [['title', title], ['description', description], ['canonical', canonical]]) {
    if (value && seen[`${kind}s`].has(value)) fail(route, `duplicate ${kind}`);
    seen[`${kind}s`].add(value);
  }

  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const ref = decodeHtml(match[1]);
    if (!ref || /^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(ref)) continue;
    const local = path.resolve(path.dirname(file), ref.split(/[?#]/)[0]);
    if (!fs.existsSync(local)) fail(route, `missing local path: ${ref}`);
  }
}

const flagship = portfolio.projects.filter((project) => project.featured);
if (flagship.length !== 5) errors.push(`portfolio.json: expected 5 featured projects, found ${flagship.length}`);
for (const project of flagship) if (!project.detailRoute) errors.push(`portfolio.json: featured project ${project.slug} has no detailRoute`);

if (errors.length) {
  console.error(`Project route validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Project route validation passed for ${routeProjects.length} canonical routes.`);
