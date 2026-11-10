// Service Worker para Sitio Web Personal PWA (index2.html)
// Alcance: Solo página principal PWA (index2.html) e imágenes (img/), sin incluir subcarpetas.

const CACHE_NAME = 'web-personal-pwa-v2';

// Recursos esenciales que se pre-cargan al instalar el Service Worker
const PRECACHE_ASSETS = [
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

// CDNs permitidos para soporte offline de la página PWA
const ALLOWED_CDNS = [
  'code.jquery.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Evento de instalación: cachear recursos esenciales
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

// Evento de activación: limpiar cachés obsoletas y tomar el control
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

// Determina si una petición debe ser gestionada por el Service Worker
function shouldHandleRequest(url) {
  // Solo peticiones HTTP o HTTPS
  if (!url.protocol.startsWith('http')) return false;

  // Si es del mismo origen
  if (url.origin === self.location.origin) {
    const scopePath = new URL(self.registration.scope).pathname;
    let relativePath = url.pathname;
    if (relativePath.startsWith(scopePath)) {
      relativePath = relativePath.slice(scopePath.length);
    }

    // Excluir cualquier subcarpeta distinta a img/ (ej. catalogos/, cibercafe/, grupal/)
    if (relativePath.includes('/') && !relativePath.startsWith('img/')) {
      return false;
    }
    return true;
  }

  // Si proviene de un CDN permitido
  if (ALLOWED_CDNS.some((cdn) => url.hostname.includes(cdn))) {
    return true;
  }

  return false;
}

// Evento Fetch: Estrategia de respuesta
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Si no pertenece a la página principal ni img/ ni CDNs permitidos, dejar pasar a la red
  if (!shouldHandleRequest(url)) {
    return;
  }

  // Para navegación HTML: Network first con fallback a caché de index2.html
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
          return caches.match('./index2.html');
        })
    );
    return;
  }

  // Para recursos estáticos (CSS, JS, imágenes, CDNs): Stale-While-Revalidate
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
