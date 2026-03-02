(function () {
  const PROXY_URL = "https://quiet-haze-970b.tranhoa-221194.workers.dev/";
  const IP_API_URL = "https://api.ipify.org?format=json";
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

  function getIpAddress() {
    return fetch(IP_API_URL, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => data && data.ip ? data.ip : "unknown")
      .catch(() => "unknown");
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

  function buildMessage(ip) {
    const url = window.location.href;
    const ua = navigator.userAgent || "unknown";
    const time = new Date().toISOString();
    return (
      "Có người đã xem portfolio của bạn" +
      "\nIP: " + ip +
      "\nURL: " + url +
      "\nUA: " + ua +
      "\nTime: " + time
    );
  }

  if (!PROXY_URL || PROXY_URL.includes("YOUR_WORKER_NAME")) return;
  if (!shouldSend()) return;

  getIpAddress()
    .then((ip) => sendTelegramMessage(buildMessage(ip)))
    .then(() => markSent())
    .catch(() => {
      // Ignore failures to avoid blocking page load
    });
})();
