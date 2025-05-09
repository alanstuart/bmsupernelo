// Esperar a que se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
  // Ocultar preloader cuando la página esté cargada
  window.addEventListener('load', function() {
    document.getElementById('preloader').style.display = 'none';
  });
  
  // Variables globales
  const cartItems = [];
  let cartTotal = 0;
  
  // Inicialización de funciones
  initCategoryButtons();
  initSearchToggle();
  initCartButton();
  initViewMoreButtons();
  initScrollToTopButton();
  initCheckoutFlow();
  initRevealAnimations();
  
  // Cargar carrito guardado si existe
  loadCart();
  
  // Funciones de inicialización
  function initCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-button');
    
    categoryButtons.forEach(button => {
      button.addEventListener('click', function() {
        const category = this.dataset.category;
        
        // Desactiva todos los botones
        categoryButtons.forEach(btn => btn.classList.remove('active', 'bg-azul-bm', 'text-white'));
        categoryButtons.forEach(btn => btn.classList.add('bg-white', 'border-gray-300'));
        
        // Activa el botón actual
        this.classList.add('active', 'bg-azul-bm', 'text-white');
        this.classList.remove('bg-white', 'border-gray-300');
        
        // Filtrar productos
        filterProducts(category);
      });
    });
  }
  
  function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
      if (category === 'all' || product.dataset.category === category) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    });
  }
  
  function initSearchToggle() {
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    searchToggle.addEventListener('click', function() {
      searchBar.classList.toggle('hidden');
      if (!searchBar.classList.contains('hidden')) {
        searchInput.focus();
      }
    });
    
    searchButton.addEventListener('click', function() {
      const query = searchInput.value.toLowerCase();
      searchProducts(query);
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = searchInput.value.toLowerCase();
        searchProducts(query);
      }
    });
  }
  
  function searchProducts(query) {
    if (!query) return;
    
    const products = document.querySelectorAll('.product-card');
    const categoryButtons = document.querySelectorAll('.category-button');
    
    // Resetear botones de categoría
    categoryButtons.forEach(btn => btn.classList.remove('active', 'bg-azul-bm', 'text-white'));
    categoryButtons.forEach(btn => btn.classList.add('bg-white', 'border-gray-300'));
    document.querySelector('[data-category="all"]').classList.add('active', 'bg-azul-bm', 'text-white');
    document.querySelector('[data-category="all"]').classList.remove('bg-white', 'border-gray-300');
    
    // Mostrar todos los productos
    products.forEach(product => {
      const productName = product.querySelector('h3').textContent.toLowerCase();
      const productDesc = product.querySelector('p').textContent.toLowerCase();
      
      if (productName.includes(query) || productDesc.includes(query)) {
        product.style.display = 'block';
        // Resaltar resultado
        product.classList.add('search-result');
        setTimeout(() => {
          product.classList.remove('search-result');
        }, 2000);
      } else {
        product.style.display = 'none';
      }
    });
    
    // Ocultar barra de búsqueda
    document.getElementById('search-bar').classList.add('hidden');
  }
  
  function initCartButton() {
    const cartButton = document.getElementById('cart-button');
    const shoppingCart = document.getElementById('shopping-cart');
    
    cartButton.addEventListener('click', function() {
      // Toggle shopping cart visibility
      if (shoppingCart.classList.contains('hidden')) {
        showCart();
      } else {
        shoppingCart.classList.add('hidden');
      }
    });
  }
  
  function showCart() {
    const shoppingCart = document.getElementById('shopping-cart');
    shoppingCart.classList.remove('hidden');
    
    // Scroll to cart
    shoppingCart.scrollIntoView({ behavior: 'smooth' });
  }
  
  function initViewMoreButtons() {
    // Botones para mostrar más productos de carnicería
    const viewAllCarnes = document.getElementById('view-all-carnes');
    const hideAllCarnes = document.getElementById('hide-all-carnes');
    const moreCarnesProducts = document.getElementById('more-carnes-products');
    
    if (viewAllCarnes && hideAllCarnes && moreCarnesProducts) {
      viewAllCarnes.addEventListener('click', function() {
        moreCarnesProducts.classList.remove('hidden');
        viewAllCarnes.classList.add('hidden');
        hideAllCarnes.classList.remove('hidden');
      });
      
      hideAllCarnes.addEventListener('click', function() {
        moreCarnesProducts.classList.add('hidden');
        hideAllCarnes.classList.add('hidden');
        viewAllCarnes.classList.remove('hidden');
      });
    }
  }
  
  function initScrollToTopButton() {
    const scrollTopBtn = document.getElementById('scroll-to-top');
    
    window.addEventListener('scroll', function() {
      if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });
    
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  function initCheckoutFlow() {
    const proceedToCheckout = document.getElementById('proceed-to-checkout');
    const orderForm = document.getElementById('order-form');
    const checkoutSection = document.getElementById('checkout-section');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const orderConfirmation = document.getElementById('order-confirmation');
    
    // Listeners para la secuencia de checkout
    if (proceedToCheckout) {
      proceedToCheckout.addEventListener('click', function() {
        orderForm.classList.remove('hidden');
        checkoutSection.classList.remove('hidden');
        orderForm.scrollIntoView({ behavior: 'smooth' });
      });
    }
    
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', function() {
        if (validateOrderForm()) {
          placeOrder();
        }
      });
    }
  }
  
  function validateOrderForm() {
    // Obtener campos obligatorios
    const requiredFields = [
      document.getElementById('name'),
      document.getElementById('phone'),
      document.getElementById('sucursal'),
      document.getElementById('pickup-date'),
      document.getElementById('pickup-time'),
      document.getElementById('card-number'),
      document.getElementById('expiry'),
      document.getElementById('cvv'),
      document.getElementById('card-holder')
    ];
    
    let isValid = true;
    
    // Validar cada campo
    requiredFields.forEach(field => {
      if (!field.value) {
        field.classList.add('border-red-500');
        isValid = false;
      } else {
        field.classList.remove('border-red-500');
      }
    });
    
    if (!isValid) {
      showNotification('Por favor complete todos los campos obligatorios');
    }
    
    return isValid;
  }
  
  function placeOrder() {
    const orderForm = document.getElementById('order-form');
    const checkoutSection = document.getElementById('checkout-section');
    const shoppingCart = document.getElementById('shopping-cart');
    const orderConfirmation = document.getElementById('order-confirmation');
    const orderNumber = document.getElementById('order-number');
    const pickupConfirmation = document.getElementById('pickup-confirmation');
    
    // Generar número de orden aleatorio
    const orderNum = Math.floor(100000 + Math.random() * 900000);
    orderNumber.textContent = `Número de pedido: #${orderNum}`;
    
    // Mostrar detalles de recogida
    const date = document.getElementById('pickup-date').value;
    const time = document.getElementById('pickup-time').value;
    const sucursal = document.getElementById('sucursal').value === 'lima' ? 'Lima de Cartago' : 'San Rafael de Oreamuno';
    
    pickupConfirmation.innerHTML = `
      <p>Su pedido estará listo para recoger:</p>
      <p class="font-bold">${formatDate(date)} a las ${formatTime(time)}</p>
      <p>Sucursal: ${sucursal}</p>
    `;
    
    // Ocultar secciones anteriores y mostrar confirmación
    orderForm.classList.add('hidden');
    checkoutSection.classList.add('hidden');
    shoppingCart.classList.add('hidden');
    orderConfirmation.classList.remove('hidden');
    orderConfirmation.scrollIntoView({ behavior: 'smooth' });
    
    // Limpiar carrito
    clearCart();
  }
  
  function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', options);
  }
  
  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return `${hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  }
  
  // Función para agregar al carrito
  window.addToCart = function(productName, price) {
    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(item => item.name === productName);
    
    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity++;
      cartItems[existingItemIndex].total = cartItems[existingItemIndex].quantity * cartItems[existingItemIndex].price;
    } else {
      cartItems.push({
        name: productName,
        price: price,
        quantity: 1,
        total: price
      });
    }
    
    // Actualizar contador y mostrar notificación
    updateCartCount();
    showNotification(`${productName} agregado al carrito`);
    
    // Guardar carrito en localStorage
    saveCart();
  };
  
  // Funciones para manipular el carrito
  function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    
    if (cartCount) {
      let totalItems = 0;
      cartItems.forEach(item => {
        totalItems += item.quantity;
      });
      
      cartCount.textContent = totalItems;
      
      // Animar el contador
      cartCount.classList.add('animate__animated', 'animate__pulse');
      setTimeout(() => {
        cartCount.classList.remove('animate__animated', 'animate__pulse');
      }, 500);
    }
  }
  
  function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    
    if (cartItemsContainer) {
      // Limpiar contenedor
      cartItemsContainer.innerHTML = '';
      
      if (cartItems.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartSummary.classList.add('hidden');
        return;
      } else {
        emptyCartMessage.classList.add('hidden');
        cartSummary.classList.remove('hidden');
      }
      
      // Crear elementos para cada producto
      cartItems.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item flex justify-between items-center';
        cartItem.innerHTML = `
          <div>
            <h4 class="font-medium">${item.name}</h4>
            <div class="flex items-center mt-1">
              <button class="decrease-quantity px-2 bg-gray-200 rounded-l" data-index="${index}">-</button>
              <span class="px-3 border-t border-b">${item.quantity}</span>
              <button class="increase-quantity px-2 bg-gray-200 rounded-r" data-index="${index}">+</button>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium">₡${formatNumber(item.total)}</p>
            <button class="remove-item text-sm text-red-500 hover:text-red-700" data-index="${index}">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
      });
      
      // Agregar event listeners a los botones
      document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
          decreaseQuantity(parseInt(this.dataset.index));
        });
      });
      
      document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
          increaseQuantity(parseInt(this.dataset.index));
        });
      });
      
      document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
          removeCartItem(parseInt(this.dataset.index));
        });
      });
      
      // Actualizar resumen del carrito
      updateCartSummary();
    }
  }
  
  function decreaseQuantity(index) {
    if (cartItems[index].quantity > 1) {
      cartItems[index].quantity--;
      cartItems[index].total = cartItems[index].quantity * cartItems[index].price;
    } else {
      cartItems.splice(index, 1);
    }
    
    updateCartDisplay();
    updateCartCount();
    saveCart();
  }
  
  function increaseQuantity(index) {
    cartItems[index].quantity++;
    cartItems[index].total = cartItems[index].quantity * cartItems[index].price;
    
    updateCartDisplay();
    updateCartCount();
    saveCart();
  }
  
  function removeCartItem(index) {
    cartItems.splice(index, 1);
    
    updateCartDisplay();
    updateCartCount();
    saveCart();
  }
  
  function updateCartSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    // Calcular subtotal
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += item.total;
    });
    
    // Calcular impuestos
    const tax = subtotal * 0.13;
    
    // Calcular total
    const total = subtotal + tax;
    
    // Actualizar elementos
    if (subtotalElement) subtotalElement.textContent = `₡${formatNumber(subtotal)}`;
    if (taxElement) taxElement.textContent = `₡${formatNumber(tax)}`;
    if (totalElement) totalElement.textContent = `₡${formatNumber(total)}`;
    
    // Guardar total para analytics
    cartTotal = total;
  }
  
  function clearCart() {
    cartItems.length = 0;
    updateCartCount();
    updateCartDisplay();
    
    // Limpiar localStorage
    localStorage.removeItem('bmSuperNeloCart');
  }
  
  function saveCart() {
    localStorage.setItem('bmSuperNeloCart', JSON.stringify({
      items: cartItems,
      updatedAt: new Date().toISOString()
    }));
    
    updateCartDisplay();
  }
  
  function loadCart() {
    const savedCart = localStorage.getItem('bmSuperNeloCart');
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        
        // Verificar si el carrito tiene menos de 1 día
        const cartDate = new Date(parsedCart.updatedAt);
        const now = new Date();
        const daysDiff = (now - cartDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 1 && parsedCart.items && parsedCart.items.length) {
          cartItems.push(...parsedCart.items);
          updateCartCount();
          updateCartDisplay();
        } else {
          // Si el carrito es viejo, eliminarlo
          localStorage.removeItem('bmSuperNeloCart');
        }
      } catch (e) {
        console.error('Error al cargar el carrito:', e);
        localStorage.removeItem('bmSuperNeloCart');
      }
    }
  }
  
  // Funciones de utilidad
  function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
      notificationMessage.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
  }
  
  function formatNumber(number) {
    return Math.round(number).toLocaleString('es-CR');
  }
  
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, {
      threshold: 0.1
    });
    
    reveals.forEach(reveal => {
      revealObserver.observe(reveal);
    });
  }
});
