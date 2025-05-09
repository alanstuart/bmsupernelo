/**
 * Scripts para BM Supernelo - Versión optimizada
 * Supermercado en Cartago, Costa Rica
 * Última actualización: 09/05/2025
 */

// Clase para manejar el carrito de compras
class ShoppingCart {
    constructor() {
        // Inicializar el carrito desde localStorage o como un array vacío
        // Añadimos una marca de tiempo para forzar la actualización del caché
        const timestamp = new Date().getTime();
        const storageKey = `bmsupernelo_cart_${timestamp % 1000}`;
        this.storageKey = 'bmsupernelo_cart';
        this.cart = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.cartContainer = document.getElementById('cart-container');
        this.cartItems = document.getElementById('cart-items');
        this.cartTotalPrice = document.getElementById('cart-total-price');
        this.cartCount = document.querySelector('.cart-count');
        
        // Verificar que todos los elementos existan en el DOM
        if (!this.cartContainer || !this.cartItems || !this.cartTotalPrice || !this.cartCount) {
            console.error('Elementos del carrito no encontrados en el DOM');
            return;
        }
        
        // Inicializar eventos
        this.initEvents();
        
        // Actualizar la interfaz del carrito
        this.updateCartUI();
        
        // Registrar inicialización exitosa
        console.log('Carrito inicializado correctamente', timestamp);
    }
    
    // Inicializar eventos relacionados con el carrito
    initEvents() {
        // Evento para mostrar/ocultar el carrito
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.toggleCart();
            });
        }
        
        // Evento para cerrar el carrito
        const closeCart = document.getElementById('close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => {
                this.toggleCart();
            });
        }
        
        // Evento para vaciar el carrito
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }
        
        // Evento para finalizar la compra
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }
        
        // Eventos para agregar productos al carrito
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevenir comportamiento predeterminado
                
                const productId = button.getAttribute('data-id');
                const productName = button.getAttribute('data-name');
                const productPrice = parseInt(button.getAttribute('data-price'));
                
                if (!productId || !productName || isNaN(productPrice)) {
                    console.error('Datos de producto inválidos', { productId, productName, productPrice });
                    return;
                }
                
                this.addItem(productId, productName, productPrice);
                return false; // Evitar propagación
            });
        });
        
        // Forzar la actualización de la UI al cargar
        window.addEventListener('load', () => {
            this.updateCartUI();
        });
    }
    
    // Mostrar u ocultar el carrito
    toggleCart() {
        if (!this.cartContainer) return;
        this.cartContainer.classList.toggle('active');
        
        // Añadir animación
        if (this.cartContainer.classList.contains('active')) {
            this.cartContainer.style.animation = 'slideIn 0.3s forwards';
        } else {
            this.cartContainer.style.animation = 'slideOut 0.3s forwards';
        }
    }
    
    // Agregar un item al carrito
    addItem(id, name, price) {
        // Verificar si el producto ya está en el carrito
        const existingItemIndex = this.cart.findIndex(item => item.id === id);
        
        if (existingItemIndex !== -1) {
            // Si el producto ya está en el carrito, incrementar la cantidad
            this.cart[existingItemIndex].quantity += 1;
        } else {
            // Si el producto no está en el carrito, agregarlo
            this.cart.push({
                id: id,
                name: name,
                price: price,
                quantity: 1,
                added: new Date().toISOString() // Registrar cuando se añadió
            });
        }
        
        // Guardar el carrito en localStorage
        this.saveCart();
        
        // Actualizar la interfaz del carrito
        this.updateCartUI();
        
        // Mostrar mensaje de éxito
        this.showNotification(`${name} agregado al carrito`);
    }
    
    // Remover un item del carrito
    removeItem(id) {
        // Filtrar el carrito para eliminar el producto
        const itemToRemove = this.cart.find(item => item.id === id);
        if (itemToRemove) {
            const itemName = itemToRemove.name;
            this.cart = this.cart.filter(item => item.id !== id);
            
            // Guardar el carrito en localStorage
            this.saveCart();
            
            // Actualizar la interfaz del carrito
            this.updateCartUI();
            
            // Mostrar notificación
            this.showNotification(`${itemName} eliminado del carrito`);
        }
    }
    
    // Actualizar la cantidad de un item en el carrito
    updateQuantity(id, change) {
        const itemIndex = this.cart.findIndex(item => item.id === id);
        
        if (itemIndex !== -1) {
            // Actualizar la cantidad
            this.cart[itemIndex].quantity += change;
            
            // Si la cantidad es 0 o menos, eliminar el producto
            if (this.cart[itemIndex].quantity <= 0) {
                this.removeItem(id);
                return;
            }
            
            // Guardar el carrito en localStorage
            this.saveCart();
            
            // Actualizar la interfaz del carrito
            this.updateCartUI();
        }
    }
    
    // Vaciar el carrito
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('¿Está seguro que desea vaciar el carrito?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.showNotification('Carrito vaciado');
        }
    }
    
    // Finalizar la compra
    checkout() {
        if (this.cart.length === 0) {
            alert('Su carrito está vacío');
            return;
        }
        
        // Crear un resumen de la compra para mostrar
        let resumen = 'Resumen de su compra:\n\n';
        let total = 0;
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            resumen += `${item.name} x ${item.quantity} = ₡${itemTotal.toLocaleString()}\n`;
        });
        
        resumen += `\nTotal: ₡${total.toLocaleString()}`;
        
        // Mostrar resumen y confirmar
        if (confirm(`${resumen}\n\n¿Desea confirmar su compra?`)) {
            alert('¡Gracias por su compra! En breve recibirá la confirmación.');
            
            // Vaciar el carrito después de la compra
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            
            // Cerrar el carrito
            this.toggleCart();
        }
    }
    
    // Guardar el carrito en localStorage
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
        } catch (e) {
            console.error('Error al guardar el carrito en localStorage', e);
        }
    }
    
    // Actualizar la interfaz del carrito
    updateCartUI() {
        // Verificar que todos los elementos existen
        if (!this.cartItems || !this.cartTotalPrice || !this.cartCount) return;
        
        // Actualizar el contador del carrito
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        
        // Hacer visible el contador solo si hay items
        if (totalItems > 0) {
            this.cartCount.style.display = 'flex';
        } else {
            this.cartCount.style.display = 'none';
        }
        
        // Limpiar el contenedor de items
        this.cartItems.innerHTML = '';
        
        // Si el carrito está vacío, mostrar un mensaje
        if (this.cart.length === 0) {
            this.cartItems.innerHTML = '<p class="empty-cart">Su carrito está vacío</p>';
            this.cartTotalPrice.textContent = '₡0';
            return;
        }
        
        // Calcular el total
        let total = 0;
        
        // Agregar cada item al contenedor
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="img/placeholder.jpg" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">₡${item.price.toLocaleString()}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            this.cartItems.appendChild(cartItemElement);
        });
        
        // Actualizar el total
        this.cartTotalPrice.textContent = `₡${total.toLocaleString()}`;
        
        // Agregar eventos a los botones de cantidad y eliminar
        this.addCartItemEvents();
    }
    
    // Añadir eventos a los elementos del carrito
    addCartItemEvents() {
        const decreaseButtons = document.querySelectorAll('.decrease-btn');
        const increaseButtons = document.querySelectorAll('.increase-btn');
        const removeButtons = document.querySelectorAll('.remove-item');
        
        decreaseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                this.updateQuantity(id, -1);
            });
        });
        
        increaseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                this.updateQuantity(id, 1);
            });
        });
        
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                this.removeItem(id);
            });
        });
    }
    
    // Mostrar notificación
    showNotification(message) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Agregar estilos
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'var(--success-color, #4CAF50)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
        notification.style.zIndex = '1002';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Mostrar la notificación
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Ocultar y eliminar la notificación después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Clase para manejar el formulario de contacto
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
            
            // Añadir validación en tiempo real
            this.addRealTimeValidation();
        }
    }
    
    addRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }
    
    validateField(field) {
        if (field.required && !field.value.trim()) {
            field.classList.add('invalid');
            field.classList.remove('valid');
        } else {
            field.classList.add('valid');
            field.classList.remove('invalid');
        }
    }
    
    validateForm() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            if (input.required && !input.value.trim()) {
                this.validateField(input);
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    handleSubmit() {
        if (!this.validateForm()) {
            alert('Por favor complete todos los campos requeridos.');
            return;
        }
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Aquí se podría implementar la lógica para enviar el formulario
        // Por ejemplo, usando fetch para enviar a un endpoint
        console.log('Enviando formulario:', { name, email, message });
        
        // Simulamos una espera para el envío
        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                alert(`Gracias ${name} por su mensaje. Le contactaremos pronto.`);
                
                // Limpiar el formulario
                this.form.reset();
                
                // Restaurar el botón
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1000);
        } else {
            alert(`Gracias ${name} por su mensaje. Le contactaremos pronto.`);
            this.form.reset();
        }
    }
}

// Clase para manejar el botón de volver arriba
class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
        
        if (!this.button) {
            console.warn('Botón "back-to-top" no encontrado');
            return;
        }
        
        // Mostrar/ocultar el botón al hacer scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.button.classList.add('active');
            } else {
                this.button.classList.remove('active');
            }
        });
        
        // Evento para volver arriba
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Función para verificar si el DOM está listo
function domReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// Función para forzar la recarga de recursos
function forceRefresh() {
    // Añadir parámetro de tiempo a las imágenes para forzar recarga
    const images = document.querySelectorAll('img');
    const timestamp = new Date().getTime();
    
    images.forEach(img => {
        if (img.src) {
            if (img.src.indexOf('?') === -1) {
                img.src = `${img.src}?t=${timestamp}`;
            }
        }
    });
}

// Inicializar cuando el DOM esté cargado
domReady(() => {
    console.log('DOM cargado - Inicializando scripts BM Supernelo');
    
    // Forzar recarga de recursos
    forceRefresh();
    
    // Verificar si hay errores de carga
    window.addEventListener('error', function(e) {
        console.error('Error de carga:', e.target.src || e.target.href);
    }, true);
    
    try {
        // Inicializar el carrito
        const cart = new ShoppingCart();
        
        // Inicializar el formulario de contacto
        const contactForm = new ContactForm();
        
        // Inicializar el botón de volver arriba
        const backToTop = new BackToTop();
        
        // Animación suave para los enlaces de navegación
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Solo prevenir comportamiento predeterminado si es un anchor válido
                if (href && href !== '#') {
                    e.preventDefault();
                    
                    const targetId = href;
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
        
        // Añadir marca de versión visible (para depuración)
        const footer = document.querySelector('footer');
        if (footer) {
            const versionElement = document.createElement('div');
            versionElement.className = 'version-info';
            versionElement.textContent = `v.${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
            versionElement.style.fontSize = '10px';
            versionElement.style.opacity = '0.7';
            versionElement.style.marginTop = '10px';
            footer.appendChild(versionElement);
        }
        
        console.log('Inicialización completa');
    } catch (err) {
        console.error('Error al inicializar la aplicación:', err);
    }
});

// Agregar listener para cuando la página esté completamente cargada
window.addEventListener('load', () => {
    console.log('Página completamente cargada');
});
