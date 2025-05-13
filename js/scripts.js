// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Funciones de inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar selección de sucursal
    const selectedSucursal = localStorage.getItem('selectedSucursal');
    const sucursalBtn = document.getElementById('sucursalBtn');
    const sucursalModal = document.getElementById('sucursalModal');
    
    if (!selectedSucursal) {
        // Si no hay sucursal seleccionada, mostrar el modal
        sucursalModal.style.display = 'flex';
    } else {
        // Actualizar el texto del botón con la sucursal seleccionada
        document.getElementById('sucursalActual').textContent = selectedSucursal;
    }
    
    // Event listener para el botón de sucursal
    if (sucursalBtn) {
        sucursalBtn.addEventListener('click', function() {
            sucursalModal.style.display = 'flex';
        });
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar visualización del carrito
    updateCartDisplay();
    
    // Establecer fecha mínima para recogida
    setMinDate();
});

// Función para seleccionar sucursal
function selectSucursal(sucursal) {
    localStorage.setItem('selectedSucursal', sucursal);
    document.getElementById('sucursalActual').textContent = sucursal;
    document.getElementById('sucursalModal').style.display = 'none';
    showNotification('Sucursal seleccionada: ' + sucursal);
}

// Configurar todos los event listeners
function setupEventListeners() {
    // Botón para carrito
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            document.getElementById('cartModal').style.display = 'flex';
        });
    }
    
    // Botones de cerrar modales
    document.querySelectorAll('.close').forEach(function(button) {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    // Configurar botones de añadir al carrito
    setupAddToCartButtons();
    
    // Configurar selectores de tipo de compra
    setupTipoCompraSelects();
}

// Establecer fecha mínima para recogida
function setMinDate() {
    const fechaRecogida = document.getElementById('fechaRecogida');
    if (fechaRecogida) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        
        fechaRecogida.min = `${yyyy}-${mm}-${dd}`;
        fechaRecogida.value = `${yyyy}-${mm}-${dd}`;
    }
}

// Configurar botones de añadir al carrito
function setupAddToCartButtons() {
    document.querySelectorAll('.btn-add-cart').forEach(function(button) {
        button.addEventListener('click', function() {
            const productCard = this.closest('.producto-card');
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-nombre');
            const productPrice = parseFloat(this.getAttribute('data-precio'));
            const productUnit = this.getAttribute('data-unidad');
            
            // Determinar tipo de compra y cantidad
            const tipoCompraSelect = productCard.querySelector('.tipo-compra');
            const tipoCompra = tipoCompraSelect.value;
            let quantity, amount;
            
            if (tipoCompra === 'peso') {
                const cantidadInput = productCard.querySelector('.cantidad-input');
                quantity = parseFloat(cantidadInput.value);
                amount = productPrice * quantity;
            } else {
                const montoInput = productCard.querySelector('.monto-input');
                amount = parseFloat(montoInput.value);
                quantity = parseFloat((amount / productPrice).toFixed(2));
            }
            
            // Añadir al carrito
            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: quantity,
                amount: amount,
                unit: productUnit
            });
        });
    });
}

// Configurar selectores de tipo de compra
function setupTipoCompraSelects() {
    document.querySelectorAll('.tipo-compra').forEach(function(select) {
        select.addEventListener('change', function() {
            const productCard = this.closest('.producto-card');
            const cantidadInput = productCard.querySelector('.input-cantidad');
            const montoInput = productCard.querySelector('.input-monto');
            
            if (this.value === 'peso') {
                cantidadInput.style.display = 'flex';
                montoInput.style.display = 'none';
            } else {
                cantidadInput.style.display = 'none';
                montoInput.style.display = 'flex';
            }
        });
    });
}

// Añadir producto al carrito
function addToCart(product) {
    // Verificar que se haya seleccionado una sucursal
    const selectedSucursal = localStorage.getItem('selectedSucursal');
    if (!selectedSucursal) {
        showNotification('Por favor seleccione una sucursal antes de agregar productos al carrito');
        return;
    }
    
    // Comprobar si el producto ya está en el carrito
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex !== -1) {
        // Actualizar cantidad si ya existe
        cart[existingProductIndex].quantity += product.quantity;
        cart[existingProductIndex].amount += product.amount;
    } else {
        // Añadir nuevo producto
        cart.push(product);
    }
    
    // Guardar en localStorage y actualizar UI
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification(product.name + ' agregado al carrito');
}

// Eliminar producto del carrito
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const productName = cart[index].name;
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification(productName + ' eliminado del carrito');
    }
}

// Actualizar cantidad de un producto en el carrito
function updateCartItemQuantity(index, newQuantity) {
    if (index >= 0 && index < cart.length) {
        if (newQuantity <= 0) {
            removeFromCart(index);
        } else {
            cart[index].quantity = newQuantity;
            cart[index].amount = cart[index].price * newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

// Actualizar la visualización del carrito
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartTotal = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');
    
    // Actualizar contador del carrito
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = Math.round(totalItems * 10) / 10;
    
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
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, ${item.quantity - 0.1})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="0.1" step="0.1"
                           onchange="updateCartItemQuantity(${index}, parseFloat(this.value) || 0.1)">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, ${item.quantity + 0.1})">+</button>
                </div>
                <div class="item-price">₡${Math.round(item.amount).toLocaleString()}</div>
                <button class="btn-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Actualizar el total
    cartTotal.textContent = `₡${Math.round(total).toLocaleString()}`;
}

// Mostrar formulario de checkout
function showCheckoutForm() {
    // Verificar que haya una sucursal seleccionada
    const selectedSucursal = localStorage.getItem('selectedSucursal');
    if (!selectedSucursal) {
        showNotification('Por favor seleccione una sucursal antes de continuar');
        return;
    }
    
    // Ocultar modal del carrito
    document.getElementById('cartModal').style.display = 'none';
    
    // Mostrar modal de checkout
    document.getElementById('checkoutModal').style.display = 'flex';
}

// Procesar orden
function processOrder(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const nombreCompleto = document.getElementById('nombreCompleto').value;
    const telefono = document.getElementById('telefono').value;
    const fechaRecogida = document.getElementById('fechaRecogida').value;
    const horaRecogida = document.getElementById('horaRecogida').value;
    const notasAdicionales = document.getElementById('notasAdicionales').value;
    
    // Validar campos requeridos
    if (!nombreCompleto || !telefono || !fechaRecogida || !horaRecogida) {
        showNotification('Por favor complete todos los campos requeridos');
        return;
    }
    
    // Crear objeto de pedido
    const order = {
        customer: {
            name: nombreCompleto,
            phone: telefono
        },
        pickup: {
            store: localStorage.getItem('selectedSucursal'),
            date: fechaRecogida,
            time: horaRecogida,
            notes: notasAdicionales
        },
        products: cart,
        total: cart.reduce((sum, item) => sum + item.amount, 0)
    };
    
    // Mostrar confirmación
    showOrderConfirmation(order);
}

// Mostrar confirmación del pedido
function showOrderConfirmation(order) {
    // Ocultar modal de checkout
    document.getElementById('checkoutModal').style.display = 'none';
    
    // Actualizar contenido de la confirmación
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    
    orderSummary.innerHTML = '';
    
    // Agregar productos
    order.products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <span>${product.name}</span>
            <span>${product.quantity} ${product.unit}</span>
            <span>₡${Math.round(product.amount).toLocaleString()}</span>
        `;
        orderSummary.appendChild(item);
    });
    
    // Agregar información de recogida
    const pickupInfo = document.createElement('div');
    pickupInfo.className = 'pickup-info';
    pickupInfo.innerHTML = `
        <p><strong>Fecha de recogida:</strong> ${formatDate(order.pickup.date)}</p>
        <p><strong>Hora:</strong> ${order.pickup.time}</p>
        <p><strong>Sucursal:</strong> ${order.pickup.store}</p>
    `;
    orderSummary.appendChild(pickupInfo);
    
    // Actualizar total
    orderTotal.textContent = `₡${Math.round(order.total).toLocaleString()}`;
    
    // Mostrar modal de confirmación
    document.getElementById('confirmationModal').style.display = 'flex';
}

// Finalizar orden
function finishOrder() {
    // Limpiar carrito
    cart = [];
    localStorage.removeItem('cart');
    
    // Ocultar modal de confirmación
    document.getElementById('confirmationModal').style.display = 'none';
    
    // Actualizar visualización del carrito
    updateCartDisplay();
    
    // Mostrar mensaje de éxito
    showNotification('¡Gracias por tu compra!');
}

// Función para dar formato a la fecha
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CR', options);
}

// Función para mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}