(function () {
  const PROXY_URL = "https://quiet-haze-970b.tranhoa-221194.workers.dev/";
  var COOLDOWN_MS = 60 * 1000;
  var STORAGE_KEY = "telegramVisitLastSent";

  function shouldSend() {
    try {
      var lastSent = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (Number.isFinite(lastSent) && Date.now() - lastSent < COOLDOWN_MS) {
        return false;
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  function markSent() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (e) { /* ignore */ }
  }

  /* [visit-hook] Fallback chain: try multiple geo APIs until one works */
  var GEO_APIS = [
    {
      url: "https://ipwho.is/",
      parse: function (d) {
        return {
          ip: d.ip, city: d.city, region: d.region,
          country: d.country,
          isp: (d.connection && d.connection.isp) || "unknown",
          timezone: (d.timezone && d.timezone.id) || "unknown"
        };
      }
    },
    {
      url: "http://ip-api.com/json/?fields=query,city,regionName,country,isp,timezone",
      parse: function (d) {
        return {
          ip: d.query, city: d.city, region: d.regionName,
          country: d.country,
          isp: d.isp || "unknown",
          timezone: d.timezone || "unknown"
        };
      }
    },
    {
      url: "https://api.ipify.org?format=json",
      parse: function (d) {
        return {
          ip: d.ip, city: "n/a", region: "",
          country: "n/a", isp: "n/a", timezone: "n/a"
        };
      }
    }
  ];

  function fetchWithTimeout(url, ms) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, ms);
    return fetch(url, { cache: "no-store", signal: controller.signal })
      .then(function (r) { clearTimeout(timer); return r.json(); });
  }

  function getVisitorInfo(index) {
    var i = index || 0;
    if (i >= GEO_APIS.length) {
      return Promise.resolve({ ip: "unknown", city: "unknown", region: "", country: "unknown", isp: "unknown", timezone: "unknown", _source: "none", _raw: "{}" });
    }
    var api = GEO_APIS[i];
    return fetchWithTimeout(api.url, 5000)
      .then(function (data) {
        var info = api.parse(data);
        if (!info.ip || info.ip === "unknown") throw new Error("no ip");
        /* [visit-hook] Attach debug info */
        info._source = api.url;
        info._raw = JSON.stringify(data);
        return info;
      })
      .catch(function () {
        return getVisitorInfo(i + 1); /* [visit-hook] fallback to next API */
      });
  }

  function sendTelegramMessage(text) {
    return fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text
      })
    });
  }

  /* [visit-hook] Build message with IP + location + raw JSON for debugging */
  function buildMessage(info) {
    var url = window.location.href;
    var ua = navigator.userAgent || "unknown";
    var time = new Date().toISOString();
    var location = info.city + (info.region ? ", " + info.region : "") + ", " + info.country;
    return (
      "Có người đã xem portfolio của bạn" +
      "\nIP: " + info.ip +
      "\n📍 Location: " + location +
      "\n🌐 ISP: " + info.isp +
      "\n🕐 Timezone: " + info.timezone +
      "\nURL: " + url +
      "\nUA: " + ua +
      "\nTime: " + time +
      "\n\n🔧 API: " + (info._source || "unknown") +
      "\n📦 Raw: " + (info._raw || "{}")
    );
  }

  if (!PROXY_URL || PROXY_URL.includes("YOUR_WORKER_NAME")) return;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;
  if (!shouldSend()) return;

  getVisitorInfo()
    .then(function (info) { return sendTelegramMessage(buildMessage(info)); })
    .then(function () { return markSent(); })
    .catch(function () {
      // Ignore failures to avoid blocking page load
    });
})();
