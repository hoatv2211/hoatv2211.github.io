(function () {
  "use strict";

  var VISIT_URL = "https://quiet-haze-970b.tranhoa-221194.workers.dev/visit";
  var COOLDOWN_MS = 2 * 60 * 1000;
  var STORAGE_KEY = "telegramVisitLastSent";

  function localHost() {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  }

  function shouldSend() {
    try {
      var last = Number(localStorage.getItem(STORAGE_KEY) || 0);
      return !(Number.isFinite(last) && Date.now() - last < COOLDOWN_MS);
    } catch (_) { return true; }
  }

  function markSent() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (_) { /* ignore */ }
  }

  function getTurnstileToken() {
    if (typeof window.getTurnstileToken !== "function") {
      return Promise.reject(new Error("Turnstile challenge not configured"));
    }

    return Promise.resolve().then(function () {
      return window.getTurnstileToken();
    }).then(function (token) {
      if (typeof token !== "string" || !token.trim()) {
        throw new Error("Turnstile challenge returned no token");
      }
      return token;
    });
  }

  function sendVisit() {
    return getTurnstileToken().then(function (turnstileToken) {
      return fetch(VISIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageUrl: window.location.href.slice(0, 500),
          turnstileToken: turnstileToken
        }),
        keepalive: true
      });
    }).then(function (response) {
      if (!response.ok) throw new Error("visit request failed");
      markSent();
      return true;
    });
  }

  if (localHost() && window.location.search.indexOf("visit_debug=1") === -1) return;
  if (!shouldSend()) return;
  window.setTimeout(function () { sendVisit().catch(function () {}); }, 600);
})();
