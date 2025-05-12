// Initialize Supabase Client
const supabase = supabase.createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
);

// DOM Elements
const ordersGrid = document.getElementById('ordersGrid');
const storeFilter = document.getElementById('storeFilter');
const orderStatus = document.getElementById('orderStatus');
const dateFilter = document.getElementById('dateFilter');
const orderModal = document.getElementById('orderModal');
const orderDetails = document.getElementById('orderDetails');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadOrders();
    setupEventListeners();
});

// Authentication Check
async function checkAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        window.location.href = '/login.html';
        return;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            switchSection(section);
        });
    });

    // Filters
    storeFilter.addEventListener('change', loadOrders);
    orderStatus.addEventListener('change', loadOrders);
    dateFilter.addEventListener('change', loadOrders);

    // Modal Close
    document.querySelector('.close').addEventListener('click', () => {
        orderModal.style.display = 'none';
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', handleLogout);
}

// Switch Dashboard Sections
function switchSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(`${sectionId}Section`).classList.add('active');
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

// Load Orders
async function loadOrders() {
    try {
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (storeFilter.value !== 'all') {
            query = query.eq('pickup_info->>store', storeFilter.value);
        }
        if (orderStatus.value !== 'all') {
            query = query.eq('status', orderStatus.value);
        }
        if (dateFilter.value) {
            query = query.gte('created_at', `${dateFilter.value}T00:00:00`)
                        .lte('created_at', `${dateFilter.value}T23:59:59`);
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Error al cargar los pedidos', 'error');
    }
}

// Display Orders
function displayOrders(orders) {
    ordersGrid.innerHTML = '';

    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header">
                <span class="order-number">#${order.id.slice(0, 8)}</span>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-info">
                <p><strong>Cliente:</strong> ${order.customer_info.name}</p>
                <p><strong>Sucursal:</strong> ${order.pickup_info.store}</p>
                <p><strong>Fecha de recogida:</strong> ${formatDate(order.pickup_info.date)}</p>
                <p><strong>Total:</strong> ₡${order.total_amount.toLocaleString()}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary" onclick="viewOrderDetails('${order.id}')">
                    Ver detalles
                </button>
                <button class="btn btn-secondary" onclick="updateOrderStatus('${order.id}')">
                    Actualizar estado
                </button>
            </div>
        `;
        ordersGrid.appendChild(card);
    });
}

// View Order Details
async function viewOrderDetails(orderId) {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) throw error;

        orderDetails.innerHTML = `
            <h2>Detalles del Pedido #${order.id.slice(0, 8)}</h2>
            <div class="order-details-content">
                <h3>Información del Cliente</h3>
                <p><strong>Nombre:</strong> ${order.customer_info.name}</p>
                <p><strong>Teléfono:</strong> ${order.customer_info.phone}</p>

                <h3>Información de Recogida</h3>
                <p><strong>Sucursal:</strong> ${order.pickup_info.store}</p>
                <p><strong>Fecha:</strong> ${formatDate(order.pickup_info.date)}</p>
                <p><strong>Hora:</strong> ${order.pickup_info.time}</p>

                <h3>Productos</h3>
                <div class="order-items">
                    ${order.order_items.map(item => `
                        <div class="order-item">
                            <span>${item.name}</span>
                            <span>${item.quantity} ${item.unit}</span>
                            <span>₡${item.amount.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="order-total">
                    <strong>Total:</strong> ₡${order.total_amount.toLocaleString()}
                </div>
            </div>
        `;

        orderModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Error al cargar los detalles del pedido', 'error');
    }
}

// Update Order Status
async function updateOrderStatus(orderId) {
    try {
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        if (fetchError) throw fetchError;

        const newStatus = getNextStatus(order.status);

        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (updateError) throw updateError;

        showNotification('Estado actualizado correctamente');
        loadOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error al actualizar el estado', 'error');
    }
}

// Helper Functions
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'processing': 'En proceso',
        'ready': 'Listo para recoger',
        'completed': 'Completado'
    };
    return statusMap[status] || status;
}

function getNextStatus(currentStatus) {
    const statusFlow = {
        'pending': 'processing',
        'processing': 'ready',
        'ready': 'completed',
        'completed': 'completed'
    };
    return statusFlow[currentStatus] || currentStatus;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Notifications
function showNotification(message, type = 'success') {
    // Implementation will depend on your UI requirements
    alert(message);
}

// Logout Handler
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error during logout:', error);
        showNotification('Error al cerrar sesión', 'error');
    }
}