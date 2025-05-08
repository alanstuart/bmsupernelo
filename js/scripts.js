/**
 * Scripts para BM Supernelo
 * Supermercado en Cartago, Costa Rica
 */

// Clase para manejar el carrito de compras
class ShoppingCart {
    constructor() {
        // Inicializar el carrito desde localStorage o como un array vacío
        this.cart = JSON.parse(localStorage.getItem('bmsupernelo_cart')) || [];
        this.cartContainer = document.getElementById('cart-container');
        this.cartItems = document.getElementById('cart-items');
        this.cartTotalPrice = document.getElementById('cart-total-price');
        this.cartCount = document.querySelector('.cart-count');
        
        // Inicializar eventos
        this.initEvents();
        
        // Actualizar la interfaz del carrito
        this.updateCartUI();
    }
    
    // Inicializar eventos relacionados con el carrito
    initEvents() {
        // Evento para mostrar/ocultar el carrito
        document.getElementById('cart-icon').addEventListener('click', () => {
            this.toggleCart();
        });
        
        // Evento para cerrar el carrito
        document.getElementById('close-cart').addEventListener('click', () => {
            this.toggleCart();
        });
        
        // Evento para vaciar el carrito
        document.getElementById('clear-cart-btn').addEventListener('click', () => {
            this.clearCart();
        });
        
        // Evento para finalizar la compra
        document.getElementById('checkout-btn').addEventListener('click', () => {
            this.checkout();
        });
        
        // Eventos para agregar productos al carrito
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                const productName = button.getAttribute('data-name');
                const productPrice = parseInt(button.getAttribute('data-price'));
                
                this.addItem(productId, productName, productPrice);
            });
        });
    }
    
    // Mostrar u ocultar el carrito
    toggleCart() {
        this.cartContainer.classList.toggle('active');
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
                quantity: 1
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
        this.cart = this.cart.filter(item => item.id !== id);
        
        // Guardar el carrito en localStorage
        this.saveCart();
        
        // Actualizar la interfaz del carrito
        this.updateCartUI();
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
        
        // Aquí se podría implementar la lógica para procesar la compra
        // Por ahora, solo mostraremos un mensaje
        alert('¡Gracias por su compra! En breve recibirá la confirmación.');
        
        // Vaciar el carrito después de la compra
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        
        // Cerrar el carrito
        this.toggleCart();
    }
    
    // Guardar el carrito en localStorage
    saveCart() {
        localStorage.setItem('bmsupernelo_cart', JSON.stringify(this.cart));
    }
    
    // Actualizar la interfaz del carrito
    updateCartUI() {
        // Actualizar el contador del carrito
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        
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
                    <img src="img/placeholder.jpg" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">₡${item.price.toLocaleString()}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">
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
        notification.style.backgroundColor = 'var(--success-color)';
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
                document.body.removeChild(notification);
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
        }
    }
    
    handleSubmit() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Aquí se podría implementar la lógica para enviar el formulario
        // Por ahora, solo mostraremos un mensaje
        alert(`Gracias ${name} por su mensaje. Le contactaremos pronto.`);
        
        // Limpiar el formulario
        this.form.reset();
    }
}

// Clase para manejar el botón de volver arriba
class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
        
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

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
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
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});
