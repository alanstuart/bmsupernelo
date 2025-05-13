// Add these new functions at the end of the file

function showCheckoutForm() {
    // Hide cart modal
    document.getElementById('cartModal').style.display = 'none';
    
    // Show checkout modal
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.style.display = 'flex';
    
    // Set minimum date for pickup
    const fechaRecogida = document.getElementById('fechaRecogida');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    
    fechaRecogida.min = `${yyyy}-${mm}-${dd}`;
    fechaRecogida.value = `${yyyy}-${mm}-${dd}`;
}

function processOrder(event) {
    event.preventDefault();
    
    // Get form values
    const nombreCompleto = document.getElementById('nombreCompleto').value;
    const telefono = document.getElementById('telefono').value;
    const fechaRecogida = document.getElementById('fechaRecogida').value;
    const horaRecogida = document.getElementById('horaRecogida').value;
    const notasAdicionales = document.getElementById('notasAdicionales').value;
    const sucursal = localStorage.getItem('selectedSucursal');
    
    // Validate form
    if (!nombreCompleto || !telefono || !fechaRecogida || !horaRecogida) {
        showNotification('Por favor complete todos los campos requeridos');
        return;
    }
    
    // Create order object
    const order = {
        customer: {
            name: nombreCompleto,
            phone: telefono
        },
        pickup: {
            date: fechaRecogida,
            time: horaRecogida,
            store: sucursal,
            notes: notasAdicionales
        },
        products: cart,
        total: cart.reduce((sum, item) => sum + item.amount, 0)
    };
    
    // Process order
    processOrderWithSupabase(order);
}

async function processOrderWithSupabase(order) {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-order`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order })
        });

        if (!response.ok) {
            throw new Error('Error al procesar el pedido');
        }

        // Show confirmation
        showOrderConfirmation(order);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al procesar el pedido. Por favor intente nuevamente.');
    }
}

function showOrderConfirmation(order) {
    // Hide checkout modal
    document.getElementById('checkoutModal').style.display = 'none';
    
    // Update confirmation modal content
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    
    // Clear previous content
    orderSummary.innerHTML = '';
    
    // Add products
    order.products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <span>${product.name}</span>
            <span>${product.quantity} ${product.unit}</span>
            <span>₡${product.amount.toLocaleString()}</span>
        `;
        orderSummary.appendChild(item);
    });
    
    // Add pickup info
    const pickupInfo = document.createElement('div');
    pickupInfo.className = 'pickup-info';
    pickupInfo.innerHTML = `
        <p><strong>Fecha de recogida:</strong> ${formatDate(order.pickup.date)}</p>
        <p><strong>Hora:</strong> ${order.pickup.time}</p>
        <p><strong>Sucursal:</strong> ${order.pickup.store}</p>
    `;
    orderSummary.appendChild(pickupInfo);
    
    // Update total
    orderTotal.textContent = `₡${order.total.toLocaleString()}`;
    
    // Show confirmation modal
    document.getElementById('confirmationModal').style.display = 'flex';
}

function finishOrder() {
    // Clear cart
    cart = [];
    localStorage.removeItem('cart');
    
    // Hide confirmation modal
    document.getElementById('confirmationModal').style.display = 'none';
    
    // Reset cart display
    updateCartDisplay();
    
    // Show success message
    showNotification('¡Gracias por tu compra!');
    
    // Reload page
    window.location.reload();
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CR', options);
}