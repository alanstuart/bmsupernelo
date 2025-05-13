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
        sucursalModal.style.display = 'flex';
    } else {
        const sucursalActual = document.getElementById('sucursalActual');
        if (sucursalActual) {
            sucursalActual.textContent = selectedSucursal;
        }
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar visualización del carrito
    updateCartDisplay();
    
    // Establecer fecha mínima para recogida
    setMinDate();
    
    // Configurar opciones de compra para carnes
    setupMeatPurchaseOptions();
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

// Configurar opciones de compra específicas para carnes
function setupMeatPurchaseOptions() {
    document.querySelectorAll('.producto-card').forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const tipoCompraSelect = card.querySelector('.tipo-compra');
        
        // Solo mostrar opciones de peso/monto para productos de carne
        if (productName.includes('carne') || productName.includes('pollo')) {
            if (tipoCompraSelect) {
                tipoCompraSelect.style.display = 'block';
                
                // Configurar evento de cambio
                tipoCompraSelect.addEventListener('change', function() {
                    const cantidadInput = card.querySelector('.input-cantidad');
                    const montoInput = card.querySelector('.input-monto');
                    const precio = parseFloat(card.querySelector('.btn-add-cart').getAttribute('data-precio'));
                    
                    if (this.value === 'peso') {
                        cantidadInput.style.display = 'flex';
                        montoInput.style.display = 'none';
                        
                        // Actualizar monto basado en peso
                        const peso = parseFloat(cantidadInput.querySelector('input').value);
                        montoInput.querySelector('input').value = (peso * precio).toFixed(0);
                    } else {
                        cantidadInput.style.display = 'none';
                        montoInput.style.display = 'flex';
                        
                        // Actualizar peso basado en monto
                        const monto = parseFloat(montoInput.querySelector('input').value);
                        cantidadInput.querySelector('input').value = (monto / precio).toFixed(1);
                    }
                });
                
                // Configurar eventos de input para actualización en tiempo real
                const cantidadInput = card.querySelector('.cantidad-input');
                const montoInput = card.querySelector('.monto-input');
                const precio = parseFloat(card.querySelector('.btn-add-cart').getAttribute('data-precio'));
                
                cantidadInput.addEventListener('input', function() {
                    const peso = parseFloat(this.value) || 0;
                    montoInput.value = (peso * precio).toFixed(0);
                });
                
                montoInput.addEventListener('input', function() {
                    const monto = parseFloat(this.value) || 0;
                    cantidadInput.value = (monto / precio).toFixed(1);
                });
            }
        } else {
            // Ocultar opciones de peso/monto para productos que no son carne
            if (tipoCompraSelect) {
                tipoCompraSelect.style.display = 'none';
            }
            card.querySelector('.input-cantidad').style.display = 'flex';
            card.querySelector('.input-monto').style.display = 'none';
        }
    });
}

// Función para añadir al carrito
function addToCart(product) {
    const selectedSucursal = localStorage.getItem('selectedSucursal');
    if (!selectedSucursal) {
        showNotification('Por favor seleccione una sucursal antes de agregar productos al carrito');
        document.getElementById('sucursalModal').style.display = 'flex';
        return;
    }
    
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity = parseFloat((cart[existingProductIndex].quantity + product.quantity).toFixed(1));
        cart[existingProductIndex].amount = parseFloat((cart[existingProductIndex].quantity * product.price).toFixed(0));
    } else {
        cart.push({
            ...product,
            quantity: parseFloat(product.quantity.toFixed(1)),
            amount: parseFloat((product.quantity * product.price).toFixed(0))
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification(`${product.name} agregado al carrito`);
}