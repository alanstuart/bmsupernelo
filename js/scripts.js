/**
 * Scripts para BM Supernelo - Versión optimizada
 * Supermercado en Cartago, Costa Rica
 * Última actualización: 09/05/2025
 */

// Preloader functionality
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// Reveal elements on scroll
function revealElements() {
    const elements = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', revealElements);
window.addEventListener('load', revealElements);

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Show/hide more products functionality
    const viewAllCarnesBtn = document.getElementById('view-all-carnes');
    const hideAllCarnesBtn = document.getElementById('hide-all-carnes');
    const moreCarnesProducts = document.getElementById('more-carnes-products');
    
    if(viewAllCarnesBtn && hideAllCarnesBtn && moreCarnesProducts) {
        viewAllCarnesBtn.addEventListener('click', function() {
            moreCarnesProducts.classList.remove('hidden');
            viewAllCarnesBtn.classList.add('hidden');
            hideAllCarnesBtn.classList.remove('hidden');
        });
        
        hideAllCarnesBtn.addEventListener('click', function() {
            moreCarnesProducts.classList.add('hidden');
            hideAllCarnesBtn.classList.add('hidden');
            viewAllCarnesBtn.classList.remove('hidden');
            
            // Scroll back to the carnes section
            const carnesSection = document.getElementById('carnes-section');
            if (carnesSection) {
                carnesSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Search toggle
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    
    if (searchToggle && searchBar) {
        searchToggle.addEventListener('click', function() {
            searchBar.classList.toggle('hidden');
            if (!searchBar.classList.contains('hidden') && searchInput) {
                searchInput.focus();
            }
        });
    }

    // Search button click event
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            searchProducts();
        });
    }

    // Search input enter key press
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }

    // Category filter
    document.querySelectorAll('.category-button').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active class
            document.querySelectorAll('.category-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Filter products
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Close search bar
            if (searchBar) {
                searchBar.classList.add('hidden');
            }
            
            // Scroll to products section
            const targetSection = document.getElementById(category + '-section');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Setup form behaviors
    setupFormBehaviors();
    
    // Initialize cart
    initializeCart();
});

// Search functionality
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchQuery = searchInput.value.toLowerCase().trim();
    if (searchQuery === '') return;
    
    const productCards = document.querySelectorAll('.product-card');
    let hasResults = false;
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (productName.includes(searchQuery) || productDesc.includes(searchQuery)) {
            card.style.display = 'block';
            card.classList.add('search-highlight');
            setTimeout(() => {
                card.classList.remove('search-highlight');
            }, 2000);
            hasResults = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show message if no results
    if (!hasResults) {
        showNotification('No se encontraron productos');
    } else {
        // Activar la categoría "Todos"
        document.querySelectorAll('.category-button').forEach(btn => {
            btn.classList.remove('active');
        });
        const allCategoryBtn = document.querySelector('[data-category="all"]');
        if (allCategoryBtn) {
            allCategoryBtn.classList.add('active');
        }
    }
}

// Cart functionality
function initializeCart() {
    window.cart = [];
    const cartButton = document.getElementById('cart-button');
    const cartCount = document.getElementById('cart-count');
    const shoppingCart = document.getElementById('shopping-cart');
    const cartItems = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const orderForm = document.getElementById('order-form');
    const checkoutSection = document.getElementById('checkout-section');
    const orderConfirmation = document.getElementById('order-confirmation');
    const proceedToCheckout = document.getElementById('proceed-to-checkout');

    if (!cartButton || !cartCount || !shoppingCart) return;

    // Toggle cart visibility on button click
    cartButton.addEventListener('click', () => {
        if (shoppingCart.classList.contains('hidden')) {
            shoppingCart.classList.remove('hidden');
            
            // Hide order form when showing cart
            if (orderForm) orderForm.classList.add('hidden');
            if (checkoutSection) checkoutSection.classList.add('hidden');
            
            // Scroll to cart
            shoppingCart.scrollIntoView({ behavior: 'smooth' });
        } else {
            shoppingCart.classList.add('hidden');
        }
    });

    // Proceed to checkout button
    if(proceedToCheckout) {
        proceedToCheckout.addEventListener('click', () => {
            if (window.cart && window.cart.length > 0) {
                shoppingCart.classList.add('hidden');
                
                // Show order form
                if (orderForm) {
                    orderForm.classList.remove('hidden');
                    
                    if (checkoutSection) {
                        checkoutSection.classList.remove('hidden');
                    }
                    
                    // Set default date to today
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    let mm = today.getMonth() + 1;
                    let dd = today.getDate();
                    if (dd < 10) dd = '0' + dd;
                    if (mm < 10) mm = '0' + mm;
                    
                    const pickupDate = document.getElementById('pickup-date');
                    if (pickupDate) {
                        pickupDate.value = `${yyyy}-${mm}-${dd}`;
                        pickupDate.min = `${yyyy}-${mm}-${dd}`; // Can't pick a date in the past
                    }
                    
                    // Set default pickup time
                    const pickupTime = document.getElementById('pickup-time');
                    if (pickupTime) {
                        pickupTime.value = "10:00";
                    }
                    
                    // Scroll to order form
                    orderForm.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Place order button functionality
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            // Get form values
            const name = document.getElementById('name')?.value;
            const phone = document.getElementById('phone')?.value;
            const sucursal = document.getElementById('sucursal')?.value;
            const pickupDate = document.getElementById('pickup-date')?.value;
            const pickupTime = document.getElementById('pickup-time')?.value;
            
            // Basic validation
            if (!name) {
                showNotification('Por favor ingrese su nombre');
                document.getElementById('name')?.focus();
                return;
            }
            if (!phone) {
                showNotification('Por favor ingrese su teléfono');
                document.getElementById('phone')?.focus();
                return;
            }
            if (!sucursal) {
                showNotification('Por favor seleccione una sucursal');
                document.getElementById('sucursal')?.focus();
                return;
            }
            if (!pickupDate) {
                showNotification('Por favor seleccione fecha de recogida');
                document.getElementById('pickup-date')?.focus();
                return;
            }
            if (!pickupTime) {
                showNotification('Por favor seleccione hora de recogida');
                document.getElementById('pickup-time')?.focus();
                return;
            }
            
            // Hide order form
            if (orderForm) orderForm.classList.add('hidden');
            if (checkoutSection) checkoutSection.classList.add('hidden');
            
            // Generate random order number
            const orderNum = Math.floor(100000 + Math.random() * 900000);
            const orderNumber = document.getElementById('order-number');
            if (orderNumber) {
                orderNumber.textContent = `Número de pedido: #${orderNum}`;
            }
            
            // Show pickup time in confirmation
            const pickupConfirmation = document.getElementById('pickup-confirmation');
            if (pickupConfirmation) {
                const formattedDate = new Date(pickupDate).toLocaleDateString('es-CR');
                const sucursalText = document.getElementById('sucursal')?.options[document.getElementById('sucursal').selectedIndex].text || '';
                
                pickupConfirmation.innerHTML = `
                    <p><strong>Fecha de recogida:</strong> ${formattedDate}</p>
                    <p><strong>Hora de recogida:</strong> ${pickupTime}</p>
                    <p><strong>Sucursal:</strong> ${sucursalText}</p>
                `;
            }
            
            // Show confirmation
            if (orderConfirmation) {
                orderConfirmation.classList.remove('hidden');
                
                // Scroll to confirmation
                orderConfirmation.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Reset cart
            window.cart = [];
            updateCart();
        });
    }

    // Initialize cart
    updateCart();
}

// Setup form behaviors
function setupFormBehaviors() {
    // Set pickup date minimum to today
    const pickupDateInput = document.getElementById('pickup-date');
    if (pickupDateInput) {
        const today = new Date().toISOString().split('T')[0];
        pickupDateInput.setAttribute('min', today);
    }
}

// Function to show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (!notification || !notificationMessage) return;
    
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Function to add items to cart
function addToCart(name, price) {
    if (!window.cart) window.cart = [];
    
    // Check if the product is already in the cart
    const existingItem = window.cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`Añadido otro ${name} al carrito`);
    } else {
        window.cart.push({
            name: name,
            price: price,
            quantity: 1
        });
        showNotification(`${name} añadido al carrito`);
    }
    
    updateCart();
}

// Function to update cart display
function updateCart() {
    if (!window.cart) return;
    
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    if (!cartCount || !cartItems) return;
    
    // Update cart count
    const totalItems = window.cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // If cart is empty, show message and hide summary
    if (totalItems === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
        if (cartSummary) cartSummary.classList.add('hidden');
        return;
    }
    
    // Otherwise, update cart items and show summary
    if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
    if (cartSummary) cartSummary.classList.remove('hidden');
    
    // Clear existing items
    cartItems.innerHTML = '';
    
    // Add each item to the cart
    window.cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item flex justify-between items-center';
        
        const totalPrice = item.price * item.quantity;
        
        itemElement.innerHTML = `
            <div>
                <h4 class="font-bold">${item.name}</h4>
                <p class="text-gray-600">₡${item.price.toLocaleString()} x ${item.quantity}</p>
            </div>
            <div class="flex items-center">
                <span class="font-bold mr-4">₡${totalPrice.toLocaleString()}</span>
                <div class="flex items-center">
                    <button class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300" onclick="decreaseQuantity(${index})">
                        <i class="fas fa-minus text-gray-600"></i>
                    </button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300" onclick="increaseQuantity(${index})">
                        <i class="fas fa-plus text-gray-600"></i>
                    </button>
                </div>
                <button class="ml-3 text-red-500 hover:text-red-700" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(itemElement);
    });
    
    // Update totals
    const subtotal = document.getElementById('subtotal');
    const tax = document.getElementById('tax');
    const total = document.getElementById('total');
    
    if (subtotal && tax && total) {
        const subtotalValue = window.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const taxValue = subtotalValue * 0.13;
        const totalValue = subtotalValue + taxValue;
        
        subtotal.textContent = `₡${subtotalValue.toLocaleString()}`;
        tax.textContent = `₡${taxValue.toLocaleString()}`;
        total.textContent = `₡${totalValue.toLocaleString()}`;
    }
}

// Increase quantity of an item
function increaseQuantity(index) {
    if (!window.cart) return;
    window.cart[index].quantity += 1;
    updateCart();
}

// Decrease quantity of an item
function decreaseQuantity(index) {
    if (!window.cart) return;
    
    if (window.cart[index].quantity > 1) {
        window.cart[index].quantity -= 1;
        updateCart();
    } else {
        removeItem(index);
    }
}

// Remove an item from the cart
function removeItem(index) {
    if (!window.cart) return;
    
    const itemName = window.cart[index].name;
    window.cart.splice(index, 1);
    updateCart();
    showNotification(`${itemName} eliminado del carrito`);
}
