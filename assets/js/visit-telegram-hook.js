(function () {
  var PROXY_URL = "https://quiet-haze-970b.tranhoa-221194.workers.dev/";
  var COOLDOWN_MS = 2 * 60 * 1000;
  var STORAGE_KEY = "telegramVisitLastSent";
  var VISITOR_KEY = "portfolioVisitorId";
  var SESSION_KEY = "portfolioVisitSessionId";

  function isLocalHost() {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  }

  function randomId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function getStoredId(key, prefix, storage) {
    try {
      var value = storage.getItem(key);
      if (value) return value;
      value = randomId(prefix);
      storage.setItem(key, value);
      return value;
    } catch (error) {
      return randomId(prefix);
    }
  }

  function shouldSend() {
    try {
      if (sessionStorage.getItem(SESSION_KEY + ":sent") === "1") return false;
      var lastSent = Number(localStorage.getItem(STORAGE_KEY) || 0);
      return !(Number.isFinite(lastSent) && Date.now() - lastSent < COOLDOWN_MS);
    } catch (error) {
      return true;
    }
  }

  function markSent() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      sessionStorage.setItem(SESSION_KEY + ":sent", "1");
    } catch (error) { /* ignore */ }
  }

  function getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    } catch (error) {
      return "unknown";
    }
  }

  function getConnectionInfo() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return null;
    return {
      effectiveType: connection.effectiveType || "unknown",
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: Boolean(connection.saveData)
    };
  }

  function getVisitorMeta() {
    return {
      event: "portfolio_visit",
      visitorId: getStoredId(VISITOR_KEY, "visitor", localStorage),
      sessionId: getStoredId(SESSION_KEY, "session", sessionStorage),
      pageUrl: window.location.href,
      pageTitle: document.title || "",
      referrer: document.referrer || "",
      language: navigator.language || "unknown",
      languages: Array.prototype.slice.call(navigator.languages || []),
      timezone: getTimezone(),
      userAgent: navigator.userAgent || "unknown",
      platform: navigator.platform || "unknown",
      vendor: navigator.vendor || "unknown",
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory: navigator.deviceMemory || null,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || window.doNotTrack || "unknown",
      screen: {
        width: window.screen && window.screen.width,
        height: window.screen && window.screen.height,
        colorDepth: window.screen && window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: getConnectionInfo(),
      sentAt: new Date().toISOString()
    };
  }

  function sendVisit(payload) {
    var body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
        if (navigator.sendBeacon(PROXY_URL, blob)) {
          markSent();
          return Promise.resolve();
        }
      } catch (error) { /* fallback to fetch */ }
    }

    return fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: true
    }).then(function () {
      markSent();
    });
  }

  if (!PROXY_URL || PROXY_URL.indexOf("YOUR_WORKER_NAME") !== -1) return;
  if (isLocalHost() && window.location.search.indexOf("visit_debug=1") === -1) return;
  if (!shouldSend()) return;

  window.setTimeout(function () {
    sendVisit(getVisitorMeta()).catch(function () {
      // Ignore failures to avoid blocking page load.
    });
  }, 600);
})();
