(function () {
  "use strict";

  let activeOverlay = null;
  let activeTrigger = null;

  function closeViewer() {
    if (!activeOverlay) return;
    const overlay = activeOverlay;
    const trigger = activeTrigger;
    activeOverlay = null;
    activeTrigger = null;
    overlay.remove();
    document.body.classList.remove("detail-media-viewer-open");
    trigger.focus?.();
  }

  function openViewer(trigger) {
    const image = trigger.querySelector("img");
    if (!image) return;
    closeViewer();

    const overlay = document.createElement("div");
    overlay.className = "expanded-overlay detail-media-viewer";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", image.alt || "Expanded project image");

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "detail-media-viewer-close";
    closeButton.setAttribute("aria-label", "Close expanded image");
    closeButton.textContent = "×";

    const expandedImage = document.createElement("img");
    expandedImage.className = "expanded-media";
    expandedImage.src = image.currentSrc || image.src;
    expandedImage.alt = image.alt || "Expanded project image";

    const frame = document.createElement("div");
    frame.className = "detail-media-viewer-frame";
    frame.append(expandedImage, closeButton);

    overlay.append(frame);
    document.body.appendChild(overlay);
    document.body.classList.add("detail-media-viewer-open");
    activeOverlay = overlay;
    activeTrigger = trigger;
    closeButton.focus();
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("[data-expand-media]");
    if (trigger) {
      event.preventDefault();
      openViewer(trigger);
      return;
    }

    if (!activeOverlay) return;
    if (event.target === activeOverlay || event.target.closest?.(".detail-media-viewer-close")) {
      closeViewer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeViewer();
  });
})();
