(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function summarizeProject(project) {
    const category = project && project.category ? project.category.toLowerCase() : "";
    const tagLabel = project && project.tag && project.tag.label ? project.tag.label : "Game";
    const title = project && project.title ? project.title : "This project";

    if (category === "hub") {
      return `${title} is a centralized game hub showcasing a curated collection of cross-platform titles - play directly in the browser, explore game details, and discover the full indie catalog.`;
    }
    if (category === "agentic" || category === "applications") {
      return `${title} is a production-grade agentic AI application built with modern cloud architecture, automated workflows, scalable API design, and seamless developer experience integrations.`;
    }
    if (category === "unreal") {
      return `${title} is an Unreal Engine production built with high-fidelity visuals, optimized runtime performance, and polished cross-platform UX from prototype to release.`;
    }
    return `${title} is a ${tagLabel} production featuring immersive gameplay mechanics, polished UI/UX, optimized performance, and full release-pipeline support for mobile and web platforms.`;
  }

  const DEMO_URL_BY_KEY = {
    "mad-game-hub": "https://hoatv2211.github.io/mad-game-hub-shared/",
    "share001-ludo": "https://hoatv2211.github.io/Share001_Ludo/",
    "share002-pixelshooter3d": "https://hoatv2211.github.io/Share002_PixelShooter3D/",
    archero: "Games/Archero/index.html",
    shibainu: "https://hoatv2211.github.io/mad-game-hub-shared/portfolio-games/FoodTruck/index.html",
    sandwich: "Games/SandwichPlease/index.html",
    homeDesign: "Games/HomeDesign/index.html",
    sudoku: "Games/Sudoku/index.html",
    surviver: "Games/SurvivorIO/index.html",
    tilecandy: "Games/TileCandy/index.html",
    tilesmatch3: "Games/Tilesmatch3/index.html"
  };

  function getDemoUrl(project) {
    if (!project) return "";
    if (project.demoUrl) return project.demoUrl;
    const id = project.id || "";
    const detail = project.detailCategory || "";
    const idLower = id.toLowerCase();
    const detailLower = detail.toLowerCase();

    return (
      DEMO_URL_BY_KEY[id] ||
      DEMO_URL_BY_KEY[detail] ||
      DEMO_URL_BY_KEY[idLower] ||
      DEMO_URL_BY_KEY[detailLower] ||
      ""
    );
  }

  function getShowcaseSource() {
    const source = Array.isArray(window.PORTFOLIO_DATA) ? window.PORTFOLIO_DATA : [];
    return source
      .filter((project) => project && project.featured === true && project.image && project.image.src && project.category !== "agentic" && project.category !== "applications")
      .sort((left, right) => (left.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (right.featuredOrder ?? Number.MAX_SAFE_INTEGER))
      .map((project) => {
        const demoUrl = getDemoUrl(project);
        const detailUrl = project.detailCategory ? `portfolio-details/${project.detailCategory}.html` : "#";
        return {
          ...project,
          demoUrl,
          detailUrl
        };
      });
  }

  function initShowcase() {
    const track = document.querySelector("[data-showcase-track]");
    const dotsWrap = document.querySelector("[data-showcase-dots]");
    const counterEl = document.querySelector("[data-showcase-counter]");
    const viewport = document.querySelector("[data-showcase-viewport]");
    const showcaseSection = document.querySelector(".portfolio-showcase");
    const prev = document.querySelector("[data-showcase-prev]");
    const next = document.querySelector("[data-showcase-next]");

    if (!track || !dotsWrap || !viewport || !showcaseSection || !prev || !next) return;

    const showcaseSource = getShowcaseSource();
    if (showcaseSource.length === 0) return;

    track.innerHTML = showcaseSource
      .map((project, index) => {
        const safeTitle = escapeHtml(project.title || "Untitled Project");
        const safeAlt = escapeHtml((project.image && project.image.alt) || project.title || "Game showcase item");
        const safeSrc = escapeHtml(project.image.src);
        const safeSummary = escapeHtml(project.description || project.desc || summarizeProject(project));
        const safeDemoUrl = escapeHtml(project.demoUrl || "");
        const safeDetailUrl = escapeHtml(project.detailUrl || "#");
        const safeTagLabel = escapeHtml((project.tag && project.tag.label) || "Project");

        const primaryCta = project.demoUrl
          ? `<a href="${safeDemoUrl}" target="_blank" rel="noopener noreferrer" class="showcase-btn showcase-btn-play">PLAY NOW</a>`
          : `<button type="button" class="showcase-btn showcase-btn-play" data-detail-category="${escapeHtml(project.detailCategory || "")}">VIEW DETAIL</button>`;

        const androidBadge = project.apiUrlAndroid
          ? `<a href="${escapeHtml(project.apiUrlAndroid)}" target="_blank" rel="noopener noreferrer" class="showcase-platform-badge">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.523 15.341l1.505-2.607a.5.5 0 0 0-.869-.5l-1.524 2.638A9.016 9.016 0 0 0 12 14a9.016 9.016 0 0 0-4.635 1.872L5.84 13.234a.5.5 0 0 0-.869.5l1.505 2.607C4.247 17.79 3 20.247 3 23h18c0-2.753-1.247-5.21-3.477-6.659zM8.5 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm7 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM7.434 9.32L5.5 6.066a.5.5 0 0 1 .866-.5L8.32 8.84A7.96 7.96 0 0 1 12 8c1.33 0 2.58.328 3.68.84l1.954-3.274a.5.5 0 0 1 .866.5L16.566 9.32A7.99 7.99 0 0 1 20 16H4a7.99 7.99 0 0 1 3.434-6.68z"/></svg>
               Android
             </a>`
          : "";

        const iosBadge = project.apiUrlIos
          ? `<a href="${escapeHtml(project.apiUrlIos)}" target="_blank" rel="noopener noreferrer" class="showcase-platform-badge">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
               iOS
             </a>`
          : "";

        const platformsHtml = (androidBadge || iosBadge)
          ? `<div class="showcase-platforms">${androidBadge}${iosBadge}</div>`
          : "";

        return `
          <li class="showcase-slide${index === 0 ? " is-active" : ""}" data-showcase-slide>
            <div class="showcase-media">
              <img src="${safeSrc}" alt="${safeAlt}" loading="lazy">
            </div>
            <div class="showcase-copy">
              <span class="showcase-tag">${safeTagLabel}</span>
              <h4 class="h4">${safeTitle}</h4>
              <p>${safeSummary}</p>
              ${platformsHtml}
              <div class="showcase-links">
                ${primaryCta}
                ${project.detailCategory && project.demoUrl
                  ? `<button type="button" class="showcase-btn showcase-btn-source" data-detail-category="${escapeHtml(project.detailCategory)}">DETAIL</button>`
                  : ""}
              </div>
            </div>
          </li>
        `;
      })
      .join("");

    dotsWrap.innerHTML = showcaseSource
      .map((_, index) => {
        const activeClass = index === 0 ? " is-active" : "";
        return `<button class="showcase-dot${activeClass}" type="button" data-showcase-dot="${index}" aria-label="Show slide ${index + 1}"></button>`;
      })
      .join("");

    const slides = Array.from(track.querySelectorAll("[data-showcase-slide]"));
    const dots = Array.from(dotsWrap.querySelectorAll("[data-showcase-dot]"));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let autoplayTimer = null;
    let isPointerInside = false;
    let isInViewport = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;

    function ensureIframeLoaded(index) {
      const slide = slides[index];
      if (!slide) return;
      const frame = slide.querySelector("iframe[data-demo-src]");
      if (!frame || frame.dataset.loaded === "true") return;
      frame.src = frame.dataset.demoSrc;
      frame.dataset.loaded = "true";
    }

    function preloadCurrentAndNext() {
      ensureIframeLoaded(current);
      ensureIframeLoaded((current + 1) % slides.length);
    }

    function canAutoplay() {
      return (
        !prefersReducedMotion &&
        slides.length > 1 &&
        isInViewport &&
        !isPointerInside &&
        document.visibilityState === "visible"
      );
    }

    function syncAutoplay() {
      if (canAutoplay()) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    }

    function render(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);
        dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
        const offset = dotIndex - current;
        dot.setAttribute("data-dot-offset", String(offset));
        const absoluteOffset = Math.abs(offset);
        let dotState = "hidden";
        if (absoluteOffset === 0) {
          dotState = "active";
        } else if (absoluteOffset === 1) {
          dotState = "near";
        } else if (absoluteOffset === 2) {
          dotState = "edge";
        }
        dot.setAttribute("data-dot-state", dotState);
      });

      if (counterEl) {
        counterEl.textContent =
          String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
      }

      preloadCurrentAndNext();
    }

    function startAutoplay() {
      if (!canAutoplay()) return;
      stopAutoplay();
      autoplayTimer = window.setInterval(() => {
        render(current + 1);
      }, 4200);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    prev.addEventListener("click", function () {
      render(current - 1);
      syncAutoplay();
    });

    next.addEventListener("click", function () {
      render(current + 1);
      syncAutoplay();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", function () {
        const targetIndex = Number(dot.getAttribute("data-showcase-dot"));
        if (Number.isNaN(targetIndex)) return;
        render(targetIndex);
        syncAutoplay();
      });
    });

    viewport.addEventListener("mouseenter", function () {
      isPointerInside = true;
      syncAutoplay();
    });

    viewport.addEventListener("mouseleave", function () {
      isPointerInside = false;
      syncAutoplay();
    });

    const observer = new IntersectionObserver(
      function (entries) {
        const entry = entries[0];
        isInViewport = Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.35);
        syncAutoplay();
      },
      { threshold: [0, 0.35, 0.6, 1] }
    );
    observer.observe(showcaseSection);

    document.addEventListener("visibilitychange", syncAutoplay);

    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        render(current - 1);
        syncAutoplay();
      }
      if (event.key === "ArrowRight") {
        render(current + 1);
        syncAutoplay();
      }
    });

    track.addEventListener("touchstart", function (event) {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchMoved = false;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener("touchmove", function (event) {
      if (!touchStartX) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        touchMoved = true;
      }
    }, { passive: true });

    track.addEventListener("touchend", function (event) {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const horizontalSwipe = Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY);

      if (touchMoved && horizontalSwipe) {
        if (deltaX < 0) {
          render(current + 1);
        } else {
          render(current - 1);
        }
      }

      touchStartX = 0;
      touchStartY = 0;
      touchMoved = false;
      syncAutoplay();
    }, { passive: true });

    render(0);
    syncAutoplay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShowcase);
  } else {
    initShowcase();
  }
})();
