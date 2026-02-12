(function () {
  const DETAILS_PATH = "assets/partials/portfolio-details.html";

  function injectDetails(html) {
    const target = document.querySelector('[data-render="portfolio-details"]');
    if (!target) {
      return;
    }
    target.innerHTML = html;
    document.dispatchEvent(new CustomEvent("portfolio:details-loaded"));
  }

  function loadDetails() {
    return fetch(DETAILS_PATH, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load portfolio details");
        }
        return response.text();
      })
      .then(injectDetails)
      .catch((error) => {
        console.warn("Portfolio details load failed:", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDetails);
  } else {
    loadDetails();
  }
})();
