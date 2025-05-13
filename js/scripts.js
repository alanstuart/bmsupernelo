// Add to existing code

// Improved cart validation
function validateCartItem(item) {
    if (!item.quantity || item.quantity <= 0) {
        throw new Error('Cantidad inválida');
    }
    if (!item.price || item.price <= 0) {
        throw new Error('Precio inválido');
    }
    return true;
}

// Improved addToCart function
function addToCart(product) {
    try {
        validateCartItem(product);
        
        const selectedSucursal = localStorage.getItem('selectedSucursal');
        if (!selectedSucursal) {
            throw new Error('Por favor seleccione una sucursal');
        }
        
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += product.quantity;
            cart[existingProductIndex].amount = parseFloat((cart[existingProductIndex].quantity * cart[existingProductIndex].price).toFixed(2));
        } else {
            cart.push({
                ...product,
                amount: parseFloat((product.quantity * product.price).toFixed(2))
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification(`${product.name} agregado al carrito`);
    } catch (error) {
        showNotification(error.message);
        if (!localStorage.getItem('selectedSucursal')) {
            document.getElementById('sucursalModal').style.display = 'flex';
        }
    }
}

// Improved checkout validation
function validateCheckoutForm() {
    const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fechaRecogida = document.getElementById('fechaRecogida').value;
    const horaRecogida = document.getElementById('horaRecogida').value;
    
    if (!nombreCompleto || !telefono || !fechaRecogida || !horaRecogida) {
        throw new Error('Por favor complete todos los campos requeridos');
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(nombreCompleto)) {
        throw new Error('Por favor ingrese un nombre válido');
    }
    
    if (!/^\d{8}$/.test(telefono)) {
        throw new Error('Por favor ingrese un número de teléfono válido (8 dígitos)');
    }
    
    const today = new Date();
    const selectedDate = new Date(fechaRecogida);
    if (selectedDate < today) {
        throw new Error('La fecha de recogida no puede ser en el pasado');
    }
    
    return true;
}

// Improved processOrder function
function processOrder(event) {
    event.preventDefault();
    
    try {
        validateCheckoutForm();
        
        const order = {
            customer: {
                name: document.getElementById('nombreCompleto').value.trim(),
                phone: document.getElementById('telefono').value.trim()
            },
            pickup: {
                store: localStorage.getItem('selectedSucursal'),
                date: document.getElementById('fechaRecogida').value,
                time: document.getElementById('horaRecogida').value,
                notes: document.getElementById('notasAdicionales')?.value?.trim() || ''
            },
            products: cart,
            total: parseFloat(cart.reduce((sum, item) => sum + item.amount, 0).toFixed(2))
        };
        
        showOrderConfirmation(order);
    } catch (error) {
        showNotification(error.message);
    }
}

// Improved share functionality
function shareProduct(platform, productName) {
    const url = window.location.href;
    const text = `¡Mira este producto en BM Super Nelo! ${productName}`;
    
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}