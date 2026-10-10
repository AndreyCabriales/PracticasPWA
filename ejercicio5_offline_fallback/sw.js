// ============================================================================
// Ejercicio 5: Interceptor de Peticiones y Manejo de Estado Offline (Fallbacks)
// ============================================================================

const CACHE_NAME = 'fallback-cache-v1';
const OFFLINE_URL = './offline.html';

// Recursos base que se precachean en la instalación, INCLUYENDO offline.html
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// ============================================================================
// EVENTO INSTALL: Precaching de recursos y de la plantilla offline.html
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[SW E5] Instalando Service Worker y guardando plantilla offline.html...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW E5] Error en precaching:', err))
  );
});

// ============================================================================
// EVENTO ACTIVATE: Limpieza de cachés antiguas y toma de control
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW E5] Activación limpia...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW E5] Purgando caché obsoleta:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================================================
// EVENTO FETCH: Interceptor con Fallback para Navegación, Imágenes y APIs
// ============================================================================
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  const acceptHeader = event.request.headers.get('accept') || '';
  const isHtmlNavigation = event.request.mode === 'navigate' || acceptHeader.includes('text/html');

  event.respondWith(
    // 1. Intentar responder primero desde la red o desde la caché
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si está en caché, devolverlo directamente
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está en caché, intentar la red
        return fetch(event.request)
          .then((networkResponse) => {
            // Guardar dinámicamente si la respuesta es válida
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          });
      })
      .catch((error) => {
        // ====================================================================
        // MANEJO DE ESTADO OFFLINE (FALLBACK INTERCEPTADO)
        // Ocurre cuando la red falla Y el recurso solicitado no existe en caché
        // ====================================================================
        console.warn('[SW E5 | Fallback] Falló la red y el recurso no está en caché:', event.request.url);

        // A. Fallback para NAVEGACIÓN o páginas HTML: Devolver plantilla offline.html personalizada
        if (isHtmlNavigation) {
          console.log('[SW E5 | Fallback] Entregando plantilla personalizada offline.html');
          return caches.match(OFFLINE_URL);
        }

        // B. Fallback para IMÁGENES: Devolver un SVG placeholder de imagen rota offline
        if (acceptHeader.includes('image/*') || event.request.destination === 'image') {
          const svgOfflineImage = `
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
              <rect width="200" height="150" fill="#1e293b"/>
              <text x="50%" y="45%" text-anchor="middle" fill="#ef4444" font-size="14" font-family="sans-serif" font-weight="bold">Imagen Offline</text>
              <text x="50%" y="65%" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="sans-serif">No disponible sin red</text>
            </svg>
          `;
          return new Response(svgOfflineImage, {
            headers: { 'Content-Type': 'image/svg+xml' }
          });
        }

        // C. Fallback para APIs o datos JSON
        return new Response(JSON.stringify({
          offline: true,
          mensaje: 'Petición interceptada por Service Worker: Sin conexión a internet y sin copia en caché.',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
  );
});
