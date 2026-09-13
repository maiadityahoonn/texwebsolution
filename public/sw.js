// TexWeb Solution PWA Service Worker
const CACHE_NAME = 'texweb-cache-v2';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/',
  '/favicon.ico',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
];

const CACHEABLE_PATHS = new Set(PRECACHE_ASSETS);

function isCacheableRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  return url.origin === self.location.origin && CACHEABLE_PATHS.has(url.pathname);
}

function safeClientUrl(value) {
  try {
    const url = new URL(value || '/', self.location.origin);
    return url.origin === self.location.origin ? url.href : `${self.location.origin}/`;
  } catch {
    return `${self.location.origin}/`;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (!isCacheableRequest(event.request)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, update cache clone for allowlisted static assets
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// Push Notification Listener (For future real-time task & meeting notifications)
self.addEventListener('push', (event) => {
  let data = { title: 'TexWeb Solution', body: 'New notification!', url: '/' };
  try {
    data = event.data ? { ...data, ...event.data.json() } : data;
  } catch {
    data = { title: 'TexWeb Solution', body: event.data?.text() || 'New notification!', url: '/' };
  }
  const options = {
    body: String(data.body || 'New notification!').slice(0, 240),
    icon: '/icon-192.png',
    badge: '/favicon-48x48.png',
    vibrate: [100, 50, 100],
    data: {
      url: safeClientUrl(data.url)
    }
  };
  event.waitUntil(self.registration.showNotification(String(data.title || 'TexWeb Solution').slice(0, 80), options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = safeClientUrl(event.notification.data?.url);
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background Sync (Offline form submission resilience)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-leads' || event.tag === 'background-sync') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
    );
  }
});

// Periodic Background Sync (Fresh updates for notifications & dashboard)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-updates' || event.tag === 'periodic-sync') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
    );
  }
});
