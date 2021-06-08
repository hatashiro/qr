const cacheName = 'hatashiro-qr-v1';
const resources = [
  '/qr/',
  '/qr/index.html',
  '/qr/static/main.css',
  '/qr/static/main.js',
  'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js',
];

self.addEventListener('install', (event) => void event.waitUntil(
  caches.open(cacheName).then((cache) => cache.addAll(resources))
));

self.addEventListener('fetch', (event) => void event.respondWith(
  caches.match(event.request)
        .then((response) => response || fetch(event.request))
));
