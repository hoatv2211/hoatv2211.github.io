const cacheName = "MAD-Sandwich Please-1.0";
const contentToCache = [
    "Build/docs.loader.js",
    "Build/docs.framework.js",
    "Build/docs.data",
    "Build/docs.wasm",
    "TemplateData/style.css",
    "TemplateData/logo_mad.png",
    "TemplateData/BG.png",
    "index.js",
    "manifest.webmanifest"
];

self.addEventListener("install", function (event) {
    console.log("[Service Worker] Install");
    self.skipWaiting();
    event.waitUntil((async function () {
        const cache = await caches.open(cacheName);
        console.log("[Service Worker] Caching app shell and Unity build files");
        await cache.addAll(contentToCache);
    })());
});

self.addEventListener("activate", function (event) {
    console.log("[Service Worker] Activate");
    event.waitUntil((async function () {
        const keys = await caches.keys();
        await Promise.all(keys.map(function (key) {
            if (key !== cacheName) {
                console.log("[Service Worker] Removing old cache:", key);
                return caches.delete(key);
            }
            return Promise.resolve();
        }));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    event.respondWith((async function () {
        const cache = await caches.open(cacheName);
        const destination = event.request.destination;
        const path = requestUrl.pathname;
        const networkFirst = destination === "document" ||
            path.endsWith("/index.html") ||
            path.endsWith("/manifest.webmanifest") ||
            path.endsWith("/ServiceWorker.js");

        if (networkFirst) {
            try {
                const response = await fetch(event.request);
                cache.put(event.request, response.clone());
                return response;
            } catch (error) {
                const cached = await caches.match(event.request);
                if (cached) {
                    return cached;
                }
                throw error;
            }
        }

        const cached = await caches.match(event.request);
        if (cached) {
            return cached;
        }

        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
    })());
});
