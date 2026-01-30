// Service Worker for Web Push Notifications and Progressive Caching

const CACHE_NAME = 'vigoda-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
];

const IMAGE_CACHE_NAME = 'vigoda-images-v1';

// Install event - cache static assets
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== IMAGE_CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => clients.claim())
  );
});

// Fetch event - network-first for HTML, cache-first for assets
self.addEventListener('fetch', function(event) {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle navigation requests (HTML pages) - network-first with fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache or index.html for SPA routing
          return caches.match(request)
            .then(cached => cached || caches.match('/index.html'));
        })
    );
    return;
  }

  // Handle image requests - cache-first
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => 
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => caches.match('/placeholder.svg'));
        })
      )
    );
    return;
  }

  // Default: network-first for other resources
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Push notification handler
self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  const data = event.data.json();
  
  const options = {
    body: data.body || 'Новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Открыть' },
      { action: 'close', title: 'Закрыть' },
    ],
    tag: data.tag || 'default',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Vigoda', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If there's already a window open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
