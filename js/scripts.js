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

// Configurar opciones de compra específicas para carnes
function setupMeatPurchaseOptions() {
    document.querySelectorAll('.producto-card').forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const tipoCompraSelect = card.querySelector('.tipo-compra');
        const cantidadContainer = card.querySelector('.input-cantidad');
        const montoContainer = card.querySelector('.input-monto');
        const cantidadInput = card.querySelector('.cantidad-input');
        const montoInput = card.querySelector('.monto-input');
        const addToCartBtn = card.querySelector('.btn-add-cart');
        const precio = parseFloat(addToCartBtn.getAttribute('data-precio'));

        // Solo configurar para productos de carne
        if (productName.includes('carne') || productName.includes('pollo')) {
            if (tipoCompraSelect) {
                // Mostrar selector de tipo de compra
                tipoCompraSelect.style.display = 'block';
                
                // Configurar evento de cambio
                tipoCompraSelect.addEventListener('change', function() {
                    if (this.value === 'peso') {
                        cantidadContainer.style.display = 'flex';
                        montoContainer.style.display = 'none';
                        // Actualizar monto basado en peso
                        const peso = parseFloat(cantidadInput.value) || 0;
                        montoInput.value = (peso * precio).toFixed(0);
                    } else {
                        cantidadContainer.style.display = 'none';
                        montoContainer.style.display = 'flex';
                        // Actualizar peso basado en monto
                        const monto = parseFloat(montoInput.value) || 0;
                        cantidadInput.value = (monto / precio).toFixed(1);
                    }
                });

                // Configurar eventos de input
                cantidadInput.addEventListener('input', function() {
                    const peso = parseFloat(this.value) || 0;
                    montoInput.value = (peso * precio).toFixed(0);
                });

                montoInput.addEventListener('input', function() {
                    const monto = parseFloat(this.value) || 0;
                    cantidadInput.value = (monto / precio).toFixed(1);
                });

                // Configurar botón de agregar al carrito
                addToCartBtn.addEventListener('click', function() {
                    const isByWeight = tipoCompraSelect.value === 'peso';
                    let quantity, amount;

                    if (isByWeight) {
                        quantity = parseFloat(cantidadInput.value) || 0;
                        amount = quantity * precio;
                    } else {
                        amount = parseFloat(montoInput.value) || 0;
                        quantity = amount / precio;
                    }

                    // Validar cantidades mínimas
                    if (quantity < 0.1) {
                        showNotification('La cantidad mínima es 0.1 kg');
                        return;
                    }

                    addToCart({
                        id: this.getAttribute('data-id'),
                        name: this.getAttribute('data-nombre'),
                        price: precio,
                        quantity: parseFloat(quantity.toFixed(1)),
                        amount: parseFloat(amount.toFixed(0)),
                        unit: this.getAttribute('data-unidad'),
                        image: card.querySelector('.producto-img')?.src || ''
                    });
                });
            }
        } else {
            // Para productos que no son carne
            if (tipoCompraSelect) tipoCompraSelect.style.display = 'none';
            cantidadContainer.style.display = 'flex';
            montoContainer.style.display = 'none';

            // Configurar botón de agregar al carrito para productos no cárnicos
            addToCartBtn.addEventListener('click', function() {
                const quantity = parseFloat(cantidadInput.value) || 0;
                if (quantity < 0.1) {
                    showNotification('La cantidad mínima es 0.1 kg');
                    return;
                }

                addToCart({
                    id: this.getAttribute('data-id'),
                    name: this.getAttribute('data-nombre'),
                    price: precio,
                    quantity: parseFloat(quantity.toFixed(1)),
                    amount: parseFloat((quantity * precio).toFixed(0)),
                    unit: this.getAttribute('data-unidad'),
                    image: card.querySelector('.producto-img')?.src || ''
                });
            });
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

// Función para mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }, 10);
}

// Resto del código se mantiene igual...