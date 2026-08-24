const CACHE_NAME = 'portfolio-shell-v8';
const LEGACY_CACHE_NAME = 'unity-webgl-cache-v2';
const SHELL_PATH = '/index.html';

function isShellNavigation(request) {
  if (request.mode !== 'navigate') return false;
  const pathname = new URL(request.url).pathname;
  return pathname === '/' || pathname === SHELL_PATH;
}

self.addEventListener('install', function(event) {
  event.waitUntil((async function() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(['/', SHELL_PATH]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', function(event) {
  event.waitUntil((async function() {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(function(key) {
          return (key.startsWith('portfolio-shell-') && key !== CACHE_NAME) || key === LEGACY_CACHE_NAME;
        })
        .map(function(key) {
          return caches.delete(key);
        })
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function(event) {
  if (isShellNavigation(event.request)) {
    event.respondWith((async function() {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(SHELL_PATH, response.clone());
        }
        return response;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(SHELL_PATH);
      }
    })());
    return;
  }

  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
