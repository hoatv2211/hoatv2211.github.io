#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const DETAIL_VIEWPORTS = [320, 390, 768, 1280, 1440].map((width) => ({ width, height: width < 700 ? 844 : 900 }));
const ROUTE_VIEWPORTS = [390, 1280].map((width) => ({ width, height: width === 390 ? 844 : 900 }));
const CANONICAL_ROUTES = [
  "projects/mu-loren-mobile/",
  "projects/tinh-thien-ha-jx1/",
  "projects/dalgona-worldchain/",
  "projects/flying-phoenix-chronicles/",
  "projects/idle-cyber/",
  "projects/nekoverse/",
];
const BACKUP_ROUTES = [
  "backup/recruiter-clean/index.html",
  "backup/dev-console/index.html",
  "backup/game-studio/index.html",
];

function loadDetailKeys(root) {
  const canonical = JSON.parse(fs.readFileSync(path.join(root, "portfolio.json"), "utf8"));
  return canonical.projects.map((project) => project.detailKey);
}

function argumentValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function routeUrl(baseUrl, route) {
  return new URL(route, `${baseUrl.replace(/\/$/, "")}/`).href;
}

async function launchLocalBrowser() {
  const failures = [];
  for (const channel of ["chrome", "msedge"]) {
    try {
      return { browser: await chromium.launch({ channel, headless: true }), channel };
    } catch (error) {
      failures.push(`${channel}: ${error.message.split("\n")[0]}`);
    }
  }
  throw new Error(`No local Chrome or Edge channel could be launched. ${failures.join(" | ")}`);
}

async function pageMetrics(page, rootSelector) {
  await page.evaluate((selector) => {
    const root = document.querySelector(selector);
    for (const image of root?.querySelectorAll("img") || []) {
      image.loading = "eager";
      image.scrollIntoView({ block: "center" });
    }
  }, rootSelector);
  await page.waitForTimeout(150);
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) return { missingRoot: true };
    const localImages = [...root.querySelectorAll("img")].filter((image) => {
      try { return new URL(image.currentSrc || image.src, location.href).origin === location.origin; } catch { return false; }
    });
    const brokenLocalImages = localImages
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute("src"));
    const localVideos = [...root.querySelectorAll("video")].filter((video) => {
      try { return new URL(video.currentSrc || video.querySelector("source")?.src || "", location.href).origin === location.origin; } catch { return false; }
    });
    const brokenLocalVideos = localVideos.filter((video) => video.error).map((video) => video.currentSrc || video.querySelector("source")?.src);
    return {
      missingRoot: false,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      rootOverflow: root.scrollWidth > root.clientWidth + 1,
      rootWidth: root.clientWidth,
      rootScrollWidth: root.scrollWidth,
      brokenLocalImages,
      brokenLocalVideos,
      externalIframes: [...root.querySelectorAll("iframe")].map((frame) => frame.src),
      media: [...root.querySelectorAll("img, video, iframe")].map((item) => ({
        tag: item.tagName.toLowerCase(),
        src: item.currentSrc || item.src || "",
        width: Math.round(item.getBoundingClientRect().width),
        height: Math.round(item.getBoundingClientRect().height),
      })),
    };
  }, rootSelector);
}

function classify(record, blocking, warnings) {
  const prefix = `${record.kind}:${record.name}:${record.viewport.width}`;
  if (record.metrics.missingRoot) blocking.push(`${prefix}: missing root`);
  if (record.metrics.documentOverflow) blocking.push(`${prefix}: document overflow`);
  if (record.metrics.rootOverflow) blocking.push(`${prefix}: root overflow ${record.metrics.rootScrollWidth}/${record.metrics.rootWidth}`);
  for (const src of record.metrics.brokenLocalImages || []) blocking.push(`${prefix}: broken local image ${src}`);
  for (const src of record.metrics.brokenLocalVideos || []) blocking.push(`${prefix}: broken local video ${src}`);
  for (const error of record.pageErrors) blocking.push(`${prefix}: page error ${error}`);
  for (const error of record.consoleErrors) warnings.push(`${prefix}: console error ${error}`);
  for (const src of record.metrics.externalIframes || []) warnings.push(`${prefix}: external iframe state is opaque ${src}`);
}

async function auditPage(browser, options) {
  const page = await browser.newPage({ viewport: options.viewport });
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" });
  if (options.openDetail) {
    await page.waitForFunction(() => typeof window.openProjectDetail === "function", null, { timeout: 15000 });
    const opened = await page.evaluate((detailKey) => window.openProjectDetail(detailKey).then(Boolean), options.openDetail);
    if (!opened) throw new Error(`openProjectDetail returned no element for ${options.openDetail}`);
    await page.waitForSelector(`[project-detail][data-detail-category="${options.openDetail}"].active`, { timeout: 15000 });
    await page.waitForSelector(".code-loading", { state: "detached", timeout: 3000 }).catch(() => {});
  }
  const metrics = await pageMetrics(page, options.rootSelector);
  const locator = page.locator(options.rootSelector).first();
  if (await locator.count()) {
    fs.mkdirSync(path.dirname(options.screenshot), { recursive: true });
    await locator.screenshot({ path: options.screenshot });
  }
  await page.close();
  return { kind: options.kind, name: options.name, viewport: options.viewport, url: options.url, metrics, pageErrors, consoleErrors };
}

async function main() {
  const root = path.resolve(__dirname, "..");
  const baseUrl = argumentValue("--base-url", "http://127.0.0.1:8080");
  const evidenceRoot = path.join(root, "audits", "details");
  const detailKeys = loadDetailKeys(root);
  const { browser, channel } = await launchLocalBrowser();
  const records = [];
  const blocking = [];
  const warnings = [];

  try {
    for (const viewport of DETAIL_VIEWPORTS) {
      for (const detailKey of detailKeys) {
        const record = await auditPage(browser, {
          kind: "detail",
          name: detailKey,
          viewport,
          url: routeUrl(baseUrl, "index.html"),
          openDetail: detailKey,
          rootSelector: `[project-detail][data-detail-category="${detailKey}"]`,
          screenshot: path.join(evidenceRoot, String(viewport.width), `${detailKey}.png`),
        });
        records.push(record);
        classify(record, blocking, warnings);
      }
    }

    for (const viewport of ROUTE_VIEWPORTS) {
      for (const route of CANONICAL_ROUTES) {
        const record = await auditPage(browser, {
          kind: "canonical",
          name: route,
          viewport,
          url: routeUrl(baseUrl, route),
          rootSelector: "#project-detail",
          screenshot: path.join(evidenceRoot, "canonical", String(viewport.width), `${route.split("/").filter(Boolean).at(-1)}.png`),
        });
        records.push(record);
        classify(record, blocking, warnings);
      }
      for (const route of BACKUP_ROUTES) {
        const record = await auditPage(browser, {
          kind: "backup",
          name: route,
          viewport,
          url: routeUrl(baseUrl, route),
          rootSelector: "body",
          screenshot: path.join(evidenceRoot, "backup", String(viewport.width), `${route.split("/")[1]}.png`),
        });
        records.push(record);
        classify(record, blocking, warnings);
      }
    }
  } finally {
    await browser.close();
  }

  const report = { browserChannel: channel, baseUrl, recordCount: records.length, blocking, warnings, records };
  fs.mkdirSync(evidenceRoot, { recursive: true });
  fs.writeFileSync(path.join(evidenceRoot, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Portfolio browser audit completed: ${records.length} records, ${blocking.length} blocking, ${warnings.length} warnings.`);
  if (blocking.length) {
    for (const error of blocking) console.error(`ERROR ${error}`);
    process.exit(1);
  }
}

if (require.main === module) main().catch((error) => { console.error(error); process.exit(1); });

module.exports = { BACKUP_ROUTES, CANONICAL_ROUTES, DETAIL_VIEWPORTS, ROUTE_VIEWPORTS, loadDetailKeys };
