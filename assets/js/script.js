"use strict";

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Loading overlay and hero video behavior are handled declaratively/bootstrap-side.

  // Theme is initialized by bootstrap.js (single source of truth)

  // Add entrance animations to main sections
  animateEntrances();

  // element toggle function - more efficient implementation with animation support
  const elementToggleFunc = function (elem) {
    if (!elem) return;

    // Add transition class before toggling active state
    elem.classList.add('with-transition');
    elem.classList.toggle('active');

    // Trigger reflow to ensure transition applies
    void elem.offsetWidth;
  };

  // sidebar variables
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  // sidebar toggle functionality for mobile
  if (sidebarBtn && sidebar) {
    sidebarBtn.addEventListener("click", function () {
      elementToggleFunc(sidebar);
    });
  }

  // testimonials variables
  const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
  const modalContainer = document.querySelector("[data-modal-container]");
  const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
  const overlay = document.querySelector("[data-overlay]");

  // modal variable
  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");

  // modal toggle function
  const testimonialsModalFunc = function () {
    if (modalContainer && overlay) {
      modalContainer.classList.toggle("active");
      overlay.classList.toggle("active");
    }
  };

  // add click event to all modal items
  if (testimonialsItem && testimonialsItem.length > 0) {
    testimonialsItem.forEach(item => {
      item.addEventListener("click", function () {
        const avatar = this.querySelector("[data-testimonials-avatar]");
        const title = this.querySelector("[data-testimonials-title]");
        const text = this.querySelector("[data-testimonials-text]");

        if (modalImg && avatar) modalImg.src = avatar.src;
        if (modalImg && avatar) modalImg.alt = avatar.alt;
        if (modalTitle && title) modalTitle.innerHTML = title.innerHTML;
        if (modalText && text) modalText.innerHTML = text.innerHTML;

        testimonialsModalFunc();
      });
    });
  }

  // add click event to modal close button
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", testimonialsModalFunc);
  if (overlay) overlay.addEventListener("click", testimonialsModalFunc);

  // custom select variables
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  let selectDetailItems = document.querySelectorAll("[data-detail-category]");
  const selectValue = document.querySelector("[data-select-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");
  const removeActive = document.querySelectorAll("[data-deactive-item]");
  let projectDetail = document.querySelectorAll("[project-detail]");
  let filterItems = document.querySelectorAll("[data-filter-item]");
  const buttonBack = document.getElementById("portfolio-back-button");

  let pendingDetailCategory = null;
  let portfolioReturnScrollY = 0;
  let suppressDetailReset = false;
  let portfolioTouchStartX = 0;
  let portfolioTouchStartY = 0;
  let portfolioTouchMoved = false;
  let ignorePortfolioDetailClicksUntil = 0;

  function isInsidePortfolioList(target) {
    return Boolean(target && target.closest && target.closest('[data-render="portfolio-list"]'));
  }

  function shouldIgnorePortfolioDetailClick() {
    return Date.now() < ignorePortfolioDetailClicksUntil;
  }

  document.addEventListener("touchstart", function (event) {
    if (!isInsidePortfolioList(event.target)) return;

    const touch = event.changedTouches[0];
    portfolioTouchStartX = touch.clientX;
    portfolioTouchStartY = touch.clientY;
    portfolioTouchMoved = false;
  }, { passive: true });

  document.addEventListener("touchmove", function (event) {
    if (!portfolioTouchStartX || !isInsidePortfolioList(event.target)) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - portfolioTouchStartX;
    const deltaY = touch.clientY - portfolioTouchStartY;

    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      portfolioTouchMoved = true;
    }
  }, { passive: true });

  document.addEventListener("touchend", function () {
    if (portfolioTouchMoved) {
      ignorePortfolioDetailClicksUntil = Date.now() + 450;
    }

    portfolioTouchStartX = 0;
    portfolioTouchStartY = 0;
    portfolioTouchMoved = false;
  }, { passive: true });

  function activatePortfolioPage() {
    const navigationLinks = document.querySelectorAll("[data-nav-link]");
    const pages = document.querySelectorAll("[data-page]");

    pages.forEach(page => {
      page.classList.toggle("active", page.dataset.page === "portfolio");
    });

    navigationLinks.forEach(link => {
      const label = link.textContent.trim().toLowerCase();
      link.classList.toggle("active", label === "portfolio");
    });
  }

  function scrollToProjectDetail(project) {
    if (!project) return;

    window.requestAnimationFrame(() => {
      project.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  async function openProjectDetail(selectedType) {
    if (!selectedType || typeof window.loadProjectDetail !== "function") return null;

    activatePortfolioPage();
    pendingDetailCategory = selectedType;
    portfolioReturnScrollY = window.scrollY;

    let loadedProject;
    try {
      loadedProject = await window.loadProjectDetail(selectedType);
    } catch (error) {
      pendingDetailCategory = null;
      console.error(error);
      return null;
    }
    if (!loadedProject) return null;

    document.body.classList.add("portfolio-detail-open");

    suppressDetailReset = true;
    filterFunc("");
    suppressDetailReset = false;
    pendingDetailCategory = null;

    const showcase = document.querySelector(".portfolio-showcase");
    if (showcase && showcase.dataset.showcaseHidden !== "1") {
      showcase.dataset.showcaseHidden = "1";
      showcase.style.transition = "opacity 0.25s ease";
      showcase.style.opacity = "0";
      setTimeout(function () { showcase.style.display = "none"; }, 250);
    }

    projectDetail = document.querySelectorAll("[project-detail]");
    filterItems = document.querySelectorAll("[data-filter-item]");
    projectDetail.forEach(project => {
      const active = project.dataset.detailCategory === selectedType;
      project.classList.toggle("active", active);
      if (active) {
        project.classList.remove("flash-entrance", "fast", "no-blur");
        void project.offsetWidth;
        project.classList.add("flash-entrance", "fast", "no-blur");
        showDetailLoadingEffect(project);
        toggleBackButton(true);
        scrollToProjectDetail(project);
      }
    });

    document.dispatchEvent(new CustomEvent("portfolio:detail-opened", {
      detail: { detailKey: selectedType }
    }));

    if (typeof window.refreshProjectMediaLayout === "function") {
      window.requestAnimationFrame(() => window.refreshProjectMediaLayout());
    }
    return loadedProject;
  }

  // Expose for external callers (e.g., gaming-showcase.js)
  window.openProjectDetail = openProjectDetail;

  function showDetailLoadingEffect(project) {
    if (!project) return;

    const existing = project.querySelector(".code-loading");
    if (existing) existing.remove();

    const loading = document.createElement("div");
    loading.className = "code-loading";
    loading.innerHTML = `
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
            <span class="code-token attr"> class</span><span class="code-token.punc">=</span><span class="code-token str">"project"</span>
            <span class="code-token.punc">&gt;</span>
          </span>
        </div>
        <div class="code-loading-line">
          <span class="code-loading-line-number">2</span>
          <span class="code-loading-code code-loading-reveal">
            <span class="code-token.punc">&lt;</span><span class="code-token tag">h3</span>
            <span class="code-token attr"> class</span><span class="code-token.punc">=</span><span class="code-token str">"title"</span>
            <span class="code-token.punc">&gt;</span>
            <span class="code-token text">Loading detail</span>
            <span class="code-token.punc">&lt;/</span><span class="code-token tag">h3</span><span class="code-token.punc">&gt;</span>
          </span>
        </div>
        <div class="code-loading-line">
          <span class="code-loading-line-number">3</span>
          <span class="code-loading-code code-loading-reveal">
            <span class="code-token.punc">&lt;</span><span class="code-token tag">div</span>
            <span class="code-token attr"> class</span><span class="code-token.punc">=</span><span class="code-token str">"meta"</span>
            <span class="code-token.punc">&gt;</span>
          </span>
        </div>
        <div class="code-loading-line">
          <span class="code-loading-line-number">4</span>
          <span class="code-loading-code code-loading-reveal">
            <span class="code-token.text">// parsing HTML…</span>
          </span>
        </div>
        <div class="code-loading-line">
          <span class="code-loading-line-number">5</span>
          <span class="code-loading-code code-loading-reveal">
            <span class="code-token.punc">&lt;/</span><span class="code-token tag">div</span><span class="code-token.punc">&gt;</span>
            <span class="code-loading-caret"></span>
          </span>
        </div>
      </div>
    `;

    project.prepend(loading);
    if (typeof window.animateCodeLoading === "function") {
      window.animateCodeLoading(loading);
    }

    setTimeout(() => {
      loading.remove();
    }, 1100);
  }

  function refreshPortfolioDetails() {
    selectDetailItems = document.querySelectorAll("[data-detail-category]");
    projectDetail = document.querySelectorAll("[project-detail]");
    filterItems = document.querySelectorAll("[data-filter-item]");

    // improved detail category click handler with smoother scrolling
    if (selectDetailItems && selectDetailItems.length > 0) {
      selectDetailItems.forEach(item => {
        if (item.dataset.detailBound === "true") return;

        item.addEventListener("click", function (event) {
          const isInPortfolioList = this.closest('[data-render="portfolio-list"]');
          if (!isInPortfolioList) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          if (shouldIgnorePortfolioDetailClick()) {
            return;
          }

          const selectedType = this.dataset.detailCategory;
          openProjectDetail(selectedType);
        });

        item.dataset.detailBound = "true";
      });
    }
  }

  refreshPortfolioDetails();
  document.addEventListener("portfolio:details-loaded", refreshPortfolioDetails);
  document.addEventListener("portfolio:list-rendered", refreshPortfolioDetails);

  document.addEventListener("click", function (event) {
    const detailTarget = event.target.closest("[data-detail-category]");
    if (!detailTarget) return;

    if (detailTarget.closest('[data-render="portfolio-details"]')) return;

    event.preventDefault();

    if (shouldIgnorePortfolioDetailClick()) {
      return;
    }

    openProjectDetail(detailTarget.dataset.detailCategory);
  });

  // Back button functionality with smooth scrolling and improved visual feedback
  if (buttonBack) {
    // Ensure back button has proper styling for floating button
    buttonBack.classList.add('button-floating');

    // Hide back button initially when page loads
    toggleBackButton(false);

    buttonBack.addEventListener("click", function () {
      document.body.classList.remove("portfolio-detail-open");
      // Add click animation
      this.classList.add('button-clicked');
      setTimeout(() => this.classList.remove('button-clicked'), 300);

      // Smooth scroll with callback
      window.scrollTo({
        top: portfolioReturnScrollY,
        behavior: 'smooth'
      });

      // After scrolling complete, apply filter and hide back button
      setTimeout(() => {
        filterFunc("all");
        toggleBackButton(false);

        // Restore showcase section if it was hidden
        const showcase = document.querySelector(".portfolio-showcase");
        if (showcase && showcase.dataset.showcaseHidden === "1") {
          delete showcase.dataset.showcaseHidden;
          showcase.style.display = "";
          showcase.style.maxHeight = "";
          showcase.style.overflow = "";
          showcase.style.opacity = "0";
          requestAnimationFrame(function () {
            showcase.style.transition = "opacity 0.35s ease";
            showcase.style.opacity = "1";
          });
        }
      }, 500); // Allow time for scroll to complete
    });
  }

  let clickEventAdded = false;

  if (select) {
    select.addEventListener("click", function () {
      elementToggleFunc(this);
      clickEventAdded = true;
    });
  }

  // add event in all select items
  if (selectItems && selectItems.length > 0) {
    selectItems.forEach((item, i) => {
      item.addEventListener("click", function () {
        if (!clickEventAdded) {
          elementToggleFunc(select);
        }

        let selectedValue = this.innerText.toLowerCase();
        if (selectValue) selectValue.innerText = this.innerText;
        if (select) elementToggleFunc(select);

        filterFunc(selectedValue);
        clickEventAdded = false;
      });
    });
  }

  // filter variables
  // filterItems is initialized near the top and refreshed on-demand

  // Function to toggle back button visibility
  function toggleBackButton(visible) {
    if (buttonBack) {
      if (visible) {
        buttonBack.classList.remove("hidden");
        buttonBack.style.visibility = "visible";
        buttonBack.style.opacity = "1";
      } else {
        buttonBack.classList.add("hidden");
        buttonBack.style.opacity = "0";
        setTimeout(() => {
          buttonBack.style.visibility = "hidden";
        }, 300); // Allow time for fade out
      }
    }
  }

  const filterFunc = function (selectedValue, animate = false) {
    // Show the back button if not viewing "all" items (means we're viewing a project)
    toggleBackButton(selectedValue !== "all");

    if (filterItems && filterItems.length > 0) {
      // Create array of visible and hidden items for animation
      const toShow = [];
      const toHide = [];

      // If we're showing "all" items, we should hide the back button
      if (selectedValue === "all") {
        toggleBackButton(false);
      }

      filterItems.forEach(item => {
        const isDetail = item.hasAttribute("project-detail");

        if (selectedValue === "all") {
          if (isDetail) {
            toHide.push(item);
          } else {
            toShow.push(item);
          }
          return;
        }

        if (isDetail) {
          toHide.push(item);
          return;
        }

        if (selectedValue === item.dataset.category) {
          toShow.push(item);
        } else {
          toHide.push(item);
        }
      });

      // Apply transitions if animation requested
      if (animate) {
        // First hide items with transition
        toHide.forEach(item => {
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';
          setTimeout(() => {
            item.classList.remove("active");
          }, 300);
        });

        // Then show items with staggered delay
        toShow.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("active");
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50 * index);
        });
      } else {
        // Simple toggle without animation
        toShow.forEach(item => item.classList.add("active"));
        toHide.forEach(item => item.classList.remove("active"));
      }
    }

    if (!suppressDetailReset && removeActive && removeActive.length > 0) {
      removeActive.forEach(item => {
        item.classList.remove("active");
      });
    }
  };

  // add event in all filter button items for large screen
  let lastClickedBtn = filterBtn && filterBtn.length > 0 ? filterBtn[0] : null;

  if (filterBtn && filterBtn.length > 0) {
    filterBtn.forEach(btn => {
      btn.addEventListener("click", function () {
        // Add tactile feedback with subtle scale animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => { this.style.transform = 'scale(1)'; }, 150);

        let selectedValue = this.innerText.toLowerCase();
        if (selectValue) selectValue.innerText = this.innerText;

        // Apply filter with staggered animation
        filterFunc(selectedValue, true);

        if (lastClickedBtn) lastClickedBtn.classList.remove("active");
        this.classList.add("active");
        lastClickedBtn = this;
      });
    });
  }

  // contact form variables
  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll("[data-form-input]");
  const formBtn = document.querySelector("[data-form-btn]");

  // add event to all form input field
  if (formInputs && formInputs.length > 0 && form) {
    formInputs.forEach(input => {
      input.addEventListener("input", function () {
        // check form validation
        if (form.checkValidity()) {
          if (formBtn) formBtn.removeAttribute("disabled");
        } else {
          if (formBtn) formBtn.setAttribute("disabled", "");
        }
      });
    });
  }

  // page navigation variables
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  // add event to all nav link with smooth transitions
  if (navigationLinks && navigationLinks.length > 0 && pages) {
    navigationLinks.forEach((link, i) => {
      link.addEventListener("click", function () {
        document.body.classList.remove("portfolio-detail-open");
        filterFunc("all");
        if (selectValue) selectValue.innerText = "All";

        const targetPage = this.innerHTML.toLowerCase();

        navigationLinks.forEach(navLink => {
          navLink.classList.toggle("active", navLink.textContent.trim().toLowerCase() === targetPage);
        });

        pages.forEach(page => {
          if (targetPage === page.dataset.page) {
            page.classList.add("active");
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });

            // Restore showcase when navigating back to Portfolio tab
            if (targetPage === "portfolio") {
              const showcase = document.querySelector(".portfolio-showcase");
              if (showcase && showcase.dataset.showcaseHidden === "1") {
                delete showcase.dataset.showcaseHidden;
                showcase.style.display = "";
                showcase.style.maxHeight = "";
                showcase.style.overflow = "";
                showcase.style.opacity = "0";
                requestAnimationFrame(function () {
                  showcase.style.transition = "opacity 0.35s ease";
                  showcase.style.opacity = "1";
                });
              }
            }
          } else {
            page.classList.remove("active");
          }
        });
      });
    });

    const initialPage = window.location.hash.replace("#", "").toLowerCase();
    if (initialPage) {
      const initialLink = Array.from(navigationLinks).find(link => link.textContent.trim().toLowerCase() === initialPage);
      if (initialLink) initialLink.click();
    }
  }

  // Improved image expansion function with better overlay and performance optimization

  // Helper function to animate entrances of main elements
  function animateEntrances() {
    const animateElements = [
      { selector: '.sidebar-info', delay: 100 },
      { selector: '.article-title', delay: 200 },
      { selector: '.service-list', delay: 400 },
      { selector: '.filter-list', delay: 300 },
      { selector: '.contact-list', delay: 500 }
    ];

    animateElements.forEach(({ selector, delay }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

          // Trigger reflow
          void el.offsetWidth;

          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
      });
    });
  }

  // Skills button handler
  const skillsButton = document.getElementById("skills-button");
  if (skillsButton && pages) {
    skillsButton.addEventListener("click", function () {
      const skillsSection = document.getElementById("skills");

      pages.forEach((page, i) => {
        if (page.dataset.page === "resume") {
          page.classList.add("active");
          if (navigationLinks && navigationLinks[i]) navigationLinks[i].classList.add("active");

          if (skillsSection) {
            setTimeout(() => {
              skillsSection.scrollIntoView({
                behavior: 'smooth'
              });
            }, 100);
          }
        } else {
          page.classList.remove("active");
          if (navigationLinks && navigationLinks[i]) navigationLinks[i].classList.remove("active");
        }
      });
    });
  }

  // Old version button handler
  const backToOldVersion = document.getElementById("old-version-button");
  if (backToOldVersion) {
    backToOldVersion.addEventListener("click", function () {
      window.location.href = "../v1.0";
    });
  }

  const backupStyleToggle = document.getElementById("backup-style-toggle");
  const backupStyleOverlay = document.getElementById("backup-style-overlay");
  const backupStyleClose = document.getElementById("backup-style-close");
  const backupStyleEnabled = new URLSearchParams(window.location.search).get("backups") === "1";

  if (backupStyleToggle) {
    backupStyleToggle.hidden = !backupStyleEnabled;
  }

  function setBackupStyleSelector(open) {
    if (!backupStyleOverlay || !backupStyleToggle) return;

    backupStyleOverlay.classList.toggle("active", open);
    backupStyleOverlay.setAttribute("aria-hidden", open ? "false" : "true");
    backupStyleToggle.classList.toggle("is-open", open);
    document.body.classList.toggle("backup-style-open", open);
  }

  if (backupStyleEnabled && backupStyleToggle && backupStyleOverlay) {
    backupStyleToggle.addEventListener("click", function () {
      setBackupStyleSelector(!backupStyleOverlay.classList.contains("active"));
    });

    if (backupStyleClose) {
      backupStyleClose.addEventListener("click", function () {
        setBackupStyleSelector(false);
      });
    }

    backupStyleOverlay.addEventListener("click", function (event) {
      if (event.target === backupStyleOverlay) {
        setBackupStyleSelector(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setBackupStyleSelector(false);
      }
    });
  }
});
