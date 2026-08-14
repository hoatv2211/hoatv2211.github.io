/**
 * Safe download count client.
 * The Worker owns upstream URLs; the browser sends only canonical project/platform IDs.
 */
(function () {
  "use strict";

  var workerUrl = "https://portfolio.thanhlong-worker.workers.dev/download-count";
  var allowedPlatforms = new Set(["android", "ios"]);

  function fetchDownloadCounts() {
    document.querySelectorAll("[data-project-id][data-platform]").forEach(fetchDownloadCount);
  }

  async function fetchDownloadCount(element) {
    var projectId = element.getAttribute("data-project-id");
    var platform = element.getAttribute("data-platform");
    if (!projectId || !allowedPlatforms.has(platform)) return;

    element.textContent = "Loading...";
    element.classList.add("loading");
    try {
      var response = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projectId, platform: platform })
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      var data = await response.json();
      element.textContent = typeof data.installs === "number" ? formatDownloadCount(data.installs) + " downloads" : "N/A";
    } catch (error) {
      console.error("Download count unavailable:", error);
      element.textContent = "N/A";
    } finally {
      element.classList.remove("loading");
    }
  }

  function formatDownloadCount(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return String(count);
  }

  window.fetchDownloadCounts = fetchDownloadCounts;
  document.addEventListener("DOMContentLoaded", fetchDownloadCounts);
})();
