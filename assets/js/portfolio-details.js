
(function () {
  const DETAILS_DIR = "assets/portfolio-details";
  let hasLoaded = false;
  let pendingLoad = false;

  function fetchHtml(path) {
    return fetch(path, { cache: "no-cache" }).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
      }
      return response.text();
    });
  }

  function loadDetails(force = false) {
    if (hasLoaded && !force) {
      return Promise.resolve();
    }

    const projects = Array.isArray(window.PORTFOLIO_DATA) ? window.PORTFOLIO_DATA : [];
    const detailFiles = projects
      .map((project) => project.detailCategory)
      .filter(Boolean)
      .map((slug) => `${DETAILS_DIR}/${slug}.html`);

    if (detailFiles.length === 0) {
      if (!pendingLoad) {
        pendingLoad = true;
        document.addEventListener("portfolio:list-rendered", () => {
          pendingLoad = false;
          loadDetails(true);
        }, { once: true });
      }
      return Promise.resolve();
    }

    const target = document.querySelector('[data-render="portfolio-details"]');
    if (!target) {
      return Promise.resolve();
    }

    target.classList.add("portfolio-details-loading");
    target.innerHTML = "<div class=\"portfolio-details-loading-text\">Loading project details...</div>";

    return detailFiles
      .reduce((chain, path) => {
        return chain.then(() =>
          fetchHtml(path)
            .then((html) => {
              target.insertAdjacentHTML("beforeend", html);
            })
            .catch((error) => {
              console.warn("Portfolio details load failed:", error);
            })
        );
      }, Promise.resolve())
      .then(() => {
        const loadingText = target.querySelector(".portfolio-details-loading-text");
        if (loadingText) loadingText.remove();
        target.classList.remove("portfolio-details-loading");
        hasLoaded = true;
        document.dispatchEvent(new CustomEvent("portfolio:details-loaded"));
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDetails);
  } else {
    loadDetails();
  }
})();
