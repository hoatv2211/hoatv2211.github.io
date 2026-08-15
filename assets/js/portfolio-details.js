(function () {
  "use strict";

  const htmlCache = new Map();
  const inFlight = new Map();
  let detailDataCache = null;
  let detailDataRequest = null;
  let currentRequest = 0;
  let currentDetailCategory = null;

  function detailsHost() {
    return document.querySelector('[data-render="portfolio-details"]');
  }

  function knownDetailKeys() {
    return new Set(
      (window.PORTFOLIO_DETAIL_INDEX || [])
        .map((project) => project.detailKey)
        .filter(Boolean)
    );
  }

  async function fetchDetail(detailCategory) {
    if (htmlCache.has(detailCategory)) {
      return { html: htmlCache.get(detailCategory), fromCache: true };
    }
    if (inFlight.has(detailCategory)) {
      return inFlight.get(detailCategory);
    }

    const request = fetch(`assets/portfolio-details/${detailCategory}.html`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${detailCategory} (${response.status})`);
        }
        return response.text();
      })
      .then((html) => {
        htmlCache.set(detailCategory, html);
        return { html, fromCache: false };
      })
      .finally(() => inFlight.delete(detailCategory));

    inFlight.set(detailCategory, request);
    return request;
  }

  async function fetchDetailData() {
    if (detailDataCache) return { projects: detailDataCache, fromCache: true };
    if (detailDataRequest) return detailDataRequest;

    detailDataRequest = fetch("assets/data/portfolio-details.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load portfolio detail data (${response.status})`);
        }
        return response.json();
      })
      .then((payload) => {
        if (!payload || !Array.isArray(payload.projects)) {
          throw new Error("Portfolio detail data has no projects array");
        }
        detailDataCache = payload.projects;
        return { projects: detailDataCache, fromCache: false };
      })
      .finally(() => {
        detailDataRequest = null;
      });

    return detailDataRequest;
  }

  function renderError(target, detailCategory, error) {
    target.innerHTML = `
      <section class="portfolio-detail-error" role="alert">
        <h3>Project detail unavailable</h3>
        <p>${error.message}</p>
        <button type="button" data-detail-retry="${detailCategory}">Retry</button>
        <a href="#portfolio">Back to projects</a>
      </section>`;
  }

  async function loadProjectDetail(detailCategory) {
    if (!knownDetailKeys().has(detailCategory)) {
      throw new Error(`Unknown portfolio detail: ${detailCategory}`);
    }

    const target = detailsHost();
    if (!target) throw new Error("Portfolio detail host was not found");

    if (currentDetailCategory !== detailCategory) {
      currentDetailCategory = detailCategory;
      currentRequest += 1;
    }
    const requestId = currentRequest;
    target.setAttribute?.("aria-busy", "true");
    target.classList?.add("portfolio-details-loading");

    try {
      const [fragment, detailData] = await Promise.all([
        fetchDetail(detailCategory),
        fetchDetailData(),
      ]);
      if (requestId !== currentRequest) return null;

      const project = detailData.projects.find((candidate) => candidate.detailKey === detailCategory);
      if (!project) {
        throw new Error(`Portfolio detail data has no record for ${detailCategory}`);
      }

      const html = window.PortfolioDetailRenderer?.render
        ? window.PortfolioDetailRenderer.render(project, fragment.html)
        : fragment.html;

      target.innerHTML = "";
      target.insertAdjacentHTML("beforeend", html);
      const element = target.querySelector(`[project-detail][data-detail-category="${detailCategory}"]`);
      if (!element) {
        throw new Error(`Detail fragment ${detailCategory} has no matching project root`);
      }

      document.dispatchEvent(new CustomEvent("portfolio:details-loaded", {
        detail: {
          detailCategory,
          project,
          element,
          fromCache: fragment.fromCache && detailData.fromCache,
        },
      }));
      return element;
    } catch (error) {
      if (requestId === currentRequest) renderError(target, detailCategory, error);
      throw error;
    } finally {
      if (requestId === currentRequest) {
        target.removeAttribute?.("aria-busy");
        target.classList?.remove("portfolio-details-loading");
      }
    }
  }

  document.addEventListener?.("click", (event) => {
    const retry = event.target.closest?.("[data-detail-retry]");
    if (!retry) return;
    loadProjectDetail(retry.dataset.detailRetry).catch(() => {});
  });

  window.loadProjectDetail = loadProjectDetail;
})();