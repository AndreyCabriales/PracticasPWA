// Ejercicio 3: Lógica de Registro de Service Worker, Caché e IndexedDB

// Elementos DOM del Service Worker
const swStateBadge = document.getElementById('swStateBadge');
const swScope = document.getElementById('swScope');
const swController = document.getElementById('swController');
const btnCheckCache = document.getElementById('btnCheckCache');
const btnClearCache = document.getElementById('btnClearCache');
const cacheInspectBox = document.getElementById('cacheInspectBox');
const cacheList = document.getElementById('cacheList');

// Elementos de Red Online/Offline
const connectionBanner = document.getElementById('connectionBanner');
const connectionText = document.getElementById('connectionText');

// Elementos de Petición Dinámica
const btnFetchDynamic = document.getElementById('btnFetchDynamic');
const dynamicResult = document.getElementById('dynamicResult');
const dynamicResultText = document.getElementById('dynamicResultText');

// Elementos de IndexedDB
const notaForm = document.getElementById('notaForm');
const inputTitulo = document.getElementById('inputTitulo');
const selectCategoria = document.getElementById('selectCategoria');
const inputDesc = document.getElementById('inputDesc');
const notasList = document.getElementById('notasList');
const totalNotasCount = document.getElementById('totalNotasCount');
const btnClearAllNotes = document.getElementById('btnClearAllNotes');

// 1. REGISTRO LIMPIO DEL SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('[App] Service Worker registrado con éxito. Scope:', registration.scope);
      
      swScope.textContent = registration.scope.replace(window.location.origin, '');
      updateSWStatus(registration);

      // Monitorear cambios en el ciclo de vida
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        console.log('[App] Nuevo Service Worker instalándose...');
        swStateBadge.textContent = 'Instalando...';
        swStateBadge.className = 'badge-status waiting';

        installingWorker.addEventListener('statechange', () => {
          console.log('[App] Estado del SW cambiado a:', installingWorker.state);
          updateSWStatus(registration);
        });
      });

    } catch (error) {
      console.error('[App] Error al registrar el Service Worker:', error);
      swStateBadge.textContent = 'Error Registro';
      swStateBadge.className = 'badge-status error';
      swScope.textContent = 'N/A';
    }
  });

  // Detectar cuando el controlador cambia (activación limpia tras skipWaiting)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[App] El Service Worker activo ha cambiado y ha tomado el control.');
    swController.textContent = 'Activo y en control';
    swStateBadge.textContent = 'Activo (Limpieza OK)';
    swStateBadge.className = 'badge-status active';
  });

} else {
  swStateBadge.textContent = 'No soportado';
  swStateBadge.className = 'badge-status error';
}

function updateSWStatus(registration) {
  if (registration.active) {
    swStateBadge.textContent = 'Activo y Controlando';
    swStateBadge.className = 'badge-status active';
    swController.textContent = 'Sí (sw.js)';
  } else if (registration.installing) {
    swStateBadge.textContent = 'Instalando...';
    swStateBadge.className = 'badge-status waiting';
    swController.textContent = 'En proceso';
  } else if (registration.waiting) {
    swStateBadge.textContent = 'Esperando activación';
    swStateBadge.className = 'badge-status waiting';
    swController.textContent = 'En espera';
  }
}

// 2. MONITOREO DE CONEXIÓN ONLINE / OFFLINE
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  if (isOnline) {
    connectionBanner.className = 'connection-banner online';
    connectionText.textContent = 'Conectado a Internet (Modo Online)';
  } else {
    connectionBanner.className = 'connection-banner offline';
    connectionText.textContent = '¡Sin Conexión a Internet! (Modo Offline Activo)';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// 3. INSPECCIÓN Y GESTIÓN DE CACHÉ STORAGE
btnCheckCache.addEventListener('click', async () => {
  if (!('caches' in window)) {
    alert('Cache API no soportada en este navegador.');
    return;
  }

  cacheList.innerHTML = '';
  const cacheNames = await caches.keys();

  if (cacheNames.length === 0) {
    cacheList.innerHTML = '<li>No hay almacenes de caché registrados.</li>';
  } else {
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      
      const headerLi = document.createElement('li');
      headerLi.style.fontWeight = 'bold';
      headerLi.style.color = '#34d399';
      headerLi.textContent = `📦 Almacén: ${name} (${requests.length} archivos)`;
      cacheList.appendChild(headerLi);

      requests.forEach((req) => {
        const itemLi = document.createElement('li');
        const urlObj = new URL(req.url);
        itemLi.textContent = `  • ${urlObj.pathname}`;
        cacheList.appendChild(itemLi);
      });
    }
  }

  cacheInspectBox.classList.remove('hidden');
});

btnClearCache.addEventListener('click', async () => {
  if (confirm('¿Deseas purgar y vaciar todas las cachés estáticas y dinámicas?')) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    alert('Cachés eliminadas con éxito. Recarga la página para que el Service Worker las vuelva a inicializar.');
    cacheInspectBox.classList.add('hidden');
  }
});

// 4. DEMO DE ESTRATEGIA NETWORK FIRST (DATOS DINÁMICOS)
btnFetchDynamic.addEventListener('click', async () => {
  dynamicResult.classList.remove('hidden');
  dynamicResultText.innerHTML = '<span style="color: #fbbf24;">Consultando recurso dinámico (Network First)...</span>';

  // Usamos un endpoint relativo con parámetro dynamic=true que el Service Worker intercepta
  const targetUrl = `./manifest.json?dynamic=true&timestamp=${Date.now()}`;

  try {
    const res = await fetch(targetUrl);
    const data = await res.json();
    dynamicResultText.innerHTML = `
      <span style="color: #34d399; font-weight: bold;">✔ Respuesta Recibida con Éxito:</span><br>
      <code style="display:block; margin-top:6px;">${JSON.stringify({ estado: 'Cargado', timestamp: new Date().toLocaleTimeString(), app: data.name }, null, 2)}</code>
      <small style="color: #94a3b8; display:block; margin-top:4px;">Si desactivas internet en DevTools y vuelves a oprimir este botón, verás la respuesta servida desde la caché dinámica.</small>
    `;
  } catch (err) {
    dynamicResultText.innerHTML = `<span style="color: #f87171;">Sin conexión. Datos no disponibles en caché aún: ${err.message}</span>`;
  }
});

// 5. GESTIÓN DE PERSISTENCIA CON INDEXEDDB
async function renderNotas() {
  try {
    const notas = await getAllNotas();
    totalNotasCount.textContent = notas.length;

    if (notas.length === 0) {
      notasList.innerHTML = `
        <div class="empty-state">
          No hay notas aún en IndexedDB. Agrega una arriba para comprobar que se almacena localmente y persiste sin internet.
        </div>
      `;
      return;
    }

    notasList.innerHTML = '';
    // Mostrar notas en orden inverso (la más reciente primero)
    notas.slice().reverse().forEach((nota) => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.innerHTML = `
        <div>
          <div class="note-header">
            <span class="note-title">${escapeHTML(nota.titulo)}</span>
            <span class="note-badge">${escapeHTML(nota.categoria)}</span>
          </div>
          <p class="note-desc">${escapeHTML(nota.descripcion)}</p>
        </div>
        <div class="note-footer">
          <span>🕒 ${nota.fecha}</span>
          <button class="btn-delete-note" data-id="${nota.id}" title="Eliminar de IndexedDB">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
      notasList.appendChild(card);
    });

    // Agregar listeners a botones de eliminar
    document.querySelectorAll('.btn-delete-note').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        await deleteNota(id);
        renderNotas();
      });
    });

  } catch (err) {
    console.error('Error al renderizar notas:', err);
  }
}

// Envío del formulario
notaForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevaNota = {
    titulo: inputTitulo.value.trim(),
    categoria: selectCategoria.value,
    descripcion: inputDesc.value.trim()
  };

  if (!nuevaNota.titulo || !nuevaNota.descripcion) return;

  await addNota(nuevaNota);
  notaForm.reset();
  renderNotas();
});

// Vaciar todas las notas
btnClearAllNotes.addEventListener('click', async () => {
  if (confirm('¿Vaciar todos los registros guardados en IndexedDB?')) {
    await clearAllNotas();
    renderNotas();
  }
});

// Función de escape para evitar XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Inicialización de datos
window.addEventListener('DOMContentLoaded', async () => {
  // Inicializar base de datos
  await initDB();

  // Si no hay datos, sembramos 2 ejemplos iniciales para que el usuario pueda verlos de inmediato
  const notasExistentes = await getAllNotas();
  if (notasExistentes.length === 0) {
    await addNota({
      titulo: 'Auditoría PWA y Service Worker',
      categoria: 'PWA',
      descripcion: 'Comprobar precaching en static-v1 y persistencia offline con IndexedDB.'
    });
    await addNota({
      titulo: 'Revisión de App Shell',
      categoria: 'Trabajo',
      descripcion: 'Validar que el contenedor principal responda fluido en modo responsivo.'
    });
  }

  renderNotas();
});
