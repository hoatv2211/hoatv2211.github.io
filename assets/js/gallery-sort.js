/**
 * gallery-sort.js — Auto-sort project gallery images by orientation.
 * Groups portrait, landscape, and square images into separate CSS Grid containers
 * so they never appear on the same row.
 */
(function () {
    'use strict';

    function classifyOrientation(w, h) {
        if (h > w * 1.2) return 'portrait';
        if (Math.abs(w - h) < Math.max(w, h) * 0.2) return 'square';
        return 'landscape';
    }

    function loadImage(img) {
        return new Promise(function (resolve) {
            if (img.naturalWidth > 0) return resolve(img);
            img.addEventListener('load', function () { resolve(img); }, { once: true });
            img.addEventListener('error', function () { resolve(img); }, { once: true });
        });
    }

    function sortGallery(gallery) {
        if (gallery.dataset.gallerySorted) return;
        gallery.dataset.gallerySorted = '1';

        var items = Array.from(gallery.querySelectorAll('.project-item'));
        if (items.length === 0) return;

        var images = items.map(function (item) {
            return item.querySelector('img');
        }).filter(Boolean);

        Promise.all(images.map(loadImage)).then(function () {
            var groups = { portrait: [], landscape: [], square: [] };

            items.forEach(function (item) {
                var img = item.querySelector('img');
                if (!img || img.naturalWidth === 0) {
                    groups.landscape.push(item);
                    return;
                }
                var type = classifyOrientation(img.naturalWidth, img.naturalHeight);
                groups[type].push(item);
            });

            var parent = gallery.parentNode;
            var frag = document.createDocumentFragment();
            var order = ['portrait', 'landscape', 'square'];

            order.forEach(function (type) {
                if (groups[type].length === 0) return;
                var count = groups[type].length;
                var container = document.createElement('div');
                container.className = 'project-gallery gallery--' + type;
                container.dataset.gallerySorted = '1';
                container.dataset.count = count; /* [gallery-sort] Expose count for CSS balancing */
                groups[type].forEach(function (item) {
                    container.appendChild(item);
                });
                frag.appendChild(container);
            });

            parent.replaceChild(frag, gallery);
        });
    }

    function scanAll(root) {
        var galleries = (root || document).querySelectorAll('.project-gallery:not([data-gallery-sorted])');
        galleries.forEach(sortGallery);
    }

    // Observe dynamically loaded portfolio details
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            m.addedNodes.forEach(function (node) {
                if (node.nodeType !== 1) return;
                if (node.classList && node.classList.contains('project-gallery')) {
                    sortGallery(node);
                }
                if (node.querySelectorAll) {
                    scanAll(node);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan for any already-rendered galleries
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { scanAll(); });
    } else {
        scanAll();
    }
})();
