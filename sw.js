// ====================================================================
// [SERVICE WORKER] CIF DIGICOOP-WA+ / CREDIT FAST (OFFLINE CACHE ENGINE)
// ====================================================================

const CACHE_NAME = 'creditfast-v2-cache';

// Core static assets and CDNs to precache for offline availability
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/constants.css',
  '/css/components.css',
  '/css/style.css',
  '/css/dark.css',
  '/js/constants.js',
  '/js/data.js',
  '/js/credit-scoring.js',
  '/js/ocr-engine.js',
  '/js/charts.js',
  '/js/interactions.js',
  '/js/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

// 1. Install Event: Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use allSettled to ensure resilient caching even if a third-party CDN is unreachable
      const cachePromises = PRECACHE_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { mode: url.startsWith('http') && !url.includes(self.location.hostname) ? 'cors' : 'same-origin' });
          if (response && (response.ok || response.type === 'opaque')) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn('[SW] Pre-caching item bypassed or failed:', url, err);
        }
      });
      await Promise.allSettled(cachePromises);
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up old cache versions & take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Suppression de l\'ancien cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Cache-First / Stale-While-Revalidate with offline fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests or chrome extension schemes
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  // A. Navigation requests (HTML / Dashboard pages): Network First, fallback to cached index.html
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cachedResponse = await caches.match(req);
          if (cachedResponse) return cachedResponse;
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // B. Static Assets (CSS, JS, Fonts, Images, Flag Icons): Cache First with background refresh
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Background fetch to update cache (Stale-While-Revalidate)
        fetch(req).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkResponse);
            });
          }
        }).catch(() => {/* Offline: ignore background refresh fail */});

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(req)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If image fails offline, can return fallback or empty
          if (req.destination === 'image') {
            return new Response('', { headers: { 'Content-Type': 'image/svg+xml' } });
          }
          return new Response('Ressource indisponible hors-ligne', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
