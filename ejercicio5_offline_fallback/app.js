// ============================================================================
// Ejercicio 5: Interfaz de Monitoreo de Estado Offline e Interceptor
// ============================================================================

const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');
const swStatusText = document.getElementById('swStatusText');
const btnTestNonCached = document.getElementById('btnTestNonCached');
const testResultBox = document.getElementById('testResultBox');
const testOutput = document.getElementById('testOutput');

// 1. Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('[App E5] Service Worker registrado:', reg.scope);
      swStatusText.textContent = reg.active ? 'Activo (Listo para interceptar)' : 'Instalado';
      swStatusText.style.color = '#34d399';
    } catch (err) {
      console.error('[App E5] Error al registrar SW:', err);
      swStatusText.textContent = 'Error de registro';
      swStatusText.style.color = '#f87171';
    }
  });
}

// 2. Detección en vivo de Conexión a Internet
function updateConnectionStatus() {
  if (navigator.onLine) {
    statusBar.className = 'status-bar online';
    statusText.textContent = 'Conectado a Internet (Modo Online)';
  } else {
    statusBar.className = 'status-bar offline';
    statusText.textContent = '¡Sin Conexión a Internet! (Modo Offline - Interceptor Activo)';
  }
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

// 3. Prueba de Intercepción a Recurso No Cacheado
btnTestNonCached.addEventListener('click', async () => {
  testResultBox.style.display = 'block';
  testOutput.textContent = 'Enviando petición a ruta no cacheada: /api/datos-inexistentes...';

  try {
    const res = await fetch('./api/datos-inexistentes?timestamp=' + Date.now(), {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    testOutput.innerHTML = `
      <span style="color: #34d399;">✔ Petición interceptada por el Service Worker con éxito:</span>\n
${JSON.stringify(data, null, 2)}
    `;
  } catch (err) {
    testOutput.innerHTML = `<span style="color: #f87171;">Fallo directo: ${err.message}</span>`;
  }
});
