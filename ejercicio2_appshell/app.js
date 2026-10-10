// Ejercicio 2: Lógica del App Shell y Splash Screen

// Elementos del DOM
const btnToggleMenu = document.getElementById('btnToggleMenu');
const btnCloseSidebar = document.getElementById('btnCloseSidebar');
const appSidebar = document.getElementById('appSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const currentViewTitle = document.getElementById('currentViewTitle');
const navLinks = document.querySelectorAll('.nav-link');
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
const viewSections = document.querySelectorAll('.view-section');

// Elementos de Splash Screen
const btnSimulateSplash = document.getElementById('btnSimulateSplash');
const btnTriggerSplash2 = document.getElementById('btnTriggerSplash2');
const splashScreenModal = document.getElementById('splashScreenModal');

// Skeleton demo
const btnReloadContent = document.getElementById('btnReloadContent');
const skeletonContainer = document.getElementById('skeletonContainer');

// 1. CONTROL DE NAVEGACIÓN Y VISTAS (APP SHELL)
function switchView(viewId) {
  // Ocultar todas las secciones
  viewSections.forEach(section => section.classList.remove('active'));

  // Activar la sección seleccionada
  const targetSection = document.getElementById(`view-${viewId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Actualizar estado en enlaces de navegación (Sidebar y Bottom Nav)
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === viewId);
  });
  bottomNavItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewId);
  });

  // Actualizar título del Header
  const titles = {
    'inicio': 'Inicio',
    'appshell': 'Arquitectura App Shell',
    'splash': 'Splash Screen Nativa',
    'devtools': 'Verificación en DevTools'
  };
  currentViewTitle.textContent = titles[viewId] || 'App Shell';

  // Cerrar menú móvil si está abierto
  closeMobileMenu();
}

// Event listeners para links del sidebar
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const view = link.getAttribute('data-view');
    switchView(view);
  });
});

// Event listeners para barra inferior móvil
bottomNavItems.forEach(item => {
  item.addEventListener('click', () => {
    const view = item.getAttribute('data-view');
    switchView(view);
  });
});

// 2. CONTROL DEL MENÚ MÓVIL (DRAWER RESPONSIVO)
function openMobileMenu() {
  appSidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
}

function closeMobileMenu() {
  appSidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

if (btnToggleMenu) btnToggleMenu.addEventListener('click', openMobileMenu);
if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeMobileMenu);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileMenu);

// 3. SIMULACIÓN DE SPLASH SCREEN NATIVA
function triggerSplashScreen() {
  splashScreenModal.classList.remove('hidden');

  // Simular la duración típica de una Splash Screen (1.8 segundos) mientras carga el App Shell
  setTimeout(() => {
    splashScreenModal.classList.add('hidden');
  }, 1800);
}

if (btnSimulateSplash) btnSimulateSplash.addEventListener('click', triggerSplashScreen);
if (btnTriggerSplash2) btnTriggerSplash2.addEventListener('click', triggerSplashScreen);

// 4. DEMO DE SKELETON LOADING (Simulación de carga asíncrona dentro del Shell)
if (btnReloadContent) {
  btnReloadContent.addEventListener('click', () => {
    skeletonContainer.innerHTML = `
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    `;

    setTimeout(() => {
      skeletonContainer.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; padding: 14px; border-radius: 8px;">
          <h4 style="color: #34d399; margin-bottom: 4px;">✔ Datos cargados en el Contenedor Principal</h4>
          <p style="color: #cbd5e1; font-size: 0.9rem;">El App Shell nunca parpadeó ni se recargó; únicamente este bloque interno se actualizó de manera fluida.</p>
        </div>
      `;
    }, 1200);
  });
}

// Opcional: mostrar Splash Screen nativa la primera vez que se entra
window.addEventListener('DOMContentLoaded', () => {
  // Breve Splash Screen de bienvenida para ilustrar el efecto de inicio nativo
  triggerSplashScreen();
});
