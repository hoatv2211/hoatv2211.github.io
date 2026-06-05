var DEFAULT_ALLOWED_ORIGINS = [
  "https://hoatv2211.github.io",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8787",
  "http://127.0.0.1:8787",
  "http://localhost:8790",
  "http://127.0.0.1:8790"
];

var MAX_MESSAGES = 12;
var MAX_MESSAGE_CHARS = 1200;
var PORTFOLIO_REFERENCE_URL = "https://raw.githubusercontent.com/hoatv2211/hoatv2211.github.io/main/docs/portfolio-bot-reference.md";
var PORTFOLIO_REFERENCE_MAX_CHARS = 24000;
var VISIT_GEO_TIMEOUT_MS = 1200;

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var origin = request.headers.get("Origin") || "";
    var corsHeaders = buildCorsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (!isOriginAllowed(origin, env)) {
      return json({ error: "Origin not allowed" }, 403, corsHeaders);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }

    var body;
    try {
      body = await request.json();
    } catch (error) {
      return json({ error: "Invalid JSON" }, 400, corsHeaders);
    }

    if (url.pathname !== "/chat") {
      return handleVisitHook(body, env, corsHeaders, request);
    }

    var validation = validateBody(body);
    if (!validation.ok) {
      return json({ error: validation.error }, 400, corsHeaders);
    }

    var messages = normalizeMessages(body.messages);
    var lead = detectLead(messages);

    try {
      var reply = await call9Router(env, messages, lead, Boolean(body.debug));
      var leadSent = false;

      if (lead.qualified) {
        leadSent = await sendTelegramLead(env, {
          sessionId: body.sessionId,
          pageUrl: body.pageUrl,
          contact: lead.contact,
          reason: lead.reason,
          summary: summarizeConversation(messages)
        });
      }

      return json({
        reply: reply,
        leadSent: leadSent,
        leadReason: lead.qualified ? lead.reason : ""
      }, 200, corsHeaders);
    } catch (error) {
      return json({
        reply: "I cannot reach the assistant service right now. Please message Hoa directly on Telegram.",
        leadSent: false,
        leadReason: "model unavailable",
        debug: body.debug ? String(error && error.message ? error.message : error).slice(0, 500) : undefined
      }, 502, corsHeaders);
    }
  }
};

function buildCorsHeaders(origin, env) {
  var allowedOrigin = isOriginAllowed(origin, env) && origin ? origin : DEFAULT_ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function isOriginAllowed(origin, env) {
  if (!origin) return true;
  return getAllowedOrigins(env).indexOf(origin) !== -1;
}

function getAllowedOrigins(env) {
  if (!env || !env.ALLOWED_ORIGINS) return DEFAULT_ALLOWED_ORIGINS;
  return String(env.ALLOWED_ORIGINS)
    .split(",")
    .map(function (item) { return item.trim(); })
    .filter(Boolean);
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status: status,
    headers: headers
  });
}

async function handleVisitHook(body, env, corsHeaders, request) {
  var token = getTelegramToken(env);
  var chatId = getTelegramChatId(env);
  if (!token || !chatId) {
    return json({ error: "Telegram env missing" }, 500, corsHeaders);
  }

  var visit = await buildVisitDetails(body, request);
  var text = buildVisitTelegramText(body, visit);

  var response = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 3900),
      disable_web_page_preview: true
    })
  });

  return json({ ok: response.ok }, response.ok ? 200 : 500, corsHeaders);
}

async function buildVisitDetails(body, request) {
  var cf = request.cf || {};
  var headers = request.headers;
  var ip = headers.get("CF-Connecting-IP") || headers.get("X-Forwarded-For") || "unknown";
  var fallback = await fetchVisitGeoFallback(ip, cf);

  return {
    ip: ip,
    userAgent: headers.get("User-Agent") || body.userAgent || "unknown",
    cfRay: headers.get("CF-Ray") || "unknown",
    country: firstValue(cf.country, headers.get("CF-IPCountry"), fallback.country, "unknown"),
    city: firstValue(cf.city, fallback.city, "unknown"),
    region: firstValue(cf.region, fallback.region, ""),
    timezone: firstValue(cf.timezone, fallback.timezone, body.timezone, "unknown"),
    latitude: firstValue(cf.latitude, fallback.latitude, ""),
    longitude: firstValue(cf.longitude, fallback.longitude, ""),
    asn: firstValue(cf.asn, fallback.asn, "unknown"),
    asOrganization: firstValue(cf.asOrganization, fallback.isp, "unknown"),
    colo: firstValue(cf.colo, "unknown"),
    httpProtocol: firstValue(cf.httpProtocol, "unknown"),
    tlsVersion: firstValue(cf.tlsVersion, "unknown"),
    clientTcpRtt: firstValue(cf.clientTcpRtt, "unknown"),
    fallbackSource: fallback.source || "none"
  };
}

async function fetchVisitGeoFallback(ip, cf) {
  if (!ip || ip === "unknown") return {};
  if (cf && cf.city && cf.asOrganization && cf.timezone) return {};

  try {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, VISIT_GEO_TIMEOUT_MS);
    var response = await fetch("https://ipwho.is/" + encodeURIComponent(ip), {
      signal: controller.signal,
      cf: { cacheEverything: true, cacheTtl: 21600 }
    });
    clearTimeout(timer);

    if (!response.ok) return {};

    var data = await response.json();
    if (data && data.success === false) return {};

    return {
      source: "ipwho.is",
      country: data.country || "",
      city: data.city || "",
      region: data.region || "",
      timezone: data.timezone && data.timezone.id,
      latitude: data.latitude,
      longitude: data.longitude,
      isp: data.connection && data.connection.isp,
      asn: data.connection && data.connection.asn
    };
  } catch (error) {
    return {};
  }
}

function buildVisitTelegramText(body, visit) {
  var location = [visit.city, visit.region, visit.country].filter(Boolean).join(", ") || "unknown";
  var browser = buildBrowserSummary(body);
  var legacyText = body.text ? String(body.text) + "\n\n" : "";

  return legacyText + [
    "Co nguoi da xem portfolio cua ban",
    "IP: " + visit.ip,
    "Location: " + location,
    "Coordinates: " + firstValue(visit.latitude, "?") + ", " + firstValue(visit.longitude, "?"),
    "ISP/Org: " + visit.asOrganization,
    "ASN: " + visit.asn,
    "IP Timezone: " + visit.timezone,
    "URL: " + firstValue(body.pageUrl, "unknown"),
    "Referrer: " + firstValue(body.referrer, "direct"),
    "UA: " + visit.userAgent,
    "Time: " + new Date().toISOString(),
    "",
    "Cloudflare:",
    "Country: " + visit.country,
    "Colo: " + visit.colo,
    "HTTP: " + visit.httpProtocol,
    "TLS: " + visit.tlsVersion,
    "RTT: " + visit.clientTcpRtt,
    "CF-Ray: " + visit.cfRay,
    "Geo fallback: " + visit.fallbackSource,
    "",
    "Browser:",
    browser
  ].join("\n");
}

function buildBrowserSummary(body) {
  var screen = body.screen || {};
  var viewport = body.viewport || {};
  var connection = body.connection || {};

  return [
    "Visitor ID: " + firstValue(body.visitorId, "unknown"),
    "Session ID: " + firstValue(body.sessionId, "unknown"),
    "Language: " + firstValue(body.language, "unknown"),
    "Languages: " + (Array.isArray(body.languages) ? body.languages.join(", ") : "unknown"),
    "Browser Timezone: " + firstValue(body.timezone, "unknown"),
    "Platform: " + firstValue(body.platform, "unknown"),
    "Vendor: " + firstValue(body.vendor, "unknown"),
    "Screen: " + firstValue(screen.width, "?") + "x" + firstValue(screen.height, "?") + " @" + firstValue(screen.pixelRatio, "?"),
    "Viewport: " + firstValue(viewport.width, "?") + "x" + firstValue(viewport.height, "?"),
    "CPU cores: " + firstValue(body.hardwareConcurrency, "unknown"),
    "Memory GB: " + firstValue(body.deviceMemory, "unknown"),
    "Touch points: " + firstValue(body.maxTouchPoints, "unknown"),
    "Cookies: " + firstValue(body.cookieEnabled, "unknown"),
    "DNT: " + firstValue(body.doNotTrack, "unknown"),
    "Connection: " + firstValue(connection.effectiveType, "unknown") + " / downlink " + firstValue(connection.downlink, "?") + " / rtt " + firstValue(connection.rtt, "?") + " / saveData " + firstValue(connection.saveData, "?")
  ].join("\n");
}

function firstValue() {
  for (var i = 0; i < arguments.length; i += 1) {
    var value = arguments[i];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function validateBody(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body must be an object" };
  }
  if (!body.sessionId || typeof body.sessionId !== "string") {
    return { ok: false, error: "sessionId is required" };
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, error: "messages are required" };
  }
  if (body.pageUrl && typeof body.pageUrl !== "string") {
    return { ok: false, error: "pageUrl must be a string" };
  }
  return { ok: true };
}

function normalizeMessages(messages) {
  return messages.slice(-MAX_MESSAGES).map(function (message) {
    var role = message.role === "assistant" ? "assistant" : "user";
    var content = String(message.content || "").slice(0, MAX_MESSAGE_CHARS);
    return { role: role, content: content };
  }).filter(function (message) {
    return message.content.trim().length > 0;
  });
}

async function call9Router(env, messages, lead, debug) {
  requireEnv(env, ["NINEROUTER_URL", "NINEROUTER_KEY", "NINEROUTER_MODEL"]);

  var chatUrl = buildChatCompletionsUrl(env.NINEROUTER_URL);
  var referenceText = await getPortfolioReference(env);

  var response = await fetch(chatUrl, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + env.NINEROUTER_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.NINEROUTER_MODEL,
      temperature: 0.35,
      max_tokens: 650,
      messages: [
        { role: "system", content: buildSystemPrompt(lead, referenceText) }
      ].concat(messages)
    })
  });

  if (!response.ok) {
    var errorText = await response.text().catch(function () { return ""; });
    throw new Error(debug
      ? "9Router request failed: " + response.status + " " + chatUrl + " " + errorText.slice(0, 300)
      : "9Router request failed");
  }

  var data = await response.json();
  var reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!reply) throw new Error("9Router returned no reply");
  return String(reply).trim();
}

async function getPortfolioReference(env) {
  var url = env && env.PORTFOLIO_REFERENCE_URL ? env.PORTFOLIO_REFERENCE_URL : PORTFOLIO_REFERENCE_URL;

  try {
    var response = await fetch(url, {
      cf: {
        cacheEverything: true,
        cacheTtl: Number(env && env.PORTFOLIO_REFERENCE_CACHE_TTL || 3600)
      }
    });

    if (!response.ok) return "";

    return String(await response.text()).slice(0, PORTFOLIO_REFERENCE_MAX_CHARS);
  } catch (error) {
    return "";
  }
}

function buildSystemPrompt(lead, referenceText) {
  return [
    "You are HoaTV/MAD's portfolio assistant.",
    "Answer in the visitor's language. If unclear, answer in English.",
    "Keep answers concise, technical, and useful.",
    "Use the portfolio reference below as the main source of truth.",
    "If the reference does not contain the answer, say the portfolio does not include that detail and suggest contacting Hoa directly.",
    "Do not invent private availability, exact pricing, confidential clients, or guaranteed timelines.",
    "If visitor shows hiring, collaboration, or interview intent, ask for contact if missing.",
    lead.qualified ? "The visitor provided contact and lead intent. Say clearly that you will pass this to Hoa on Telegram." : "Do not claim a Telegram handoff unless contact and lead intent are present.",
    "",
    "PORTFOLIO REFERENCE:",
    referenceText || "Reference fetch failed. Use only the short public context already stated in this system prompt and direct detailed questions to Hoa."
  ].join("\n");
}

function detectLead(messages) {
  var text = messages.map(function (message) { return message.content; }).join("\n").toLowerCase();
  var contact = extractContact(text);
  var intent = /(hire|hiring|recruit|interview|contract|freelance|collaborat|proposal|budget|timeline|project|thu[eê]|tuy[eể]n|ph[oỏ]ng v[aấ]n|h[oợ]p t[aá]c|d[uự] [aá]n|ng[aâ]n s[aá]ch)/i.test(text);

  return {
    qualified: Boolean(contact && intent),
    contact: contact,
    reason: contact && intent ? "contact + hiring intent" : ""
  };
}

function extractContact(text) {
  var email = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  if (email) return email[0];

  var telegram = text.match(/(?:t\.me\/|telegram[:\s@]+|@)[a-z0-9_]{5,}/i);
  if (telegram) return telegram[0];

  var phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  if (phone) return phone[0].trim();

  return "";
}

async function sendTelegramLead(env, lead) {
  var token = getTelegramToken(env);
  var chatId = getTelegramChatId(env);
  if (!token || !chatId) return false;

  var text = [
    "New portfolio chatbot lead",
    "Contact: " + lead.contact,
    "Reason: " + lead.reason,
    "Page: " + (lead.pageUrl || "unknown"),
    "Session: " + lead.sessionId,
    "Summary:",
    lead.summary
  ].join("\n");

  try {
    var response = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 3900),
        disable_web_page_preview: true
      })
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

function getTelegramToken(env) {
  return env && (env.TELEGRAM_TOKEN || env.TELEGRAM_BOT_TOKEN);
}

function getTelegramChatId(env) {
  return env && (env.TELEGRAM_CHAT_ID || "859267157");
}

function summarizeConversation(messages) {
  return messages.slice(-8).map(function (message) {
    return message.role + ": " + message.content.replace(/\s+/g, " ").slice(0, 280);
  }).join("\n");
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function buildChatCompletionsUrl(baseUrl) {
  var normalized = trimTrailingSlash(baseUrl);
  if (/\/v1$/i.test(normalized)) {
    return normalized + "/chat/completions";
  }
  return normalized + "/v1/chat/completions";
}

function requireEnv(env, keys) {
  keys.forEach(function (key) {
    if (!env || !env[key]) {
      throw new Error("Missing env var: " + key);
    }
  });
}
