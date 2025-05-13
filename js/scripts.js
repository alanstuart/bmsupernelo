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
        const precio = parseFloat(card.querySelector('.precio').textContent.replace(/[^\d]/g, ''));

        // Solo configurar para productos de carne
        if (productName.includes('carne') || productName.includes('pollo') || productName.includes('tilapia')) {
            if (tipoCompraSelect) {
                // Mostrar selector de tipo de compra
                tipoCompraSelect.style.display = 'block';
                
                // Configurar evento de cambio
                tipoCompraSelect.addEventListener('change', function() {
                    const selectedValue = this.value;
                    if (selectedValue === 'peso') {
                        cantidadContainer.style.display = 'flex';
                        montoContainer.style.display = 'none';
                        // Actualizar monto basado en peso
                        const peso = parseFloat(cantidadInput.value) || 0;
                        montoInput.value = Math.round(peso * precio);
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
                    if (peso < 0.1) {
                        this.value = 0.1;
                    }
                    montoInput.value = Math.round(parseFloat(this.value) * precio);
                });

                montoInput.addEventListener('input', function() {
                    const monto = parseFloat(this.value) || 0;
                    if (monto < precio * 0.1) {
                        this.value = Math.round(precio * 0.1);
                    }
                    cantidadInput.value = (parseFloat(this.value) / precio).toFixed(1);
                });
            }
        } else {
            // Para productos que no son carne
            if (tipoCompraSelect) tipoCompraSelect.style.display = 'none';
            cantidadContainer.style.display = 'flex';
            montoContainer.style.display = 'none';
        }
    });

    // Configurar botones de agregar al carrito
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.producto-card');
            const tipoCompraSelect = card.querySelector('.tipo-compra');
            const cantidadInput = card.querySelector('.cantidad-input');
            const montoInput = card.querySelector('.monto-input');
            const precio = parseFloat(this.getAttribute('data-precio'));

            let quantity, amount;
            if (tipoCompraSelect && tipoCompraSelect.style.display !== 'none') {
                if (tipoCompraSelect.value === 'peso') {
                    quantity = parseFloat(cantidadInput.value);
                    amount = Math.round(quantity * precio);
                } else {
                    amount = parseFloat(montoInput.value);
                    quantity = parseFloat((amount / precio).toFixed(1));
                }
            } else {
                quantity = parseFloat(cantidadInput.value);
                amount = Math.round(quantity * precio);
            }

            // Validar cantidad mínima
            if (quantity < 0.1) {
                showNotification('La cantidad mínima es 0.1 kg');
                return;
            }

            addToCart({
                id: this.getAttribute('data-id'),
                name: this.getAttribute('data-nombre'),
                price: precio,
                quantity: quantity,
                amount: amount,
                unit: this.getAttribute('data-unidad'),
                image: card.querySelector('.producto-img')?.src || ''
            });
        });
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
        cart[existingProductIndex].amount = Math.round(cart[existingProductIndex].quantity * product.price);
    } else {
        cart.push({
            ...product,
            quantity: parseFloat(product.quantity.toFixed(1)),
            amount: Math.round(product.amount)
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

// Actualizar la visualización del carrito
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartTotal = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');
    
    if (!cartCount || !cartItems || !cartEmpty || !cartTotal || !btnCheckout) return;
    
    // Actualizar contador del carrito
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems.toFixed(1);
    
    // Si el carrito está vacío
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'flex';
        btnCheckout.disabled = true;
        cartTotal.textContent = '₡0';
        return;
    }
    
    // Si hay productos en el carrito
    cartItems.style.display = 'block';
    cartEmpty.style.display = 'none';
    btnCheckout.disabled = false;
    
    // Limpiar contenido actual
    cartItems.innerHTML = '';
    
    // Agregar productos al carrito visual
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.amount;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₡${item.price.toLocaleString()} / ${item.unit}</p>
            </div>
            <div class="item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, ${(item.quantity - 0.1).toFixed(1)})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity.toFixed(1)}" min="0.1" step="0.1"
                           onchange="updateCartItemQuantity(${index}, parseFloat(this.value) || 0.1)">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, ${(item.quantity + 0.1).toFixed(1)})">+</button>
                </div>
                <div class="item-price">₡${Math.round(item.amount).toLocaleString()}</div>
                <button class="btn-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Agregar botón para vaciar carrito
    const clearCartContainer = document.createElement('div');
    clearCartContainer.className = 'clear-cart-container';
    clearCartContainer.innerHTML = `
        <button class="btn-clear-cart" onclick="clearCart()">Vaciar carrito</button>
    `;
    cartItems.appendChild(clearCartContainer);
    
    // Actualizar el total
    cartTotal.textContent = `₡${Math.round(total).toLocaleString()}`;
}

// Función para actualizar cantidad en el carrito
function updateCartItemQuantity(index, newQuantity) {
    if (index >= 0 && index < cart.length) {
        if (newQuantity < 0.1) {
            newQuantity = 0.1;
        }
        
        const item = cart[index];
        item.quantity = parseFloat(newQuantity.toFixed(1));
        item.amount = Math.round(item.quantity * item.price);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

// Función para eliminar del carrito
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const productName = cart[index].name;
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification(productName + ' eliminado del carrito');
    }
}

// Función para vaciar el carrito
function clearCart() {
    if (confirm('¿Está seguro de que desea vaciar el carrito?')) {
        cart = [];
        localStorage.removeItem('cart');
        updateCartDisplay();
        showNotification('Carrito vaciado');
    }
}

// Función para seleccionar sucursal
function selectSucursal(name) {
    localStorage.setItem('selectedSucursal', name);
    
    const sucursalActual = document.getElementById('sucursalActual');
    if (sucursalActual) {
        sucursalActual.textContent = name;
    }
    
    const modal = document.getElementById('sucursalModal');
    modal.style.display = 'none';
    
    showNotification('Sucursal seleccionada: ' + name);
}

// Configurar event listeners
function setupEventListeners() {
    const sucursalBtn = document.getElementById('sucursalBtn');
    if (sucursalBtn) {
        sucursalBtn.addEventListener('click', function() {
            document.getElementById('sucursalModal').style.display = 'flex';
        });
    }
    
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            document.getElementById('cartModal').style.display = 'flex';
        });
    }
    
    document.querySelectorAll('.close').forEach(function(button) {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

// Establecer fecha mínima para recogida
function setMinDate() {
    const fechaRecogida = document.getElementById('fechaRecogida');
    if (fechaRecogida) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        fechaRecogida.min = `${yyyy}-${mm}-${dd}`;
    }
}