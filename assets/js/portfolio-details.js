// Shared code-loading animation utility
window.animateCodeLoading = function (container) {
  if (!container) return;
  const lines = Array.from(container.querySelectorAll(".code-loading-line"));
  if (lines.length === 0) return;

  lines.forEach(line => {
    line.classList.remove("is-visible", "is-current");
  });

  let index = 0;
  const step = () => {
    if (index > 0) lines[index - 1].classList.remove("is-current");
    if (index < lines.length) {
      lines[index].classList.add("is-visible", "is-current");
      index += 1;
      setTimeout(step, 120);
    }
  };

  setTimeout(step, 80);
};

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
    target.innerHTML = `
      <div class="code-loading">
        <div class="code-loading-header">
          <span class="code-loading-dot"></span>
          <span class="code-loading-dot"></span>
          <span class="code-loading-dot"></span>
        </div>
        <div class="code-loading-lines">
          <div class="code-loading-line">
            <span class="code-loading-line-number">1</span>
            <span class="code-loading-code code-loading-reveal">
              <span class="code-token.punc">&lt;</span><span class="code-token tag">section</span>
              <span class="code-token attr"> class</span><span class="code-token.punc">=</span><span class="code-token str">"portfolio"</span>
              <span class="code-token.punc">&gt;</span>
            </span>
          </div>
          <div class="code-loading-line">
            <span class="code-loading-line-number">2</span>
            <span class="code-loading-code code-loading-reveal">
              <span class="code-token.punc">&lt;</span><span class="code-token tag">div</span>
              <span class="code-token attr"> class</span><span class="code-token.punc">=</span><span class="code-token str">"details"</span>
              <span class="code-token.punc">&gt;</span>
            </span>
          </div>
          <div class="code-loading-line">
            <span class="code-loading-line-number">3</span>
            <span class="code-loading-code code-loading-reveal">
              <span class="code-token.text">Loading project details…</span>
            </span>
          </div>
          <div class="code-loading-line">
            <span class="code-loading-line-number">4</span>
            <span class="code-loading-code code-loading-reveal">
              <span class="code-token.punc">&lt;/</span><span class="code-token tag">div</span><span class="code-token.punc">&gt;</span>
              <span class="code-loading-caret"></span>
            </span>
          </div>
        </div>
      </div>
    `;

    const loadingBlock = target.querySelector(".code-loading");
    window.animateCodeLoading(loadingBlock);

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
        const loadingBlock = target.querySelector(".code-loading");
        if (loadingBlock) loadingBlock.remove();
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
