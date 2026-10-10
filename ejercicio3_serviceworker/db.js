// Módulo IndexedDB: Persistencia de datos asíncrona para funcionamiento Offline

const DB_NAME = 'PWA_Offline_DB';
const DB_VERSION = 1;
const STORE_NAME = 'notas';

let dbInstance = null;

// 1. Inicializar y abrir la base de datos IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Evento de creación o actualización de estructura
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('[IndexedDB] Creando almacén de objetos (Object Store):', STORE_NAME);

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        // Crear índices para búsquedas
        store.createIndex('titulo', 'titulo', { unique: false });
        store.createIndex('categoria', 'categoria', { unique: false });
        store.createIndex('fecha', 'fecha', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      console.log('[IndexedDB] Conexión abierta con éxito.');
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('[IndexedDB] Error al abrir la base de datos:', event.target.error);
      reject(event.target.error);
    };
  });
}

// 2. Guardar una nueva nota / registro en modo asíncrono
async function addNota(nota) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const dataToSave = {
      ...nota,
      fecha: new Date().toLocaleString()
    };

    const request = store.add(dataToSave);

    request.onsuccess = () => {
      console.log('[IndexedDB] Nota guardada correctamente con ID:', request.result);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error('[IndexedDB] Error guardando nota:', event.target.error);
      reject(event.target.error);
    };
  });
}

// 3. Obtener todas las notas persistidas
async function getAllNotas() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = (event) => {
      console.error('[IndexedDB] Error leyendo notas:', event.target.error);
      reject(event.target.error);
    };
  });
}

// 4. Eliminar una nota por su ID
async function deleteNota(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(Number(id));

    request.onsuccess = () => {
      console.log('[IndexedDB] Nota eliminada con ID:', id);
      resolve(true);
    };

    request.onerror = (event) => {
      console.error('[IndexedDB] Error eliminando nota:', event.target.error);
      reject(event.target.error);
    };
  });
}

// 5. Vaciar todas las notas
async function clearAllNotas() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
