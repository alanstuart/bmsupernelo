// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let lastScrollTop = 0;
let scrollTimeout;

// Funciones de inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar selección de sucursal
    const sucursalModal = document.getElementById('sucursalModal');
    const selectedSucursal = localStorage.getItem('selectedSucursal');
    
    if (!selectedSucursal) {
        // Si no hay una sucursal seleccionada, mostrar el modal
        sucursalModal.style.display = 'flex';
    } else {
        // Actualizar el texto del botón con la sucursal seleccionada
        const sucursalActual = document.getElementById('sucursalActual');
        if (sucursalActual) {
            sucursalActual.textContent = selectedSucursal;
        }
    }
    
    // Configurar event listeners
    setupEventListeners();
    setupScrollBehavior();
    
    // Actualizar visualización del carrito
    updateCartDisplay();
    
    // Establecer fecha mínima para recogida
    setMinDate();
});

// Configurar comportamiento del scroll
function setupScrollBehavior() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    let isScrollingDown = false;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll <= 0) {
            header.classList.remove('nav-up');
            return;
        }
        
        if (currentScroll > lastScrollTop && !isScrollingDown && currentScroll > 150) {
            // Scrolling down
            header.classList.add('nav-up');
            isScrollingDown = true;
        } else if (currentScroll < lastScrollTop && isScrollingDown) {
            // Scrolling up
            header.classList.remove('nav-up');
            isScrollingDown = false;
        }
        
        lastScrollTop = currentScroll;
    }, { passive: true });
}

[Rest of your existing JavaScript...]