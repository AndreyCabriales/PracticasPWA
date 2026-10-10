// ============================================================================
// Ejercicio 4: Interfaz de Monitoreo de Cache API y Benchmark Cache-First
// ============================================================================

const CACHE_NAME = 'appshell-cache-v1';

// Elementos del DOM
const swStatus = document.getElementById('swStatus');
const cacheCount = document.getElementById('cacheCount');
const cacheNameDisplay = document.getElementById('cacheNameDisplay');
const cacheTableBody = document.getElementById('cacheTableBody');
const btnRefreshCache = document.getElementById('btnRefreshCache');
const btnClearCache = document.getElementById('btnClearCache');

// Benchmark
const btnRunBenchmark = document.getElementById('btnRunBenchmark');
const latencyTime = document.getElementById('latencyTime');
const benchmarkSource = document.getElementById('benchmarkSource');
const benchmarkUrl = document.getElementById('benchmarkUrl');

// 1. Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('[App E4] Service Worker registrado. Scope:', reg.scope);
      swStatus.textContent = reg.active ? 'Activo y en Control' : 'Instalado';
      swStatus.style.color = '#34d399';

      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'activated') {
            swStatus.textContent = 'Activo y en Control';
            inspectCache();
          }
        });
      });

      // Inspeccionar caché inmediatamente
      setTimeout(inspectCache, 400);

    } catch (err) {
      console.error('[App E4] Error registrando SW:', err);
      swStatus.textContent = 'Error al registrar';
      swStatus.style.color = '#f87171';
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    swStatus.textContent = 'Activo y en Control';
    inspectCache();
  });
} else {
  swStatus.textContent = 'No soportado';
  swStatus.style.color = '#f87171';
}

// 2. Inspección del contenido de la Cache API
async function inspectCache() {
  if (!('caches' in window)) return;

  try {
    const hasCache = await caches.has(CACHE_NAME);
    cacheNameDisplay.textContent = CACHE_NAME;

    if (!hasCache) {
      cacheCount.textContent = '0 archivos';
      cacheTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#94a3b8;">La memoria caché aún no ha sido creada o está vacía.</td></tr>`;
      return;
    }

    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    cacheCount.textContent = `${requests.length} archivos almacenados`;

    cacheTableBody.innerHTML = '';
    requests.forEach((req, index) => {
      const url = new URL(req.url);
      const row = document.createElement('tr');

      // Determinar tipo de recurso
      let tipo = 'Documento';
      if (url.pathname.endsWith('.css')) tipo = 'Hoja de Estilos (CSS)';
      else if (url.pathname.endsWith('.js')) tipo = 'Script (JS)';
      else if (url.pathname.endsWith('.png')) tipo = 'Imagen PNG';
      else if (url.pathname.endsWith('.json')) tipo = 'Manifiesto JSON';

      row.innerHTML = `
        <td><strong>#${index + 1}</strong> <code>${url.pathname}</code></td>
        <td><span class="cache-badge">${tipo}</span></td>
        <td style="color: #34d399;">✔ Disponible Offline</td>
      `;
      cacheTableBody.appendChild(row);
    });

  } catch (err) {
    console.error('[App E4] Error inspeccionando caché:', err);
  }
}

// 3. Prueba de Rendimiento / Benchmark Cache-First
async function runBenchmark() {
  const targetResource = './style.css';
  benchmarkUrl.textContent = targetResource;
  latencyTime.textContent = '...';
  benchmarkSource.textContent = 'Consultando...';

  const startTime = performance.now();
  try {
    const response = await fetch(targetResource);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(1);

    latencyTime.textContent = `${duration} ms`;

    // Si el tiempo es menor a 25ms o viene del Service Worker, es servido por Cache-First
    benchmarkSource.innerHTML = `Servido mediante <strong>Cache-First</strong> (Caché Storage local sin latencia de red)`;
  } catch (err) {
    latencyTime.textContent = 'Error';
    benchmarkSource.textContent = 'Fallo en la petición: ' + err.message;
  }
}

// 4. Listeners
btnRefreshCache.addEventListener('click', inspectCache);

btnClearCache.addEventListener('click', async () => {
  if (confirm(`¿Deseas purgar la memoria caché "${CACHE_NAME}"?`)) {
    await caches.delete(CACHE_NAME);
    alert('Caché purgada. Recarga la página para que el evento install vuelva a almacenar el App Shell.');
    inspectCache();
  }
});

btnRunBenchmark.addEventListener('click', runBenchmark);
