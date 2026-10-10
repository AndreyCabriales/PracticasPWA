// ============================================================================
// Ejercicio 4: Cache API y Estrategia de Caché Estática (Cache-First)
// ============================================================================

// 1. Nombre y versionado de la memoria caché
const STATIC_CACHE_NAME = 'appshell-cache-v1';

// 2. Lista de recursos estáticos del App Shell (HTML, CSS, JS e imágenes base)
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// ============================================================================
// EVENTO INSTALL: Creación de memoria caché con la Cache API y precaching
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[SW E4] Evento install: Abriendo memoria caché mediante Cache API...');

  // event.waitUntil asegura que el SW no se instale hasta que el precache finalice
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW E4] Almacenando recursos estáticos del App Shell en:', STATIC_CACHE_NAME);
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW E4] Precaching completado con éxito.');
        // Forzar activación inmediata saltando el estado de espera
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW E4] Error al precachear recursos en install:', err);
      })
  );
});

// ============================================================================
// EVENTO ACTIVATE: Limpieza de versiones obsoletas de caché
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW E4] Evento activate: Verificando y purgando cachés antiguas...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME) {
              console.log('[SW E4] Eliminando caché obsoleta:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW E4] Activación limpia. Tomando control de clientes.');
        return self.clients.claim();
      })
  );
});

// ============================================================================
// EVENTO FETCH: Intercepción y Estrategia Cache-First (Caché Primero)
// ============================================================================
// La estrategia Cache-First consulta primero la memoria caché local.
// Si el recurso existe, lo sirve de inmediato sin tocar la red (0 ms latencia).
// Si no existe, realiza la petición a la red y almacena una copia en caché.
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean HTTP/HTTPS (extensiones del navegador, etc.)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // PASO 1: ¿Existe en la memoria caché?
        if (cachedResponse) {
          console.log('[SW E4 | Cache-First] Servido DESDE CACHÉ:', event.request.url);
          return cachedResponse;
        }

        // PASO 2: No está en caché -> Consultar a la Red (Fallback a Red)
        console.log('[SW E4 | Cache-First] No encontrado en caché. Solicitando a RED:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Verificar respuesta válida antes de guardar
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clonar respuesta (el stream solo se puede leer una vez)
            const responseToCache = networkResponse.clone();

            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              console.log('[SW E4 | Cache-First] Guardado nuevo recurso en caché:', event.request.url);
            });

            return networkResponse;
          })
          .catch((fetchError) => {
            console.error('[SW E4 | Cache-First] Fallo de red para:', event.request.url, fetchError);
            throw fetchError;
          });
      })
  );
});
