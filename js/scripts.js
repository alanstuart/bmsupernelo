// Add this at the beginning of your file
let lastScrollTop = 0;
const header = document.querySelector('header');
const headerHeight = header.offsetHeight;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
        // Scrolling down & past header
        header.classList.add('nav-up');
    } else {
        // Scrolling up
        header.classList.remove('nav-up');
    }
    
    lastScrollTop = scrollTop;
});

// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
        
        // Actualizar el campo del formulario de checkout
        const sucursalRecogida = document.getElementById('sucursalRecogida');
        if (sucursalRecogida) {
            if (selectedSucursal === 'Sucursal Lima') {
                sucursalRecogida.value = 'Lima';
            } else if (selectedSucursal === 'Sucursal San Rafael') {
                sucursalRecogida.value = 'San Rafael';
            }
        }
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar visualización del carrito
    updateCartDisplay();
    
    // Establecer fecha mínima para recogida
    setMinDate();
});

// Configurar todos los event listeners
function setupEventListeners() {
    // Botón para cambiar sucursal
    const sucursalBtn = document.getElementById('sucursalBtn');
    if (sucursalBtn) {
        sucursalBtn.addEventListener('click', function() {
            document.getElementById('sucursalModal').style.display = 'flex';
        });
    }
    
    // Configurar botón de carrito
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            document.getElementById('cartModal').style.display = 'flex';
        });
    }
    
    // Botón para checkout
    const btnCheckout = document.getElementById('btnCheckout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', function() {
            document.getElementById('cartModal').style.display = 'none';
            document.getElementById('checkoutModal').style.display = 'flex';
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
    
    // Botón para continuar comprando después de confirmación
    const btnContinueShopping = document.getElementById('btnContinueShopping');
    if (btnContinueShopping) {
        btnContinueShopping.addEventListener('click', function() {
            document.getElementById('confirmationModal').style.display = 'none';
            window.location.reload();
        });
    }
    
    // Configurar pestañas de categorías
    const categoriasTabs = document.querySelectorAll('.categoria-tab');
    categoriasTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            
            // Quitar clase active de todas las pestañas y contenido
            document.querySelectorAll('.categoria-tab').forEach(function(t) {
                t.classList.remove('active');
            });
            document.querySelectorAll('.categoria-content').forEach(function(c) {
                c.classList.remove('active');
            });
            
            // Añadir clase active a la pestaña seleccionada
            this.classList.add('active');
            
            // Añadir clase active al contenido correspondiente
            const categoriaContent = document.getElementById(categoria);
            if (categoriaContent) {
                categoriaContent.classList.add('active');
            }
        });
    });
    
    // Configurar botones de añadir al carrito
    setupAddToCartButtons();
    
    // Configurar selectores de tipo de compra
    setupTipoCompraSelects();
    
    // Configurar campo de búsqueda
    setupSearch();
    
    // Validación en tiempo real de campos de tarjeta
    setupCardValidation();
}

// Establecer fecha mínima para recogida
function setMinDate() {
    const fechaRecogida = document.getElementById('fechaRecogida');
    if (fechaRecogida) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        const formattedToday = `${yyyy}-${mm}-${dd}`;
        fechaRecogida.min = formattedToday;
    }
}

// Configurar botones de añadir al carrito
function setupAddToCartButtons() {
    document.querySelectorAll('.btn-add-cart').forEach(function(button) {
        button.addEventListener('click', function() {
            const productCard = this.closest('.producto-card');
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-nombre') || productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(this.getAttribute('data-precio')) || 
                               parseInt(productCard.querySelector('.precio').textContent.replace(/[^\d]/g, ''));
            const productUnit = this.getAttribute('data-unidad') || 'kg';
            const productImage = productCard.querySelector('.producto-img')?.src || '';
            
            // Determinar tipo de compra y cantidad
            let quantity, amount;
            
            const tipoCompraSelect = productCard.querySelector('.tipo-compra');
            if (tipoCompraSelect) {
                const tipoCompra = tipoCompraSelect.value;
                
                if (tipoCompra === 'peso') {
                    const cantidadInput = productCard.querySelector('.cantidad-input');
                    quantity = cantidadInput ? parseFloat(cantidadInput.value) : 1;
                    amount = productPrice * quantity;
                } else { // Por monto
                    const montoInput = productCard.querySelector('.monto-input');
                    amount = montoInput ? parseFloat(montoInput.value) : productPrice;
                    quantity = parseFloat((amount / productPrice).toFixed(2));
                }
            } else {
                quantity = 1;
                amount = productPrice;
            }
            
            // Añadir al carrito
            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: quantity,
                amount: amount,
                unit: productUnit,
                image: productImage
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
            
            if (cantidadInput && montoInput) {
                if (this.value === 'peso') {
                    cantidadInput.style.display = 'flex';
                    montoInput.style.display = 'none';
                } else { // Por monto
                    cantidadInput.style.display = 'none';
                    montoInput.style.display = 'flex';
                }
            }
        });
    });
}

// Configurar campo de búsqueda
function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        // Buscar al hacer clic en el botón
        searchBtn.addEventListener('click', function() {
            searchProducts(searchInput.value);
        });
        
        // Buscar al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts(searchInput.value);
            }
        });
    }
}

// Función para buscar productos
function searchProducts(query) {
    if (!query.trim()) return;
    
    query = query.trim().toLowerCase();
    showNotification('Buscando: ' + query);
    
    let found = false;
    
    // Buscar en todas las tarjetas de productos
    document.querySelectorAll('.producto-card').forEach(function(card) {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        // Si el título o descripción contienen la consulta, mostrar el producto
        if (title.includes(query) || description.includes(query)) {
            card.style.display = 'block';
            found = true;
            
            // Resaltar el primer producto encontrado
            if (!document.querySelector('.producto-card.highlighted')) {
                card.classList.add('highlighted');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    // Si no se encontraron productos, mostrar notificación
    if (!found) {
        showNotification('No se encontraron productos para: ' + query);
    }
}

// Configurar validación de tarjeta en tiempo real
function setupCardValidation() {
    const numeroTarjeta = document.getElementById('numeroTarjeta');
    const cvv = document.getElementById('cvv');
    const tipoTarjeta = document.getElementById('tipoTarjeta');
    
    if (numeroTarjeta) {
        // Formatear número de tarjeta mientras se escribe
        numeroTarjeta.addEventListener('input', function(e) {
            // Eliminar todo excepto números
            let value = this.value.replace(/\D/g, '');
            
            // Limitar a 16 dígitos
            if (value.length > 16) {
                value = value.slice(0, 16);
            }
            
            // Actualizar el valor sin formato
            this.value = value;
            
            // Detectar tipo de tarjeta si existe el selector
            if (tipoTarjeta && value.length >= 2) {
                const firstDigits = value.substring(0, 2);
                
                // Reglas básicas para detectar tipo de tarjeta
                if (/^4/.test(value)) {
                    tipoTarjeta.value = 'visa';
                } else if (/^5[1-5]/.test(value)) {
                    tipoTarjeta.value = 'mastercard';
                } else if (/^3[47]/.test(value)) {
                    tipoTarjeta.value = 'amex';
                } else {
                    tipoTarjeta.value = '';
                }
            }
        });
    }
    
    if (cvv) {
        // Validar CVV
        cvv.addEventListener('input', function(e) {
            // Eliminar todo excepto números
            let value = this.value.replace(/\D/g, '');
            
            // Limitar a 4 dígitos
            if (value.length > 4) {
                value = value.slice(0, 4);
            }
            
            // Actualizar el valor
            this.value = value;
        });
        
        // Ajustar longitud del CVV según tipo de tarjeta
        if (tipoTarjeta) {
            tipoTarjeta.addEventListener('change', function() {
                if (this.value === 'amex') {
                    cvv.pattern = "[0-9]{4}";
                    cvv.setAttribute('maxlength', '4');
                    document.querySelector('.cvv-info .tooltip').textContent = 
                        'Código de 4 dígitos en el frente de la tarjeta American Express';
                } else {
                    cvv.pattern = "[0-9]{3}";
                    cvv.setAttribute('maxlength', '3');
                    document.querySelector('.cvv-info .tooltip').textContent = 
                        'Código de 3 dígitos ubicado en el reverso de la tarjeta';
                }
            });
        }
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
    
    // Actualizar también el campo de formulario de checkout
    const sucursalRecogida = document.getElementById('sucursalRecogida');
    if (sucursalRecogida) {
        if (name === 'Sucursal Lima') {
            sucursalRecogida.value = 'Lima';
        } else if (name === 'Sucursal San Rafael') {
            sucursalRecogida.value = 'San Rafael';
        }
    }
    
    // Mostrar notificación
    showNotification('Sucursal seleccionada: ' + name);
}

// Función para compartir productos
function shareProduct(platform, productName) {
    event.preventDefault();
    
    const url = window.location.href;
    const text = '¡Mira este producto en BM Super Nelo! ' + productName;
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '&quote=' + encodeURIComponent(text);
            break;
        case 'whatsapp':
            shareUrl = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url);
            break;
        case 'twitter':
            shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank');
    }
}

// FUNCIONES PARA EL CARRITO

// Añadir producto al carrito
function addToCart(product) {
    // Verificar que se haya seleccionado una sucursal
    const selectedSucursal = localStorage.getItem('selectedSucursal');
    if (!selectedSucursal) {
        showNotification('Por favor seleccione una sucursal antes de agregar productos al carrito');
        document.getElementById('sucursalModal').style.display = 'flex';
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
            // Actualizar la cantidad
            const item = cart[index];
            const oldQuantity = item.quantity;
            item.quantity = newQuantity;
            
            // Actualizar el monto basado en la nueva cantidad
            item.amount = (item.price * newQuantity);
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

// Vaciar el carrito
function clearCart() {
    if (confirm('¿Está seguro de que desea vaciar el carrito?')) {
        cart = [];
        localStorage.removeItem('cart');
        updateCartDisplay();
        showNotification('Carrito vaciado');
    }
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
    cartCount.textContent = Math.round(totalItems * 10) / 10; // Redondear a 1 decimal
    
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
                <p>₡${item.price.toLocaleString('es-CR')} / ${item.unit}</p>
            </div>
            <div class="item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, ${(item.quantity - 0.1).toFixed(1)})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="0.1" step="0.1" max="100"
                           onchange="updateCartItemQuantity(${index}, parseFloat(this.value) || 0.1)">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, ${(item.quantity + 0.1).toFixed(1)})">+</button>
                </div>
                <div class="item-price">₡${Math.round(item.amount).toLocaleString('es-CR')}</div>
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
    cartTotal.textContent = `₡${Math.round(total).toLocaleString('es-CR')}`;
}

// FUNCIONES PARA CHECKOUT

// Procesar orden
function processOrder(event) {
    event.preventDefault();
    
    // Validar formulario
    const nombreCompleto = document.getElementById('nombreCompleto').value;
    const telefono = document.getElementById('telefono').value;
    const sucursal = document.getElementById('sucursalRecogida').value;
    const fecha = document.getElementById('fechaRecogida').value;
    const hora = document.getElementById('horaRecogida').value;
    const notasAdicionales = document.getElementById('notasAdicionales')?.value || '';
    
    // Validar datos de tarjeta
    const tipoTarjeta = document.getElementById('tipoTarjeta').value;
    const numeroTarjeta = document.getElementById('numeroTarjeta').value;
    const nombreTarjeta = document.getElementById('nombreTarjeta').value;
    const expMonth = document.getElementById('expMonth').value;
    const expYear = document.getElementById('expYear').value;
    const cvv = document.getElementById('cvv').value;
    
    // Validaciones básicas
    if (!nombreCompleto || !telefono || !sucursal || !fecha || !hora) {
        showNotification('Complete todos los campos de contacto y recogida');
        return false;
    }
    
    // Validar datos de tarjeta
    if (!tipoTarjeta || !numeroTarjeta || !nombreTarjeta || !expMonth || !expYear || !cvv) {
        showNotification('Complete todos los datos de la tarjeta');
        return false;
    }
    
    // Validar número de tarjeta
    if (!/^\d{16}$/.test(numeroTarjeta)) {
        showNotification('El número de tarjeta debe tener 16 dígitos');
        document.getElementById('numeroTarjeta').focus();
        return false;
    }
    
    // Validar CVV
    if (!/^\d{3,4}$/.test(cvv)) {
        showNotification('El CVV debe tener 3 o 4 dígitos');
        document.getElementById('cvv').focus();
        return false;
    }
    
    // Validar fecha de expiración
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(expYear) < currentYear || 
        (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
        showNotification('La tarjeta ha expirado');
        return false;
    }
    
    // Si todas las validaciones son correctas
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + item.amount, 0);
    
    // Crear objeto de pedido
    const pedido = {
        cliente: {
            nombre: nombreCompleto,
            telefono: telefono
        },
        recogida: {
            sucursal: sucursal,
            fecha: fecha,
            hora: hora,
            notas: notasAdicionales
        },
        pago: {
            tipo: tipoTarjeta,
            // Solo guardar los últimos 4 dígitos por seguridad
            numeroTarjeta: '****' + numeroTarjeta.slice(-4),
            fechaExp: expMonth + '/' + expYear.slice(-2)
        },
        productos: cart,
        total: total,
        fechaPedido: new Date().toISOString(),
        numeroPedido: 'BM-' + Date.now().toString().slice(-6)
    };
    
    // Guardar pedido en localStorage
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    // Mostrar confirmación
    displayOrderConfirmation(pedido);
    
    // Ocultar modal de checkout
    document.getElementById('checkoutModal').style.display = 'none';
    
    // Mostrar modal de confirmación
    document.getElementById('confirmationModal').style.display = 'flex';
    
    // Vaciar carrito
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    
    return false;
}

// Función para mostrar la confirmación del pedido
function displayOrderConfirmation(pedido) {
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    
    if (!orderSummary || !orderTotal) return;
    
    // Limpiar contenido anterior
    orderSummary.innerHTML = '';
    
    // Agregar cada producto al resumen
    pedido.productos.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-quantity">${item.quantity} ${item.unit}</div>
            <div class="item-price">₡${Math.round(item.amount).toLocaleString('es-CR')}</div>
        `;
        
        orderSummary.appendChild(itemElement);
    });
    
    // Agregar información de recogida
    const infoElement = document.createElement('div');
    infoElement.className = 'order-info';
    infoElement.innerHTML = `
        <p><strong>Sucursal:</strong> ${pedido.recogida.sucursal}</p>
        <p><strong>Fecha de recogida:</strong> ${formatDate(pedido.recogida.fecha)}</p>
        <p><strong>Hora:</strong> ${formatTime(pedido.recogida.hora)}</p>
        <p><strong>Número de pedido:</strong> ${pedido.numeroPedido}</p>
    `;
    
    // Si hay notas adicionales, mostrarlas
    if (pedido.recogida.notas) {
        infoElement.innerHTML += `<p><strong>Notas:</strong> ${pedido.recogida.notas}</p>`;
    }
    
    orderSummary.appendChild(infoElement);
    
    // Actualizar total
    orderTotal.textContent = `₡${Math.round(pedido.total).toLocaleString('es-CR')}`;
}

// Función para dar formato a la fecha
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CR', options);
}

// Función para dar formato a la hora
function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
    return `${hour12}:${minute} ${period}`;
}

// Función para mostrar notificaciones
function showNotification(message) {
    // Eliminar notificaciones anteriores
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        document.body.removeChild(notification);
    });
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Eliminar del DOM después de la animación
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }, 10);
}