// ============================================================
// CV-Mister — Service Worker (PWA)
// Strategy:
//   - Static assets (JS/CSS/fonts/images) → Cache First
//   - API requests (/api/*)                → Network First (fallback to cache)
//   - HTML navigation                      → Network First (offline fallback)
// ============================================================

const CACHE_NAME = 'cv-mister-v1';
const API_CACHE  = 'cv-mister-api-v1';

const PRECACHE_URLS = [
  '/',
  '/offline.html',
];

// ── Install: pre-cache shell ───────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ── Activate: delete old caches ────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: routing strategy ────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and socket.io
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/socket.io') ||
    url.protocol === 'chrome-extension:'
  ) return;

  // API requests → Network First, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets (JS/CSS/images/fonts) → Cache First
  if (
    /\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|svg|ico|webp|gif)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // HTML navigation → Network First, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline.html') || caches.match('/')
      )
    );
    return;
  }

  // Default → Network First
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ── Helpers ────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
