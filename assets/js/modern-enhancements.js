/**
 * Modern UI/UX enhancements for portfolio website
 * Features:
 * - Dark/Light mode toggle
 * - Smooth scrolling
 * - Lazy loading images
 * - Enhanced animations
 * - Improved accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize loading overlay
  initLoadingOverlay();

  // Theme init is handled by bootstrap.js (single source of truth)

  // Add dark mode toggle and floating buttons
  initThemeToggle();

  // Enhance images with lazy loading
  initLazyLoading();

  // Add smooth scrolling to all internal links
  initSmoothScrolling();

  // Add animation classes to elements
  initAnimations();

  // Normalize project gallery layouts (portrait/landscape + orphan centering)
  initProjectMediaLayout();

  // Enhance accessibility
  improveAccessibility();
});

function initProjectMediaLayout() {
  const updateGallery = (gallery) => {
    const items = Array.from(gallery.querySelectorAll('.project-item'));

    applyResponsiveGalleryScale(gallery, items);

    items.forEach((item) => {
      const frame = item.querySelector('.project-img');
      const image = frame ? frame.querySelector('img') : null;
      if (!frame || !image) return;

      const applyOrientation = () => {
        if (!image.naturalWidth || !image.naturalHeight) return;

        const portrait = image.naturalHeight > image.naturalWidth;
        item.classList.toggle('is-portrait', portrait);
        frame.classList.toggle('portrait', portrait);
        updateOrphanCenter(gallery);
      };

      if (image.complete) {
        applyOrientation();
      } else {
        image.addEventListener('load', applyOrientation, { once: true });
      }
    });

    updateOrphanCenter(gallery);
  };

  const updateAll = () => {
    const galleries = Array.from(document.querySelectorAll('.project-gallery, [project-detail] > .project-list'));
    galleries.forEach(updateGallery);
  };

  window.refreshProjectMediaLayout = updateAll;

  window.addEventListener('resize', () => {
    window.requestAnimationFrame(updateAll);
  });

  document.addEventListener('portfolio:details-loaded', () => {
    window.requestAnimationFrame(updateAll);
  });

  updateAll();
}

function applyResponsiveGalleryScale(gallery, items) {
  const itemCount = items.length;
  if (itemCount === 0) {
    gallery.style.setProperty('--gallery-columns', '1');
    gallery.style.removeProperty('--gallery-min-card');
    gallery.style.removeProperty('--gallery-max-card');
    return;
  }

  const galleryWidth = Math.max(gallery.clientWidth || 0, 1);
  const styles = window.getComputedStyle(gallery);
  const gap = parseFloat(styles.columnGap || styles.gap || '20') || 20;

  let minCardWidth = 220;
  let maxCardWidth = 420;

  if (window.innerWidth <= 480) {
    minCardWidth = galleryWidth;
    maxCardWidth = galleryWidth;
  } else if (window.innerWidth <= 768) {
    minCardWidth = 180;
    maxCardWidth = 320;
  }

  const minColumnsToRespectMax = Math.max(1, Math.ceil((galleryWidth + gap) / (maxCardWidth + gap)));
  const maxColumnsToRespectMin = Math.max(1, Math.floor((galleryWidth + gap) / (minCardWidth + gap)));

  const columns = Math.max(
    1,
    Math.min(itemCount, Math.min(maxColumnsToRespectMin, minColumnsToRespectMax))
  );

  gallery.style.setProperty('--gallery-columns', String(columns));
  gallery.style.setProperty('--gallery-min-card', `${minCardWidth}px`);
  gallery.style.setProperty('--gallery-max-card', `${maxCardWidth}px`);
}

function updateOrphanCenter(gallery) {
  const items = Array.from(gallery.querySelectorAll('.project-item.active, .project-item'));
  items.forEach((item) => item.classList.remove('orphan-center'));

  if (items.length <= 1) {
    if (items[0]) items[0].classList.add('orphan-center');
    return;
  }

  const styles = window.getComputedStyle(gallery);
  const columns = styles.gridTemplateColumns === 'none'
    ? 1
    : styles.gridTemplateColumns.split(' ').length;

  if (columns <= 1) {
    return;
  }

  const lastItem = items[items.length - 1];
  const remainder = items.length % columns;

  if (remainder === 1 && lastItem && lastItem.classList.contains('is-portrait')) {
    lastItem.classList.add('orphan-center');
  }
}

/**
 * Initialize loading overlay
 */
const LOADING_OVERLAY_DELAY_MS = 500;

function initLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  let hidden = false;
  const hideOverlay = () => {
    if (hidden) return;
    hidden = true;
    overlay.classList.add('hidden');
    window.setTimeout(() => overlay.remove(), 500);
  };

  window.setTimeout(hideOverlay, LOADING_OVERLAY_DELAY_MS);
  window.addEventListener('load', hideOverlay, { once: true });
}

/**
 * Initialize theme toggle (dark/light mode)
 */
function initThemeToggle() {
  // Get the existing theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  const backupStyleToggle = document.getElementById('backup-style-toggle');
  const backupStyleEnabled = new URLSearchParams(window.location.search).get('backups') === '1';

  if (themeToggle) {
    // Toggle click is handled by bootstrap.js via window.toggleTheme
    // This function only manages drag behavior and ensures interactivity
    makeFloatingButtonDraggable(themeToggle, 'themeTogglePosition');
  } else {
    // Fallback in case the button doesn't exist in HTML
    console.warn('Theme toggle button not found in HTML');
  }

  if (backupStyleToggle) {
    backupStyleToggle.hidden = !backupStyleEnabled;
  }

  if (backupStyleEnabled && backupStyleToggle) {
    localStorage.removeItem('backupStyleTogglePosition');
    localStorage.removeItem('backupStyleTogglePositionV2');
    localStorage.removeItem('backupStyleTogglePositionV3');
    makeFloatingButtonDraggable(backupStyleToggle, 'backupStyleTogglePositionV4');
  }

  // Create back button for portfolio if on a detail page
  if (window.location.pathname.includes('portfolio/') && !document.querySelector('#portfolio-back-button')) {
    const backButton = document.createElement('button');
    backButton.className = 'button-floating';
    backButton.id = 'portfolio-back-button';
    backButton.setAttribute('aria-label', 'Back to portfolio');
    backButton.setAttribute('title', 'Back to portfolio');
    backButton.innerHTML = '<ion-icon name="arrow-back-outline"></ion-icon>';
    document.body.appendChild(backButton);

    // Add event listener for back button
    backButton.addEventListener('click', () => {
      window.history.back();
    });
  }
}

function makeFloatingButtonDraggable(button, storageKey) {
  if (!button) return;

  const savedPosRaw = localStorage.getItem(storageKey);
  let restoredPosition = false;
  if (savedPosRaw) {
    try {
      const savedPos = JSON.parse(savedPosRaw);
      if (typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
        if (storageKey.includes('backupStyleToggle') && savedPos.x < window.innerWidth / 2) {
          localStorage.removeItem(storageKey);
        } else {
          const x = Math.max(0, Math.min(window.innerWidth - button.offsetWidth, savedPos.x));
          const y = Math.max(0, Math.min(window.innerHeight - button.offsetHeight, savedPos.y));
          button.style.left = `${x}px`;
          button.style.top = `${y}px`;
          button.style.right = 'auto';
          button.style.bottom = 'auto';
          button.classList.add('has-custom-position');
          restoredPosition = true;
        }
      }
    } catch (error) {
      console.warn(`Failed to restore ${storageKey}`, error);
    }
  }

  if (storageKey.includes('backupStyleToggle') && !restoredPosition) {
    button.style.left = 'auto';
    button.style.right = '15px';
    button.style.top = window.innerWidth <= 768 ? '148px' : '98px';
    button.style.bottom = 'auto';
    button.classList.remove('has-custom-position');
  }

  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let startX = 0;
  let startY = 0;
  let suppressClick = false;

  const clampToViewport = (clientX, clientY) => {
    const x = Math.max(0, Math.min(window.innerWidth - button.offsetWidth, clientX - dragOffsetX));
    const y = Math.max(0, Math.min(window.innerHeight - button.offsetHeight, clientY - dragOffsetY));
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.style.right = 'auto';
    button.style.bottom = 'auto';
    button.classList.add('has-custom-position');
  };

  const savePosition = () => {
    const left = parseFloat(button.style.left || '0');
    const top = parseFloat(button.style.top || '0');
    localStorage.setItem(storageKey, JSON.stringify({ x: left, y: top }));
  };

  const keepInsideViewport = () => {
    if (!button.style.left || !button.style.top) return;
    const x = Math.max(0, Math.min(window.innerWidth - button.offsetWidth, parseFloat(button.style.left)));
    const y = Math.max(0, Math.min(window.innerHeight - button.offsetHeight, parseFloat(button.style.top)));
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    savePosition();
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;

    const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
    if (distance > 4) {
      suppressClick = true;
    }

    clampToViewport(event.clientX, event.clientY);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;
    button.classList.remove('is-dragging');
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

    if (suppressClick) {
      savePosition();
    }
  };

  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;

    isDragging = true;
    suppressClick = false;
    startX = event.clientX;
    startY = event.clientY;

    const rect = button.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    button.classList.add('is-dragging');
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  });

  button.addEventListener('click', (event) => {
    if (!suppressClick) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  }, true);

  window.addEventListener('resize', keepInsideViewport);
}

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
  // Add lazy-load class to all images
  const images = document.querySelectorAll('img:not([loading="lazy"])');
  images.forEach(img => {
    // Save original src
    if (!img.dataset.src && img.src) {
      img.dataset.src = img.src;
      img.classList.add('lazy-load');

      // Only set loading="lazy" for images not immediately visible
      const rect = img.getBoundingClientRect();
      const isVisible = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );

      if (!isVisible) {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        img.setAttribute('loading', 'lazy');
      } else {
        img.classList.add('loaded');
      }
    }
  });

  // Set up intersection observer for lazy loading
  const lazyImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  });

  // Observe all lazy-load images
  document.querySelectorAll('img.lazy-load').forEach(img => {
    lazyImageObserver.observe(img);
  });
}

/**
 * Initialize smooth scrolling for all internal links
 */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      // Get the target element
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Scroll smoothly to the target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL without page reload (for browser history)
        history.pushState(null, null, targetId);
      }
    });
  });
}

/**
 * Initialize animations for UI elements
 */
function initAnimations() {
  const applyFlashEntrance = (selector, baseDelay = 0.1, step = 0.06, maxDelay = 0.9, extraClass = "") => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
      if (el.classList.contains('flash-entrance')) return;
      el.classList.add('flash-entrance');
      if (extraClass) {
        extraClass.split(" ").filter(Boolean).forEach(cls => el.classList.add(cls));
      }
      const delay = Math.min(baseDelay + index * step, maxDelay);
      el.style.animationDelay = `${delay}s`;
    });
  };

  // Core layout
  applyFlashEntrance('.sidebar .avatar-box, .sidebar .info-content, .sidebar .info_more-btn', 0.08, 0.08, 0.5);
  applyFlashEntrance('.navbar .navbar-item', 0.12, 0.05, 0.6);
  applyFlashEntrance('.article-title', 0.15, 0.05, 0.6);

  // Content blocks
  applyFlashEntrance('.about-text p', 0.2, 0.04, 0.8);
  applyFlashEntrance('.service-item', 0.2, 0.06, 0.9);
  applyFlashEntrance('.timeline-item', 0.2, 0.06, 0.9);
  applyFlashEntrance('.skills-categories > *', 0.2, 0.05, 0.9);
  applyFlashEntrance('.contact-form .form-input, .contact-form .form-btn', 0.2, 0.05, 0.9);

  // Portfolio list items (rendered dynamically)
  const animatePortfolioItems = () => applyFlashEntrance('.project-item', 0.12, 0.05, 0.9, 'fast no-blur');
  document.addEventListener('portfolio:list-rendered', animatePortfolioItems, { once: true });
  animatePortfolioItems();
}

/**
 * Improve accessibility throughout the site
 */
function improveAccessibility() {
  // Add missing alt text to images
  document.querySelectorAll('img:not([alt])').forEach(img => {
    const parentText = img.parentElement.textContent.trim();
    if (parentText) {
      img.alt = parentText;
    } else {
      img.alt = 'Portfolio image';
    }
  });

  // Ensure all interactive elements are focusable
  document.querySelectorAll('a, button').forEach(el => {
    if (!el.getAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
  });

  // Add ARIA labels to icons for screen readers
  document.querySelectorAll('ion-icon:not([aria-label])').forEach(icon => {
    const name = icon.getAttribute('name');
    if (name) {
      const label = name.replace(/-/g, ' ').replace(/outline$/, '');
      icon.setAttribute('aria-label', label);
    }
  });
}
