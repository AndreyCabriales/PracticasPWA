# Laboratorio Integral de Progressive Web Apps (PWA)
**Ubicación:** `C:\xampp\htdocs\PrácticasPWA\`  
**URL local con Apache en XAMPP:** `http://localhost/PrácticasPWA/`

---

## 📁 Estructura Completa del Proyecto (5 Ejercicios)

```text
PrácticasPWA/
├── index.html                      # Portal central interactivo para acceder a los 5 ejercicios
├── README.md                       # Documentación técnica completa y guía de evaluación
│
├── ejercicio1_manifest/             # EJERCICIO 1: MANIFEST Y METADATOS DE INSTALACIÓN
│   ├── index.html                  # HTML base con metadatos y visor de manifest
│   ├── manifest.json               # Configuración oficial de Web App Manifest
│   ├── style.css                   # Estilos responsivos del ejercicio
│   ├── app.js                      # Lógica de evento beforeinstallprompt y lectura dinámica
│   └── icons/                      # Paquete de iconos PNG (192x192 y 512x512)
│
├── ejercicio2_appshell/             # EJERCICIO 2: APP SHELL Y SPLASH SCREEN NATIVA
│   ├── index.html                  # Estructura del App Shell (Header, Nav, Main)
│   ├── manifest.json               # Manifest con theme_color y background_color
│   ├── style.css                   # Diseño responsivo (escritorio y móvil) y Splash Screen
│   ├── app.js                      # Navegación SPA y simulador de Splash Screen
│   └── icons/                      # Iconos generados para Splash Screen
│
├── ejercicio3_serviceworker/        # EJERCICIO 3: SERVICE WORKER Y ALMACENAMIENTO
│   ├── index.html                  # Panel de control de SW, caché e IndexedDB
│   ├── manifest.json               # Manifest para instalación completa
│   ├── sw.js                       # Service Worker: install, activate, fetch (Cache First / Network First)
│   ├── db.js                       # Módulo asíncrono IndexedDB para persistencia offline
│   ├── app.js                      # Registro de SW, monitor online/offline y CRUD
│   ├── style.css                   # Estilos con indicadores de conexión en vivo
│   └── icons/                      # Iconos generados
│
├── ejercicio4_cache_first/          # EJERCICIO 4: CACHE API Y ESTRATEGIA ESTÁTICA (CACHE-FIRST)
│   ├── index.html                  # Interfaz con diagrama de flujo y medidor de latencia
│   ├── manifest.json               # Manifest del ejercicio
│   ├── sw.js                       # Creación de caché en install y estrategia Cache-First en fetch
│   ├── app.js                      # Inspección de Cache Storage y benchmark de latencia
│   ├── style.css                   # Estilos modernos con acentos ámbar
│   └── icons/                      # Iconos generados
│
└── ejercicio5_offline_fallback/     # EJERCICIO 5: INTERCEPTOR FETCH Y FALLBACK OFFLINE
    ├── index.html                  # Laboratorio de pruebas de rutas (cacheadas vs no cacheadas)
    ├── offline.html                # Plantilla HTML personalizada de "Modo Sin Conexión"
    ├── manifest.json               # Manifest del ejercicio
    ├── sw.js                       # Interceptor de fetch con fallback a offline.html, SVG y JSON
    ├── app.js                      # Monitor de conectividad y prueba de intercepción
    ├── style.css                   # Estilos con indicadores y acentos rojos
    └── icons/                      # Iconos generados
```

---

## 📘 Explicación Detallada de los Ejercicios

### 🔹 Ejercicio 1: Web App Manifest y Metadatos de Instalación
Configuración del archivo `manifest.json` y metadatos en HTML (`theme-color`, `apple-touch-icon`, etc.) con propiedades clave: `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color` y paquete de iconos PNG (192x192 y 512x512). Intercepta `beforeinstallprompt` para controlar la instalación nativa.

---

### 🔹 Ejercicio 2: Maquetado del App Shell y Splash Screen Nativa
Construcción de la interfaz base responsiva dividida en:
1. **Header:** Logotipo, título y menú hamburguesa en móvil.
2. **Menú de navegación:** Barra lateral en escritorio, Drawer y Bottom Navigation Bar en pantallas móviles.
3. **Contenedor principal (`<main>`):** Carga fluida con Skeleton Loading sin parpadeos de pantalla.
4. **Splash Screen Nativa:** Generada por el sistema operativo y Chrome mediante `background_color`, `theme_color` e icono de 512x512 px. Incluye simulador interactivo de activación.

---

### 🔹 Ejercicio 3: Lógica de Service Worker y Almacenamiento
Ciclo de vida completo del Service Worker (registro, instalación con `skipWaiting`, activación limpia con purga de versiones obsoletas y `clients.claim`). Estrategias de caché y persistencia de datos asíncrona local mediante **IndexedDB** (`PWA_Offline_DB`), permitiendo crear, consultar y eliminar registros en modo offline.

---

### 🔹 Ejercicio 4: Cache API y Estrategia de Caché Estática (Cache-First)
*Ubicación: `ejercicio4_cache_first/`*

#### Objetivo
Dominar el uso directo de la **Cache API** nativa de los navegadores y la estrategia de almacenamiento estático **Cache-First** (Caché Primero), diseñada específicamente para que el App Shell cargue con latencia cero.

#### Puntos Clave Desarrollados:
1. **Creación de Memoria Caché en el Evento `install` (`sw.js`):**
   - Utiliza `caches.open('appshell-cache-v1')` para crear o abrir el espacio de memoria reservado.
   - Utiliza `cache.addAll(STATIC_ASSETS)` para descargar y guardar en segundo plano los recursos del App Shell:
     - `index.html` (Estructura base)
     - `style.css` (Hojas de estilos)
     - `app.js` (Lógica de la aplicación)
     - `manifest.json` (Manifiesto de la PWA)
     - Iconos PNG (`icon-192x192.png` e `icon-512x512.png`)
   - Ejecuta `self.skipWaiting()` para que el Service Worker tome el control de inmediato sin esperar a que el usuario cierre todas las pestañas.
2. **Intercepción del Evento `fetch` con Cache-First:**
   - Cada solicitud interceptada pasa primero por `caches.match(event.request)`.
   - **Cache Hit:** Si el archivo se encuentra en la caché, se devuelve instantáneamente sin contactar al servidor (latencia de red: 0 ms).
   - **Cache Miss (Fallback a Red):** Si el recurso no estaba previamente en caché, realiza `fetch(event.request)`, devuelve la respuesta al usuario y simultáneamente clona y guarda una copia en la caché para futuras consultas.
3. **Inspector y Medidor de Latencia en Vivo (`app.js`):**
   - Tabla interactiva que lee en tiempo real el contenido de `appshell-cache-v1` usando la Cache API.
   - Herramienta de benchmark que mide el tiempo de respuesta en milisegundos (`performance.now()`), demostrando la velocidad instantánea de Cache-First.

#### Verificación en Chrome DevTools:
1. <kbd>F12</kbd> &gt; Pestaña **Application** &gt; **Cache Storage** &gt; **appshell-cache-v1**.
2. Observa la lista completa de recursos precacheados durante la instalación.
3. Pestaña **Network**: Recarga la página y comprueba en la columna **Size** que los recursos indican `(ServiceWorker)` con tiempos inferiores a 5 ms.

---

### 🔹 Ejercicio 5: Interceptor de Peticiones y Manejo de Estado Offline (Fallbacks)
*Ubicación: `ejercicio5_offline_fallback/`*

#### Objetivo
Prevenir que el usuario visualice la pantalla de error genérica del navegador (el dinosaurio sin internet) cuando pierde la conectividad y solicita un recurso o ruta que **no estaba guardado en caché**, respondiendo de forma controlada mediante una **plantilla personalizada de Modo Sin Conexión** (`offline.html`).

#### Puntos Clave Desarrollados:
1. **Precaching de la Plantilla de Contingencia (`sw.js`):**
   - Durante el evento `install`, el Service Worker precachea no solo el App Shell, sino también de forma prioritaria el archivo **`offline.html`**.
2. **Interceptor de Fallas de Red en `fetch`:**
   - El Service Worker intercepta la solicitud e intenta resolverla (mediante caché o red).
   - Si la red falla (error de conexión) y el recurso no se encuentra en caché:
     - **Para Navegación / Páginas HTML (`event.request.mode === 'navigate'`):** Devuelve inmediatamente `caches.match('./offline.html')`. El usuario ve una interfaz elegante con mensaje de aviso, diagnóstico técnico del Service Worker y botón de "Reintentar Conexión".
     - **Para Imágenes (`destination === 'image'`):** Devuelve un gráfico SVG de contingencia generado en memoria indicando que la imagen no está disponible sin conexión.
     - **Para APIs o datos JSON:** Devuelve una respuesta JSON estructurada `{ offline: true, mensaje: "Sin conexión a internet" }`.
3. **Plantilla Personalizada `offline.html`:**
   - Diseño adaptable con indicador visual de corte de red, diagnóstico didáctico y detector de conectividad en tiempo real (`window.addEventListener('online')`) que avisa al usuario en cuanto vuelve el internet y permite reintentar la navegación.

#### Verificación en Chrome DevTools:
1. En la página del Ejercicio 5, abre <kbd>F12</kbd> &gt; Pestaña **Network**.
2. Cambia el desplegable de red a **Offline**.
3. La barra superior cambiará a color rojo: *"¡Sin Conexión a Internet!"*.
4. Haz clic en el botón **"Probar Ruta No Cacheada 1"** (enlace a una página externa que nunca fue almacenada).
5. **Resultado clave:** En lugar del dinosaurio de Chrome, el Service Worker intercepta el fallo y renderiza de inmediato la plantilla `offline.html`. Al restablecer la red a *No throttling* y pulsar "Reintentar Conexión", el navegador vuelve al estado normal.
