#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const routes = [
  "/index.html", "/404.html",
  "/backup/recruiter-clean/index.html", "/backup/dev-console/index.html", "/backup/game-studio/index.html",
  "/projects/dalgona-worldchain/", "/projects/idle-cyber/", "/projects/mu-loren-mobile/",
  "/projects/nekoverse/", "/projects/tinh-thien-ha-jx1/"
];

function fileFor(url) {
  const clean = decodeURIComponent(url.split("?")[0]);
  const relative = clean.endsWith("/") ? `${clean}index.html` : clean;
  const file = path.resolve(root, `.${relative}`);
  return file.startsWith(root) ? file : "";
}

const server = http.createServer((request, response) => {
  const file = fileFor(request.url || "/");
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end("Not found"); return;
  }
  response.writeHead(200, { "Content-Type": file.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});

server.listen(0, "127.0.0.1", async () => {
  try {
    const port = server.address().port;
    for (const route of routes) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`);
      if (!response.ok) throw new Error(`${route} returned ${response.status}`);
      const body = await response.text();
      if (!body.trim()) throw new Error(`${route} returned an empty body`);
    }
    const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
    if (/assets\/portfolio-details\/[^"']+\.html/i.test(home)) throw new Error("homepage statically embeds a detail fragment URL");
    if (/<video[^>]*\sautoplay(?:\s|=|>)/i.test(home)) throw new Error("homepage contains autoplay video");
    console.log(`Runtime smoke passed for ${routes.length} routes.`);
  } catch (error) {
    console.error(`Runtime smoke failed: ${error.message}`);
    process.exitCode = 1;
  } finally { server.close(); }
});
