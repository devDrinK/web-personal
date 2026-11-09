// Service Worker para Sitio Web Personal
// Alcance: Solo página principal e imágenes (img/), sin incluir subcarpetas.

const CACHE_NAME = 'web-personal-v1';

// Recursos esenciales que se pre-cargan al instalar el Service Worker
const PRECACHE_ASSETS = [
  './',
  './index.html',
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

// CDNs permitidos para soporte offline de la página principal
const ALLOWED_CDNS = [
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Evento de instalación: cachear recursos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos map individual para asegurar que si un recurso falla, no impida la instalación
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
    // Calculamos la ruta relativa respecto al scope (raíz o /web-personal/)
    const scopePath = new URL(self.registration.scope).pathname;
    let relativePath = url.pathname;
    if (relativePath.startsWith(scopePath)) {
      relativePath = relativePath.slice(scopePath.length);
    }

    // Si tiene subcarpeta (contiene '/') y NO empieza con 'img/' ni 'img\', excluirla
    if (relativePath.includes('/') && !relativePath.startsWith('img/')) {
      return false; // Ignorar subcarpetas como catalogos/, cibercafe/, grupal/, etc.
    }
    return true;
  }

  // Si proviene de un CDN permitido para estilos/fuentes/iconos
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

  // Para navegación HTML (cargar index.html): Network first con fallback a caché
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

