(function () {
  const PROXY_URL = "https://quiet-haze-970b.tranhoa-221194.workers.dev/";
  /* [visit-hook] ip-api.com returns IP + geo location in one request (free, no key needed) */
  const IP_API_URL = "http://ip-api.com/json/?fields=query,city,regionName,country,isp,timezone";
  const COOLDOWN_MS = 5 * 60 * 1000;
  const STORAGE_KEY = "telegramVisitLastSent";

  function shouldSend() {
    try {
      const lastSent = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (Number.isFinite(lastSent) && Date.now() - lastSent < COOLDOWN_MS) {
        return false;
      }
      return true;
    } catch (error) {
      return true;
    }
  }

  function markSent() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (error) {
      // Ignore storage errors
    }
  }

  /* [visit-hook] Fetch IP + location data from ip-api.com */
  function getVisitorInfo() {
    return fetch(IP_API_URL, { cache: "no-store" })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        return {
          ip: data.query || "unknown",
          city: data.city || "unknown",
          region: data.regionName || "",
          country: data.country || "unknown",
          isp: data.isp || "unknown",
          timezone: data.timezone || "unknown"
        };
      })
      .catch(function () {
        return { ip: "unknown", city: "unknown", region: "", country: "unknown", isp: "unknown", timezone: "unknown" };
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

  /* [visit-hook] Build message with IP + location info */
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
      "\nTime: " + time
    );
  }

  if (!PROXY_URL || PROXY_URL.includes("YOUR_WORKER_NAME")) return;
  if (!shouldSend()) return;

  getVisitorInfo()
    .then(function (info) { return sendTelegramMessage(buildMessage(info)); })
    .then(function () { return markSent(); })
    .catch(function () {
      // Ignore failures to avoid blocking page load
    });
})();
