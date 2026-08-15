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
    if (typeof window.getTurnstileToken === "function") return window.getTurnstileToken();
    return "";
  }

  function sendVisit() {
    var turnstileToken = getTurnstileToken();
    if (!turnstileToken) return Promise.resolve(false);
    return fetch(VISIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageUrl: window.location.href.slice(0, 500),
        turnstileToken: turnstileToken
      }),
      keepalive: true
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
