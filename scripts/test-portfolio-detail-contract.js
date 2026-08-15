#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DETAILS = path.join(ROOT, "assets", "portfolio-details");
const canonical = JSON.parse(fs.readFileSync(path.join(ROOT, "portfolio.json"), "utf8"));
const errors = [];

function clean(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function report(file, category, message) {
  errors.push(`ERROR ${file} [${category}] ${message}`);
}

function rootMatches(html) {
  return [...html.matchAll(/<section\b[^>]*\bproject-detail\b[^>]*>/gi)];
}

function directInvalidListChildren(html) {
  const invalid = [];
  for (const list of html.matchAll(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const body = list[2].replace(/<!--([\s\S]*?)-->/g, "").trim();
    const withoutListItems = body.replace(/<li\b[^>]*>[\s\S]*?<\/li>/gi, "").trim();
    for (const tag of withoutListItems.matchAll(/<([a-z0-9-]+)\b/gi)) invalid.push(tag[1].toLowerCase());
  }
  return invalid;
}

for (const project of canonical.projects) {
  const file = `${project.detailKey}.html`;
  const filePath = path.join(DETAILS, file);
  if (!fs.existsSync(filePath)) {
    report(file, "root", "fragment is missing");
    continue;
  }
  const html = fs.readFileSync(filePath, "utf8");
  const roots = rootMatches(html);
  if (roots.length !== 1) report(file, "root", `expected one project-detail root, found ${roots.length}`);
  const rootKey = roots[0]?.[0].match(/data-detail-category=["']([^"']+)["']/i)?.[1];
  if (rootKey !== project.detailKey) report(file, "root", `data-detail-category is ${rootKey || "missing"}`);

  const slots = [...html.matchAll(/data-detail-slot=["']bespoke["']/gi)].length;
  if (slots > 1) report(file, "slot", `expected at most one bespoke slot, found ${slots}`);
  if (project.detail.mode !== "hybrid" && slots) report(file, "slot", `${project.detail.mode} mode cannot contain a bespoke slot`);

  for (const heading of html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)) report(file, "heading", `nested h1: ${clean(heading[1]) || "empty"}`);
  for (const item of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) if (!clean(item[1])) report(file, "list", "empty li");
  for (const service of html.matchAll(/<(?:ul|div)\b[^>]*class=["'][^"']*service-list[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi)) if (!clean(service[1])) report(file, "service", "empty service list");
  for (const tag of directInvalidListChildren(html)) if (["div", "a"].includes(tag)) report(file, "list", `direct child <${tag}> under list`);
  if (/\bstyle=["'][^"']*(?:width|height|display|grid|flex|margin|padding|position|top|left|right|bottom)[^"']*["']/i.test(html)) report(file, "style", "inline layout style");
  if (/<!--[^>]*(?:add more|thêm ảnh|placeholder|\.\.\.)[^>]*-->/i.test(html)) report(file, "placeholder", "placeholder comment");
  if (/\bonclick\s*=/i.test(html)) report(file, "interaction", "inline onclick handler");

  const canonicalSources = new Set([...(project.detail.media || []), ...(project.detail.bespokeMedia || [])].map((item) => item.src));
  for (const image of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = image[1];
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, "&");
    const alt = attrs.match(/\balt=["']([^"']*)["']/i)?.[1]?.trim();
    if (!src) report(file, "media", "image missing src");
    if (!alt || /^(?:screenshot|demo|image)(?:\s*\d+)?$/i.test(alt)) report(file, "media", `generic or missing alt for ${src || "image"}`);
    if (!/\bloading=["'](?:lazy|eager)["']/i.test(attrs)) report(file, "media", `missing loading for ${src || "image"}`);
    if (!/\bdecoding=["']async["']/i.test(attrs)) report(file, "media", `missing decoding for ${src || "image"}`);
    if (canonicalSources.has(src) && slots === 0) report(file, "media", `canonical media duplicated in fragment: ${src}`);
  }

  for (const link of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = link[1];
    if (/\btarget=["']_blank["']/i.test(attrs) && !/\brel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(attrs)) {
      report(file, "link", "target=_blank missing noopener noreferrer");
    }
  }

  const blocked = [
    /hundreds of thousands/i,
    /solo-developed the entire mini-game/i,
    /idle cyber[\s\S]{0,300}technical leader/i,
  ];
  for (const pattern of blocked) if (pattern.test(html)) report(file, "claim", `blocked wording matched ${pattern}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`Portfolio detail contract failed with ${errors.length} findings.`);
  process.exit(1);
}

console.log(`Portfolio detail contract passed for ${canonical.projects.length} fragments.`);