// Crimson Notes Viewer — service worker
// Caches the app shell so it opens instantly and works offline.
// It does NOT cache JSONBin API responses — those are always fetched live.

const CACHE_NAME = 'crimson-notes-viewer-v2';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Never cache JSONBin API calls — always go to network for live data
  if (url.includes('api.jsonbin.io')) {
    return;
  }

  // App shell: cache-first, falling back to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
