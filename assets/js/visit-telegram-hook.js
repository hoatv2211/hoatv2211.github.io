(function () {
  const TELEGRAM_TOKEN = "8034320397:AAH1FTGoE9mWfHIDWPmNkHME5SaQzMGXtQI";
  const CHAT_ID = "859267157";
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
    const url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage";
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text
      })
    });
  }

  function buildMessage(ip) {
    const url = window.location.href;
    const ua = navigator.userAgent || "unknown";
    const time = new Date().toISOString();
    return (
      "Co nguoi da dang nhap vao portfolio cua ban." +
      "\nIP: " + ip +
      "\nURL: " + url +
      "\nUA: " + ua +
      "\nTime: " + time
    );
  }

  if (!TELEGRAM_TOKEN || !CHAT_ID) return;
  if (!shouldSend()) return;

  getIpAddress()
    .then((ip) => sendTelegramMessage(buildMessage(ip)))
    .then(() => markSent())
    .catch(() => {
      // Ignore failures to avoid blocking page load
    });
})();
