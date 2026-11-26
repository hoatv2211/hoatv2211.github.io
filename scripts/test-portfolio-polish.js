"use strict";
// Run with Playwright available (npm exec --package=playwright -- node ...).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright-core");
const root = path.resolve(__dirname, "..");
const cssPath = path.join(root, "assets/css/portfolio-polish.css");
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4" };
(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, "." + new URL(req.url, "http://localhost").pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const target = file.endsWith(path.sep) ? file + "index.html" : file;
    try { res.setHeader("Content-Type", mime[path.extname(target)] || "application/octet-stream"); res.end(fs.readFileSync(target)); }
    catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const sidebarFailures = [];
    for (const width of [320, 390, 768, 1024, 1250, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html?focus=all`);
      await page.waitForSelector(".service-item-box2");
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(document.getAnimations().filter(a => a.effect.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})));
      });
      // Exercise the shipped cascade before the isolated polish checks below.
      const sidebar = page.locator('[data-sidebar]');
      if (width < 1250) {
        assert.equal(await sidebar.evaluate(e => e.classList.contains('active')), false, `${width}: contacts initially collapsed`);
        assert.equal(await page.locator('.sidebar-info_more .contact-link').first().isVisible(), false);
        await page.locator('[data-sidebar-btn]').click();
        await page.waitForFunction(() => document.querySelector('[data-sidebar]').classList.contains('active'));
      }
      await page.evaluate(async () => {
        await Promise.all(document.getAnimations().filter(a => a.effect.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})));
      });
      const sidebarChecks = await sidebar.evaluate(sidebar => {
        const failures = [];
        const fields = [...sidebar.querySelectorAll('.realname, .name, .title, .contact-link, .contact-info address')];
        for (const field of fields) {
          const style = getComputedStyle(field);
          const range = document.createRange();
          range.selectNodeContents(field);
          const rects = [...range.getClientRects()];
          const label = field.textContent.trim();
          if (style.textOverflow === 'ellipsis' || style.overflowX === 'hidden') failures.push(`${label}: truncation CSS`);
          if (parseFloat(style.fontSize) < 13) failures.push(`${label}: unreadable font`);
          // Text must fit its own box AND every ancestor, including the sidebar's
          // intentional collapse clip. Range rects catch inline-flex text clipping.
          for (let ancestor = field; ancestor && sidebar.contains(ancestor); ancestor = ancestor.parentElement) {
            const box = ancestor.getBoundingClientRect();
            if (rects.some(r => r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)) {
              failures.push(`${label}: text outside ${ancestor.className} (${Math.round(box.width)}px)`);
              break;
            }
          }
        }
        return failures;
      });
      sidebarFailures.push(...sidebarChecks.map(failure => `${width}px: ${failure}`));
      assert.deepEqual(await page.locator('.sidebar .contact-link').allTextContents(), ['hoatv.mad@gmail.com', '+84 374 639 758']);
      if (process.env.SIDEBAR_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SIDEBAR_SCREENSHOT_DIR, { recursive: true });
        await sidebar.screenshot({ path: path.join(process.env.SIDEBAR_SCREENSHOT_DIR, `sidebar-${width}.png`) });
      }
      if (width < 1250) {
        await page.locator('[data-sidebar-btn]').click();
        assert.equal(await sidebar.evaluate(e => e.classList.contains('active')), false, `${width}: contacts collapse again`);
      }
      // Independent of parent integration: mount this override last for its isolated contract.
      await page.evaluate(() => document.querySelectorAll('link[href*="portfolio-polish.css"]').forEach(e => { e.disabled = true; }));
      const original = await page.locator(".hero-video-container").boundingBox();
      const wallpaper = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
      if (fs.existsSync(cssPath)) await page.addStyleTag({ path: cssPath });
      const result = await page.evaluate(() => {
        const box = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right }; };
        const services = [...document.querySelectorAll('.about .service-list > li')];
        return { services: services.map(e => ({ card: box(e), icon: box(e.querySelector('.service-icon-box')), content: box(e.querySelector('.service-content-box')), align: getComputedStyle(e.querySelector('.service-content-box')).textAlign })), section: box(document.querySelector('.about .service')), about: box(document.querySelector('.about-text')), overflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert.equal(result.services.length, 6, `${width}: retain all services`);
      assert.ok(Math.abs(result.section.x - result.about.x) < 2, `${width}: services share reading edge`);
      for (const service of result.services) {
        assert.equal(service.align, "left", `${width}: service copy is left aligned`);
        assert.equal(service.icon.width, 44, `${width}: normalized icon width`);
        assert.equal(service.icon.height, 44, `${width}: normalized icon height`);
        assert.ok(service.content.x >= service.icon.right + 8, `${width}: icon left, copy right`);
      }
      if (width <= 600) {
        assert.ok(result.services.every(s => Math.abs(s.card.width - result.services[0].card.width) < 1));
        for (let i = 1; i < result.services.length; i++) assert.ok(result.services[i].card.y >= result.services[i - 1].card.bottom, `${width}: one service per row`);
      }
      const reading = await page.evaluate(() => {
        const capabilities = document.querySelector('.about .main-skills');
        const heading = capabilities.querySelector('h2').getBoundingClientRect();
        const chips = capabilities.querySelector('[data-focus-capabilities]').getBoundingClientRect();
        const card = document.querySelector('.focus-project-card');
        return { headingBottom: heading.bottom, chipsTop: chips.top, capabilityBorder: getComputedStyle(capabilities).borderTopWidth, panel: getComputedStyle(document.querySelector('article.about')).backgroundColor, bodySize: parseFloat(getComputedStyle(card.querySelector('p')).fontSize) };
      });
      assert.ok(reading.chipsTop >= reading.headingBottom, `${width}: capability heading above chips`);
      assert.equal(reading.capabilityBorder, '0px', `${width}: no nested capabilities border`);
      assert.ok(!reading.panel.startsWith('rgba'), `${width}: opaque reading panel`);
      assert.ok(reading.bodySize >= 14, `${width}: readable project body`);
      for (const control of await page.locator('.about .portfolio-cta').all()) {
        const bounds = await control.boundingBox();
        if (bounds) assert.ok(bounds.height >= 44 && bounds.width >= 44, `${width}: minimum CTA target`);
      }
      await page.keyboard.press('Tab');
      await page.locator('.focus-project-card .portfolio-cta').first().focus();
      const ring = await page.locator('.focus-project-card .portfolio-cta').first().evaluate(e => ({ style: getComputedStyle(e).outlineStyle, width: parseFloat(getComputedStyle(e).outlineWidth) }));
      assert.ok(ring.style !== 'none' && ring.width >= 2, `${width}: visible keyboard focus`);
      assert.equal(result.overflow, false, `${width}: no horizontal overflow`);
      const intro = await page.locator('.hero-video-container').boundingBox();
      // A wrapping sidebar can move the article vertically, but must not resize
      // or horizontally reposition the established intro layout.
      assert.deepEqual({ x: intro.x, width: intro.width, height: intro.height }, { x: original.x, width: original.width, height: original.height }, `${width}: intro footprint preserved`);
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundImage), wallpaper, `${width}: wallpaper preserved`);
      console.log(`PASS ${width}px: six services, shared edges, compact icons, original intro and wallpaper`);
    }
    assert.deepEqual(sidebarFailures, [], "Sidebar text must remain fully readable in the actual CSS cascade");
    assert.deepEqual(errors, [], "No page exceptions");
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
