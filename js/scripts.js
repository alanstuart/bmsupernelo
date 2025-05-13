// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let lastScrollTop = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateCartDisplay();
    setMinDate();
    checkSucursal();
    handleHeaderScroll();
});

// Handle header scroll
function handleHeaderScroll() {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('header');
        
        if (currentScroll > lastScrollTop && currentScroll > 200) {
            header.classList.add('nav-up');
        } else {
            header.classList.remove('nav-up');
        }
        lastScrollTop = currentScroll;
    });
}

// Check sucursal on load
function checkSucursal() {
    const selectedSucursal = localStorage.getItem('selectedSucursal');
    const sucursalModal = document.getElementById('sucursalModal');
    const sucursalActual = document.getElementById('sucursalActual');
    
    if (!selectedSucursal) {
        sucursalModal.style.display = 'flex';
    } else {
        sucursalActual.textContent = selectedSucursal;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sucursal selection
    document.getElementById('sucursalBtn').addEventListener('click', () => {
        document.getElementById('sucursalModal').style.display = 'flex';
    });

    // Cart button
    document.getElementById('cartBtn').addEventListener('click', () => {
        document.getElementById('cartModal').style.display = 'flex';
    });

    // Close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Close modals on outside click
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Setup product type selectors
    document.querySelectorAll('.tipo-compra').forEach(select => {
        select.addEventListener('change', (e) => {
            const card = e.target.closest('.producto-card');
            const cantidadInput = card.querySelector('.input-cantidad');
            const montoInput = card.querySelector('.input-monto');
            
            if (e.target.value === 'peso') {
                cantidadInput.style.display = 'flex';
                montoInput.style.display = 'none';
            } else {
                cantidadInput.style.display = 'none';
                montoInput.style.display = 'flex';
            }
        });
    });

    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.producto-card');
            const product = {
                id: button.dataset.id,
                name: button.dataset.nombre,
                price: parseFloat(button.dataset.precio),
                unit: button.dataset.unidad,
                quantity: parseFloat(card.querySelector('.cantidad-input').value),
                image: card.querySelector('.producto-img').src
            };
            addToCart(product);
        });
    });

    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.classList[1];
            const productName = btn.closest('.producto-card').querySelector('h3').textContent;
            shareProduct(platform, productName);
        });
    });
}

// Cart functions
function addToCart(product) {
    if (!localStorage.getItem('selectedSucursal')) {
        showNotification('Por favor seleccione una sucursal');
        document.getElementById('sucursalModal').style.display = 'flex';
        return;
    }

    if (product.quantity <= 0) {
        showNotification('Por favor ingrese una cantidad válida');
        return;
    }

    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += product.quantity;
        existingProduct.amount = existingProduct.quantity * existingProduct.price;
    } else {
        cart.push({
            ...product,
            amount: product.quantity * product.price
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Producto agregado al carrito');
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartTotal = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');

    // Update cart count
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0).toFixed(1);

    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'flex';
        btnCheckout.disabled = true;
        cartTotal.textContent = '₡0';
        return;
    }

    cartItems.style.display = 'block';
    cartEmpty.style.display = 'none';
    btnCheckout.disabled = false;

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₡${item.price.toLocaleString()} / ${item.unit}</p>
            </div>
            <div class="item-actions">
                <div class="quantity-control">
                    <button onclick="updateQuantity(${index}, ${(item.quantity - 0.1).toFixed(1)})">-</button>
                    <input type="number" value="${item.quantity}" min="0.1" step="0.1" 
                           onchange="updateQuantity(${index}, this.value)">
                    <button onclick="updateQuantity(${index}, ${(item.quantity + 0.1).toFixed(1)})">+</button>
                </div>
                <div class="item-price">₡${Math.round(item.amount).toLocaleString()}</div>
                <button class="btn-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    cartTotal.textContent = `₡${Math.round(cart.reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}`;
}

function updateQuantity(index, quantity) {
    quantity = parseFloat(quantity);
    if (quantity <= 0) {
        removeFromCart(index);
        return;
    }

    cart[index].quantity = quantity;
    cart[index].amount = quantity * cart[index].price;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Producto eliminado del carrito');
}

// Checkout functions
function showCheckoutForm() {
    document.getElementById('cartModal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'flex';
}

function processOrder(event) {
    event.preventDefault();

    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        showNotification('Por favor complete todos los campos requeridos');
        return;
    }

    const order = {
        customer: {
            name: document.getElementById('nombreCompleto').value,
            phone: document.getElementById('telefono').value
        },
        pickup: {
            store: localStorage.getItem('selectedSucursal'),
            date: document.getElementById('fechaRecogida').value,
            time: document.getElementById('horaRecogida').value,
            notes: document.getElementById('notasAdicionales').value
        },
        items: cart,
        total: cart.reduce((sum, item) => sum + item.amount, 0)
    };

    showOrderConfirmation(order);
}

function showOrderConfirmation(order) {
    document.getElementById('checkoutModal').style.display = 'none';
    
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = order.items.map(item => `
        <div class="order-item">
            <span>${item.name}</span>
            <span>${item.quantity} ${item.unit}</span>
            <span>₡${Math.round(item.amount).toLocaleString()}</span>
        </div>
    `).join('');

    document.getElementById('orderTotal').textContent = 
        `₡${Math.round(order.total).toLocaleString()}`;

    document.getElementById('confirmationModal').style.display = 'flex';
}

function finishOrder() {
    cart = [];
    localStorage.removeItem('cart');
    document.getElementById('confirmationModal').style.display = 'none';
    updateCartDisplay();
    window.scrollTo(0, 0);
}

// Utility functions
function setMinDate() {
    const fechaRecogida = document.getElementById('fechaRecogida');
    const today = new Date().toISOString().split('T')[0];
    fechaRecogida.min = today;
}

function selectSucursal(sucursal) {
    localStorage.setItem('selectedSucursal', sucursal);
    document.getElementById('sucursalActual').textContent = sucursal;
    document.getElementById('sucursalModal').style.display = 'none';
    showNotification(`Sucursal seleccionada: ${sucursal}`);
}

function shareProduct(platform, productName) {
    const url = window.location.href;
    const text = `¡Mira este producto en BM Super Nelo! ${productName}`;
    
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    };

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}