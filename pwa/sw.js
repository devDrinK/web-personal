// Service Worker para la PWA de Josue Marcelo Vasquez Zeballos
// Ubicación: pwa/sw.js (Alcance: ./ )
// Subcarpetas catalogos/, cibercafe/, grupal/ quedan expresamente EXCLUIDAS.

const CACHE_NAME = 'web-personal-pwa-v4';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  '../styles.css',
  '../js/hidratacion.js',
  '../js/modulos/menu.js',
  '../js/modulos/tema.js',
  '../js/modulos/juegos.js',
  '../js/modulos/musica.js',
  '../js/modulos/contacto.js',
  '../js/modulos/pwa-core.js',
  '../img/wall.jpg',
  '../img/thegodfather.jpeg',
  '../img/WhatsApp Image 2026-11-02 at 9.32.48 PM.jpeg',
  '../img/icons/icon-192.png',
  '../img/icons/icon-512.png',
  '../img/icons/icon-maskable-192.png',
  '../img/icons/icon-maskable-512.png',
  '../img/icons/apple-touch-icon.png',
  '../img/icons/favicon-32.png'
];

const ALLOWED_CDNS = [
  'code.jquery.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

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

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`[PWA SW] Eliminando caché previa: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

function shouldHandleRequest(url) {
  if (!url.protocol.startsWith('http')) return false;

  const path = url.pathname.toLowerCase();

  // EXCLUSIÓN ESTRICTA: catalogos, cibercafe y grupal jamás se cachean
  if (path.includes('/catalogos/') || path.includes('/cibercafe/') || path.includes('/grupal/')) {
    return false;
  }

  // Recursos de origen local
  if (url.origin === self.location.origin) {
    return true;
  }

  // CDNs autorizados
  if (ALLOWED_CDNS.some((cdn) => url.hostname.includes(cdn))) {
    return true;
  }

  return false;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (!shouldHandleRequest(url)) {
    return;
  }

  // Navegación
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
          return caches.match('./index.html') || caches.match('./');
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
