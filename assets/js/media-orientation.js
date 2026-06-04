(function () {
  if (window.__mediaOrientationInitialized) return;
  window.__mediaOrientationInitialized = true;

  function checkAspectRatio(img) {
    const container = img.closest(".project-img");
    if (!container) return;

    if (img.naturalHeight > img.naturalWidth) {
      container.classList.add("portrait");
    } else {
      container.classList.remove("portrait");
    }
  }

  function detectPortraitImages(root) {
    const scope = root || document;
    if (!scope.querySelectorAll) return;

    const galleryImages = Array.from(scope.querySelectorAll(".project-gallery .project-img img"));
    if (scope.matches && scope.matches(".project-gallery .project-img img")) {
      galleryImages.push(scope);
    }

    galleryImages.forEach((img) => {
      if (img.dataset.portraitChecked) return;
      img.dataset.portraitChecked = "true";

      if (img.complete) {
        checkAspectRatio(img);
      } else {
        img.addEventListener("load", () => checkAspectRatio(img), { once: true });
      }
    });
  }

  function init() {
    detectPortraitImages(document);

    const mainContent = document.querySelector(".main-content");
    if (!mainContent) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => detectPortraitImages(node));
      });
    });

    observer.observe(mainContent, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
