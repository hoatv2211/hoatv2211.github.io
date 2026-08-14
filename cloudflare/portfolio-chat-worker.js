var DEFAULT_ALLOWED_ORIGINS = ["https://hoatv2211.github.io", "http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:8787", "http://127.0.0.1:8787", "http://localhost:8790", "http://127.0.0.1:8790"];
var MAX_BODY_BYTES = 16384;
var MAX_MESSAGES = 12;
var MAX_MESSAGE_CHARS = 1000;
var PORTFOLIO_REFERENCE_URL = "https://raw.githubusercontent.com/hoatv2211/hoatv2211.github.io/main/docs/portfolio-bot-reference.md";

export default { async fetch(request, env) {
  var url = new URL(request.url), origin = request.headers.get("Origin") || "";
  var allowed = isOriginAllowed(origin, env), cors = corsHeaders(origin, env);
  if (request.method === "OPTIONS") {
    if (!allowed) return json({ error: "Origin not allowed" }, 403, {});
    if (!knownRoute(url.pathname)) return json({ error: "Not found" }, 404, cors);
    return new Response(null, { status: 204, headers: cors });
  }
  if (!knownRoute(url.pathname)) return json({ error: "Not found" }, 404, allowed ? cors : {});
  if (!allowed) return json({ error: "Origin not allowed" }, 403, {});
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("Content-Type") || "")) return json({ error: "Content-Type must be application/json" }, 415, cors);
  if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY_BYTES) return json({ error: "Payload too large" }, 413, cors);
  var text, body;
  try { text = await request.text(); } catch (_) { return json({ error: "Invalid body" }, 400, cors); }
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return json({ error: "Payload too large" }, 413, cors);
  try { body = JSON.parse(text); } catch (_) { return json({ error: "Invalid JSON" }, 400, cors); }
  var validation = url.pathname === "/chat" ? validateChat(body) : validateVisit(body);
  if (!validation.ok) return json({ error: validation.error }, validation.status || 400, cors);
  var protection = await protect(request, env, url.pathname.slice(1), body.turnstileToken);
  if (!protection.ok) {
    var protectedHeaders = Object.assign({}, cors);
    if (protection.retryAfter) protectedHeaders["Retry-After"] = String(protection.retryAfter);
    return json({ error: protection.error }, protection.status, protectedHeaders);
  }
  if (url.pathname === "/visit") return visit(body, env, cors, request);
  var messages = body.messages.map(function (m) { return { role: m.role === "assistant" ? "assistant" : "user", content: m.content.trim() }; }).filter(function (m) { return m.content; });
  var lead = detectLead(messages);
  try {
    var reply = await call9Router(env, messages, lead, !production(env) && body.debug === true);
    var sent = lead.qualified ? await sendTelegramLead(env, { sessionId: body.sessionId, pageUrl: body.pageUrl, contact: lead.contact, reason: lead.reason, summary: summarizeConversation(messages) }) : false;
    return json({ reply: reply, leadSent: sent, leadReason: lead.qualified ? lead.reason : "" }, 200, cors);
  } catch (error) {
    var payload = { reply: "I cannot reach the assistant service right now. Please message Hoa directly on Telegram.", leadSent: false, leadReason: "model unavailable" };
    if (!production(env) && body.debug === true) payload.debug = String(error && error.message || error).slice(0, 500);
    return json(payload, 502, cors);
  }
} };

function knownRoute(path) { return path === "/chat" || path === "/visit"; }
function production(env) { return !env || String(env.ENVIRONMENT || "production").toLowerCase() === "production"; }
function origins(env) { return env && env.ALLOWED_ORIGINS ? String(env.ALLOWED_ORIGINS).split(",").map(function (x) { return x.trim(); }).filter(Boolean) : DEFAULT_ALLOWED_ORIGINS; }
function isOriginAllowed(origin, env) { return Boolean(origin) && origins(env).indexOf(origin) !== -1; }
function corsHeaders(origin, env) { var h = { "Vary": "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", "Content-Type": "application/json; charset=utf-8" }; if (isOriginAllowed(origin, env)) h["Access-Control-Allow-Origin"] = origin; return h; }
function json(payload, status, headers) { return new Response(JSON.stringify(payload), { status: status, headers: headers }); }
function ip(request) { return (request.headers.get("CF-Connecting-IP") || "unknown").split(",")[0].trim(); }
function truncatedIp(value) { if (/^\d+\.\d+\.\d+\.\d+$/.test(value)) return value.split(".").slice(0, 3).join(".") + ".0"; return value === "unknown" ? value : value.split(":").slice(0, 4).join(":") + "::"; }
async function protect(request, env, route, token) {
  if (!env || !env.TURNSTILE_SECRET) { if (production(env)) return { ok: false, status: 503, error: "Protection unavailable" }; }
  else try {
    var form = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip(request) });
    var response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    var result = await response.json();
    if (!response.ok || !result.success) return { ok: false, status: 403, error: "Challenge failed" };
  } catch (_) { return { ok: false, status: 503, error: "Protection unavailable" }; }
  if (!env || !env.RATE_LIMITER || typeof env.RATE_LIMITER.limit !== "function") { if (production(env)) return { ok: false, status: 503, error: "Protection unavailable" }; return { ok: true }; }
  var contract = { version: 1, key: route + ":" + (route === "visit" ? truncatedIp(ip(request)) : ip(request)), limit: route === "chat" ? 20 : 1, windowSeconds: 300 };
  try { var decision = await env.RATE_LIMITER.limit(contract); if (!decision || decision.allowed !== true) return { ok: false, status: 429, error: "Rate limit exceeded", retryAfter: Math.max(1, Number(decision && decision.retryAfter) || 300) }; }
  catch (_) { return { ok: false, status: 503, error: "Protection unavailable" }; }
  return { ok: true };
}
function only(body, keys) { return Object.keys(body).every(function (key) { return keys.indexOf(key) !== -1; }); }
function validateChat(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Body must be an object" };
  if (!only(body, ["sessionId", "messages", "pageUrl", "turnstileToken", "debug"])) return { ok: false, error: "Unsupported field" };
  if (typeof body.turnstileToken !== "string" || !body.turnstileToken.trim()) return { ok: false, error: "turnstileToken is required" };
  if (typeof body.sessionId !== "string" || !body.sessionId || body.sessionId.length > 128) return { ok: false, error: "sessionId is required" };
  if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > MAX_MESSAGES) return { ok: false, error: "messages are required" };
  for (var i = 0; i < body.messages.length; i++) if (!body.messages[i] || typeof body.messages[i].content !== "string" || body.messages[i].content.length > MAX_MESSAGE_CHARS) return { ok: false, status: body.messages[i] && typeof body.messages[i].content === "string" ? 413 : 400, error: "Invalid message" };
  if (body.pageUrl !== undefined && (typeof body.pageUrl !== "string" || body.pageUrl.length > 500)) return { ok: false, error: "Invalid pageUrl" };
  return { ok: true };
}
function validateVisit(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Body must be an object" };
  if (!only(body, ["pageUrl", "turnstileToken"])) return { ok: false, error: "Unsupported field" };
  if (typeof body.turnstileToken !== "string" || !body.turnstileToken.trim()) return { ok: false, error: "turnstileToken is required" };
  if (typeof body.pageUrl !== "string" || !body.pageUrl || body.pageUrl.length > 500) return { ok: false, error: "pageUrl is required" };
  return { ok: true };
}
async function visit(body, env, cors, request) {
  var token = getTelegramToken(env), chatId = getTelegramChatId(env);
  if (!token || !chatId) return json({ error: "Service unavailable" }, 503, cors);
  var country = String((request.cf && request.cf.country) || request.headers.get("CF-IPCountry") || "unknown").slice(0, 64);
  var text = ["Portfolio visit", "IP range: " + truncatedIp(ip(request)), "Country: " + country, "Page: " + body.pageUrl, "Time: " + new Date().toISOString()].join("\n");
  try { var response = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text: text, disable_web_page_preview: true }) }); return json({ ok: response.ok }, response.ok ? 200 : 502, cors); }
  catch (_) { return json({ error: "Upstream unavailable" }, 502, cors); }
}
async function call9Router(env, messages, lead, debug) {
  requireEnv(env, ["NINEROUTER_URL", "NINEROUTER_KEY", "NINEROUTER_MODEL"]);
  var chatUrl = String(env.NINEROUTER_URL).replace(/\/+$/, "") + (/\/v1$/i.test(String(env.NINEROUTER_URL).replace(/\/+$/, "")) ? "/chat/completions" : "/v1/chat/completions");
  var reference = "";
  try { var ref = await fetch(env.PORTFOLIO_REFERENCE_URL || PORTFOLIO_REFERENCE_URL); if (ref.ok) reference = String(await ref.text()).slice(0, 24000); } catch (_) {}
  var response = await fetch(chatUrl, { method: "POST", headers: { "Authorization": "Bearer " + env.NINEROUTER_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ model: env.NINEROUTER_MODEL, temperature: 0.35, max_tokens: 650, messages: [{ role: "system", content: "You are HoaTV/MAD's portfolio assistant. Use this reference and do not invent details:\n" + reference }].concat(messages) }) });
  if (!response.ok) { var detail = debug ? " " + (await response.text()).slice(0, 300) : ""; throw new Error("9Router request failed" + detail); }
  var data = await response.json(), reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!reply) throw new Error("9Router returned no reply"); return String(reply).trim();
}
function detectLead(messages) { var text = messages.map(function (m) { return m.content; }).join("\n").toLowerCase(), contact = extractContact(text), intent = /(hire|hiring|recruit|interview|contract|freelance|collaborat|proposal|budget|timeline|project)/i.test(text); return { qualified: Boolean(contact && intent), contact: contact, reason: contact && intent ? "contact + hiring intent" : "" }; }
function extractContact(text) { var match = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i) || text.match(/(?:t\.me\/|telegram[:\s@]+|@)[a-z0-9_]{5,}/i) || text.match(/(?:\+?\d[\d\s().-]{7,}\d)/); return match ? match[0].trim() : ""; }
async function sendTelegramLead(env, lead) { var token = getTelegramToken(env), chatId = getTelegramChatId(env); if (!token || !chatId) return false; try { var response = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text: ["New portfolio chatbot lead", "Contact: " + lead.contact, "Reason: " + lead.reason, "Page: " + (lead.pageUrl || "unknown"), "Session: " + lead.sessionId, "Summary:", lead.summary].join("\n").slice(0, 3900), disable_web_page_preview: true }) }); return response.ok; } catch (_) { return false; } }
function getTelegramToken(env) { return env && (env.TELEGRAM_TOKEN || env.TELEGRAM_BOT_TOKEN); }
function getTelegramChatId(env) { return env && env.TELEGRAM_CHAT_ID; }
function summarizeConversation(messages) { return messages.slice(-8).map(function (m) { return m.role + ": " + m.content.replace(/\s+/g, " ").slice(0, 280); }).join("\n"); }
function requireEnv(env, keys) { keys.forEach(function (key) { if (!env || !env[key]) throw new Error("Missing env var: " + key); }); }
