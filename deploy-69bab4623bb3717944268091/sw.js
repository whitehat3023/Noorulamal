// Cache version — timestamp based, har deploy pe automatically change hoga
const CACHE_VERSION = 'noorulamal-v' + '20260318015';
const CACHE_NAME = CACHE_VERSION;

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  // Naya SW turant activate ho — purane ka wait nahi
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Purana cache delete:', k);
        return caches.delete(k);
      }))
    )
  );
  // Sabhi open tabs pe naya SW le lo
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // HTML files ke liye — hamesha network se lo (taaki update mile)
  if (event.request.mode === 'navigate' || 
      event.request.url.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone)).catch(()=>{});
          return response;
        })
        .catch(() => {
          return caches.match(event.request) || caches.match('/index.html');
        })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
