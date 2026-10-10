// Ejercicio 1: Lógica para parsear manifest.json y controlar evento de instalación

let deferredPrompt;
const btnInstall = document.getElementById('btnInstall');
const installStatusText = document.getElementById('installStatusText');

// Cargar y mostrar dinámicamente las propiedades del manifest.json
async function loadManifestData() {
  try {
    const response = await fetch('manifest.json');
    const data = await response.json();

    document.getElementById('val-name').textContent = data.name || 'No definido';
    document.getElementById('val-shortname').textContent = data.short_name || 'No definido';
    document.getElementById('val-starturl').textContent = data.start_url || 'No definido';
    document.getElementById('val-display').textContent = data.display || 'No definido';
    document.getElementById('val-themecolor').textContent = data.theme_color || 'No definido';
    document.getElementById('val-bgcolor').textContent = data.background_color || 'No definido';

    // Asignar colores a los círculos de previsualización
    if (data.theme_color) {
      document.getElementById('theme-color-circle').style.backgroundColor = data.theme_color;
    }
    if (data.background_color) {
      document.getElementById('bg-color-circle').style.backgroundColor = data.background_color;
    }
  } catch (err) {
    console.error('Error cargando manifest.json:', err);
    installStatusText.textContent = 'Aviso: Abre este ejercicio mediante un servidor web (http://localhost/...) para leer el manifest.';
  }
}

// Capturar el evento beforeinstallprompt del navegador
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir que el navegador muestre automáticamente el mini-infobar por defecto
  e.preventDefault();
  // Guardar el evento para dispararlo cuando el usuario haga clic en el botón
  deferredPrompt = e;

  // Habilitar el botón de instalación
  btnInstall.removeAttribute('disabled');
  installStatusText.innerHTML = '<strong style="color: #34d399;">¡Listo para instalar!</strong> Haz clic en el botón de abajo o prueba en Chrome DevTools.';
});

// Manejar el clic en el botón de instalación
btnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) {
    alert('Para probar la instalación nativa, accede mediante http://localhost/... o usa Chrome DevTools (Application > Manifest > Install app).');
    return;
  }

  // Mostrar el prompt nativo de instalación
  deferredPrompt.prompt();

  // Esperar la decisión del usuario
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Resultado de instalación del usuario: ${outcome}`);

  if (outcome === 'accepted') {
    installStatusText.textContent = '¡Aplicación instalada exitosamente!';
    btnInstall.setAttribute('disabled', 'true');
  } else {
    installStatusText.textContent = 'El usuario canceló la instalación.';
  }

  deferredPrompt = null;
});

// Detectar si la aplicación ya está instalada o se abrió en modo standalone
window.addEventListener('appinstalled', () => {
  installStatusText.textContent = 'Aplicación PWA ya instalada en este dispositivo.';
  btnInstall.setAttribute('disabled', 'true');
  console.log('PWA fue instalada satisfactoriamente.');
});

// Comprobar si ya está corriendo en standalone
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
  installStatusText.textContent = 'Estás ejecutando la aplicación en modo Standalone (App instalada).';
  btnInstall.style.display = 'none';
}

// Inicializar carga de datos
loadManifestData();
