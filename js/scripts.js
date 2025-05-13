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
    const scrollThreshold = 10;
    
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDiff = Math.abs(scrollTop - lastScrollTop);
            
            // Solo actuar si el scroll es mayor que el umbral
            if (scrollDiff > scrollThreshold) {
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    // Scrolling down & past header
                    header.classList.add('nav-up');
                } else {
                    // Scrolling up
                    header.classList.remove('nav-up');
                }
                lastScrollTop = scrollTop;
            }
        }, 50); // Pequeño delay para mejor rendimiento
    });
}

[Rest of your existing JavaScript...]