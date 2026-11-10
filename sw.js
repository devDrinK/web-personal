// Service Worker para Sitio Web Personal y PWA
// Alcance: Página principal (index.html), Versión PWA (index2.html) e imágenes (img/)
// Subcarpetas como catalogos/, cibercafe/, grupal/ quedan totalmente excluidas.

const CACHE_NAME = 'web-personal-pwa-v3';

// Recursos esenciales pre-cacheados
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './index2.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './img/wall.jpg',
  './img/thegodfather.jpeg',
  './img/WhatsApp Image 2026-11-02 at 9.32.48 PM.jpeg',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
  './img/icons/icon-maskable-192.png',
  './img/icons/icon-maskable-512.png',
  './img/icons/apple-touch-icon.png',
  './img/icons/favicon-32.png'
];

// CDNs permitidos para soporte offline
const ALLOWED_CDNS = [
  'code.jquery.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[PWA SW] No se pudo pre-cachear: ${asset}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`[PWA SW] Eliminando caché antigua: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Filtro de peticiones
function shouldHandleRequest(url) {
  if (!url.protocol.startsWith('http')) return false;

  if (url.origin === self.location.origin) {
    const scopePath = new URL(self.registration.scope).pathname;
    let relativePath = url.pathname;
    if (relativePath.startsWith(scopePath)) {
      relativePath = relativePath.slice(scopePath.length);
    }

    // Excluir cualquier subcarpeta distinta a img/ (catalogos, cibercafe, grupal, etc.)
    if (relativePath.includes('/') && !relativePath.startsWith('img/')) {
      return false;
    }
    return true;
  }

  if (ALLOWED_CDNS.some((cdn) => url.hostname.includes(cdn))) {
    return true;
  }

  return false;
}

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (!shouldHandleRequest(url)) {
    return;
  }

  // Navegación HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          return caches.match('./index2.html') || caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // Assets estáticos (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
