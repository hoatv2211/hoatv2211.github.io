"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright-core");
const root = path.resolve(__dirname, "..");

async function main() {
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const file = path.resolve(root, `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file)) {
      response.writeHead(404).end(); return;
    }
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
    response.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    const launchOptions = { headless: true };
    if (process.env.CHROME_PATH) {
      launchOptions.executablePath = process.env.CHROME_PATH;
    }
    browser = await chromium.launch(launchOptions);
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.route("**/*", route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    const highlights = () => page.locator("#case-study-sample [data-detail-category]").evaluateAll(items => items.map(item => item.dataset.detailCategory));
    let baseline;
    for (const query of ["", "?focus=automation", "?focus=rpg", "?focus=all"]) {
      await page.goto(`${origin}/${query}`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.querySelectorAll('#case-study-sample [data-detail-category]').length === 9);
      assert.equal(await page.locator('dialog[data-hiring-focus], select[data-focus-select], [data-focus-reopen]').count(), 0, "Public entry has no hiring dialog or perspective select");
      assert.equal(await page.evaluate(() => document.body.dataset.recruiterFocus), "all", "Query focus must not change public framing");
      assert.deepEqual(await highlights(), ["flyingphoenix", "muloren", "sandwich", "dalgona", "idleCyber", "nekoverse", "proxyapi-mad", "brproxies", "gamestudio-codexkit"]);
      const state = await page.evaluate(() => ({
        intro: document.querySelector('.about-text > p').textContent,
        cta: document.querySelector('.hero-cta-group .portfolio-cta-primary').textContent,
        cards: [...document.querySelectorAll('.focus-card-description')].map(item => item.textContent),
        catalog: [...document.querySelectorAll('[data-render="portfolio-list"] > [data-filter-item]')].map(item => ({ key: item.dataset.detailCategory, hidden: item.hidden })),
        keys: window.PORTFOLIO_DATA.map(project => project.detailCategory),
        services: [...document.querySelectorAll('.service-list > li')].map(item => item.hidden)
      }));
      assert.deepEqual(state.catalog.map(item => item.key).sort(), state.keys.sort(), "Keep the complete catalog");
      assert.ok(state.catalog.every(item => !item.hidden));
      assert.ok(state.services.length && state.services.every(hidden => !hidden), "Keep all services");
      const framing = { intro: state.intro, cta: state.cta, cards: state.cards };
      if (!baseline) baseline = framing;
      else assert.deepEqual(framing, baseline, "Focus query cannot change any public project framing");
    }
    assert.equal(await page.locator('#case-study-sample .focus-project-role').count(), 9, 'Selected cards show canonical ownership');
    await page.goto(`${origin}/?backups=1`, { waitUntil: "domcontentloaded" });
    await page.locator('#loading-overlay').waitFor({ state: 'hidden' });
    assert.ok(await page.locator('#backup-style-toggle').isVisible(), "Optional backup style control remains available");
    await page.locator('#backup-style-toggle').click();
    assert.ok(await page.locator('#backup-style-overlay').isVisible(), "Style button opens the style panel");
    await page.locator('#backup-style-close').click();
    await page.locator('#backup-style-overlay').waitFor({ state: 'hidden' });
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      const dock = await page.locator('.portfolio-view-dock').boundingBox();
      const nav = await page.locator('.navbar').boundingBox();
      if (viewport.width < 1250) assert.equal(await page.locator('.navbar').evaluate(e => getComputedStyle(e).position), 'relative');
      assert.ok(dock.y + dock.height <= nav.y || nav.y + nav.height <= dock.y, 'Style dock must not overlap navigation');
      assert.ok(dock.x >= 0 && dock.x + dock.width <= viewport.width, 'Style dock fits viewport');
    }
    console.log("PASS fixed public All Work, focus-query isolation, complete catalog/services and optional style control");
    assert.match(await page.locator(".about-text h2").innerText(), /Hands-on.*Unity.*Full-stack/i, "Headline positions hands-on Unity and full-stack development");
    assert.match(await page.locator(".about-text").innerText(), /8\+ years in game development/, "Experience duration stays scoped to games");
    const handoff = page.locator(".experience-contact");
    const mail = handoff.locator('.portfolio-cta-primary');
    assert.equal(await mail.innerText(), await page.locator('.about-text .portfolio-cta-primary').innerText());
    assert.equal(await mail.getAttribute("href"), await page.locator('.about-text .portfolio-cta-primary').getAttribute('href'));
    assert.equal(await handoff.getByRole("link", { name: "Download CV" }).getAttribute("href"), "assets/Tran-Van-Hoa-Fullstack-CV.pdf");
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector('#loading-overlay')?.remove(); });
      assert.equal(await page.locator('.technical-quick-access').count(), 0, "Redundant Technical work/CV shortcut buttons must be absent");
      assert.equal(await page.locator('.about-text a[href="assets/Tran-Van-Hoa-Fullstack-CV.pdf"]').count(), 1, "Keep the main CV CTA");
      assert.equal(await page.locator('.about-text a[href="#case-study-sample"]').count(), 1, "Keep the main work CTA");
      assert.ok(await page.locator(".hero-video-container").isVisible(), "Keep the intro animation");
    }
    console.log("PASS technical positioning, scoped game tenure, discussion/CV handoff, no redundant shortcuts and preserved intro");
    await page.goto(`${origin}/?focus=automation&project=muloren`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.classList.contains('portfolio-detail-open'));
    assert.equal(await page.evaluate(() => document.body.dataset.recruiterFocus), 'all');
    assert.equal(await page.locator('dialog[open]').count(), 0, 'Deep links never open a hiring picker');
    assert.ok(await page.locator('#portfolio-back-button').isVisible(), 'Project details remain navigable from a fresh deep link');
    console.log('PASS fresh project deep link with ignored focus query');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
