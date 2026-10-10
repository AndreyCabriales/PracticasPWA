// Service Worker: Registro, Instalación, Activación limpia y Estrategias de Caché

const STATIC_CACHE_NAME = 'pwa-static-v1';
const DYNAMIC_CACHE_NAME = 'pwa-dynamic-v1';

// Recursos estáticos que forman el App Shell y núcleo de la aplicación
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// 1. EVENTO INSTALL: Precaching de recursos estáticos
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Evento Install: Guardando App Shell en caché estática...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching de recursos estáticos completado.');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // skipWaiting fuerza al nuevo Service Worker a activarse inmediatamente
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[Service Worker] Error durante la instalación:', err);
      })
  );
});

// 2. EVENTO ACTIVATE: Activación limpia y purga de cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Evento Activate: Limpiando cachés obsoletas...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Si la caché no es la estática actual ni la dinámica actual, la eliminamos
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log(`[Service Worker] Purgando caché obsoleta: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activación limpia completada. Tomando control de clientes...');
        // clients.claim permite controlar de inmediato las páginas abiertas sin esperar recarga
        return self.clients.claim();
      })
  );
});

// 3. EVENTO FETCH: Estrategias de Caché para estáticos y dinámicos
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Solo gestionar peticiones HTTP/HTTPS (ignorar esquemas chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // ESTRATEGIA A: Network First (Red primero, fallback a caché)
  // Utilizado para peticiones dinámicas de datos, APIs o URLs con parámetros cambiantes
  if (requestUrl.pathname.includes('/api/') || requestUrl.search.includes('dynamic=true')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // ESTRATEGIA B: Cache First (Caché primero, fallback a red con guardado dinámico)
  // Utilizado para el App Shell, archivos estáticos (HTML, CSS, JS, imágenes)
  event.respondWith(cacheFirst(event.request));
});

// Función Estrategia: Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Retornar de la caché inmediatamente
    return cachedResponse;
  }

  // Si no está en caché, buscar en la red
  try {
    const networkResponse = await fetch(request);
    
    // Si la respuesta es válida, clonar y guardar en la caché dinámica
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const responseToCache = networkResponse.clone();
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
    }
    return networkResponse;
  } catch (error) {
    console.warn('[Service Worker] Falló conexión a la red y no estaba en caché:', request.url);
    // Si es un documento HTML y no hay red, podríamos devolver index.html de la caché
    if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
      return caches.match('./index.html');
    }
    throw error;
  }
}

// Función Estrategia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Modo Offline detectado en petición dinámica. Buscando en caché...');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Si no está en caché ni en red, retornar una respuesta JSON informativa
    return new Response(JSON.stringify({
      offline: true,
      message: 'Estás sin conexión y este dato dinámico aún no ha sido cacheado.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
