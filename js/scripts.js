// Esperar a que se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log("Inicialización del sitio BM Super Nelo");
  
  // Variables globales
  window.cartItems = [];
  let cartTotal = 0;
  
  // Ocultar preloader cuando la página esté cargada
  window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.display = 'none';
    }
  });
  
  // Inicialización de funciones
  initSucursalModal();
  initCategoryButtons();
  initSearchToggle();
  initCartButton();
  initViewMoreButtons();
  initScrollToTopButton();
  initCheckoutFlow();
  initRevealAnimations();
  initPurchaseOptions();
  initMobileOptimizations();
  
  // Cargar carrito guardado si existe
  loadCart();
  
  // Inicializar el modal de selección de sucursal
  function initSucursalModal() {
    const sucursalModal = document.getElementById('sucursal-modal');
    const sucursalOptions = document.querySelectorAll('.sucursal-option');
    
    if (!sucursalModal) {
      console.error("Modal de sucursal no encontrado");
      return;
    }
    
    // Verificar si ya se ha seleccionado una sucursal
    const selectedSucursal = localStorage.getItem('selectedSucursal');
    
    if (selectedSucursal) {
      // Si ya hay una sucursal seleccionada, ocultar el modal
      sucursalModal.classList.add('hidden');
    }
    
    // Agregar event listeners a las opciones de sucursal
    sucursalOptions.forEach(option => {
      option.addEventListener('click', function() {
        const sucursal = this.dataset.sucursal;
        
        // Resaltar opción seleccionada
        sucursalOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        
        // Guardar selección en localStorage
        localStorage.setItem('selectedSucursal', sucursal);
        
        // Preseleccionar en el formulario de checkout
        const sucursalSelect = document.getElementById('sucursal');
        if (sucursalSelect) {
          sucursalSelect.value = sucursal;
        }
        
        // Ocultar el modal con animación
        sucursalModal.classList.add('fade-out');
        setTimeout(() => {
          sucursalModal.classList.add('hidden');
        }, 300);
        
        // Mostrar notificación de confirmación
        showNotification(`Ha seleccionado la sucursal de ${sucursal === 'lima' ? 'Lima de Cartago' : 'San Rafael'}`);
      });
    });
  }
  
  // Inicialización de las opciones de compra
  function initPurchaseOptions() {
    // Cambio entre pestañas de peso y monto
    document.querySelectorAll('.purchase-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        // Obtener el contenedor padre
        const optionsContainer = this.closest('.purchase-options');
        if (!optionsContainer) return;
        
        // Desactivar todas las pestañas
        optionsContainer.querySelectorAll('.purchase-tab').forEach(t => {
          t.classList.remove('active');
        });
        
        // Activar esta pestaña
        this.classList.add('active');
        
        // Ocultar todas las opciones
        optionsContainer.querySelectorAll('.purchase-option').forEach(option => {
          option.classList.add('hidden');
          option.classList.remove('active');
        });
        
        // Mostrar la opción correspondiente
        const targetOption = this.dataset.tab;
        const targetElement = optionsContainer.querySelector(`.purchase-option[data-option="${targetOption}"]`);
        if (targetElement) {
          targetElement.classList.remove('hidden');
          targetElement.classList.add('active');
          
          // Si es por monto, actualizar la vista previa de peso
          if (targetOption === 'amount') {
            const amountInput = targetElement.querySelector('.product-amount');
            if (amountInput) {
              updateWeightPreview(amountInput);
            }
          }
        }
      });
    });
    
    // Event listeners para inputs de monto
    document.querySelectorAll('.product-amount').forEach(input => {
      input.addEventListener('input', function() {
        updateWeightPreview(this);
      });
    });
  }

  // Actualizar la vista previa del peso basado en el monto
  function updateWeightPreview(inputElement) {
    const productCard = inputElement.closest('.product-card');
    if (!productCard) return;
    
    const pricePerKg = parseFloat(productCard.dataset.price);
    if (!pricePerKg) return;
    
    let amount = parseFloat(inputElement.value) || 0;
    
    // Aplicar límites
    if (amount < 500) amount = 500;
    if (amount > 15000) amount = 15000;
    
    // Calcular el peso correspondiente
    const weight = amount / pricePerKg;
    
    // Formatear el peso para mostrar
    const formattedWeight = weight.toFixed(2);
    
    // Actualizar la vista previa
    const weightPreview = inputElement.closest('.purchase-option').querySelector('.weight-preview span');
    if (weightPreview) {
      weightPreview.textContent = `${formattedWeight} kg`;
    }
  }

  // Función para agregar al carrito por peso
  window.addToCartByWeight = function(productName, pricePerKg, buttonElement) {
    const productCard = buttonElement.closest('.product-card');
    if (!productCard) return;
    
    const weightInput = productCard.querySelector('.product-qty');
    if (!weightInput) return;
    
    const weight = parseFloat(weightInput.value) || 1;
    
    // Calcular precio total
    const totalPrice = weight * pricePerKg;
    
    // Agregar al carrito con información de peso
    addToCartWithDetails(productName, totalPrice, {
      pricePerKg: pricePerKg,
      weight: weight,
      unit: 'kg'
    });
  };

  // Función para agregar al carrito por monto
  window.addToCartByAmount = function(productName, pricePerKg, buttonElement) {
    const productCard = buttonElement.closest('.product-card');
    if (!productCard) return;
    
    const amountInput = productCard.querySelector('.product-amount');
    if (!amountInput) return;
    
    let amount = parseFloat(amountInput.value) || 1000;
    
    // Validar límites
    if (amount < 500) {
      amount = 500;
      amountInput.value = 500;
      showNotification("El monto mínimo de compra es ₡500 por producto");
      return;
    }
    
    if (amount > 15000) {
      amount = 15000;
      amountInput.value = 15000;
      showNotification("El monto máximo de compra es ₡15,000 por producto");
      return;
    }
    
    // Calcular peso correspondiente
    const weight = amount / pricePerKg;
    
    // Agregar al carrito con información de peso y monto
    addToCartWithDetails(productName, amount, {
      pricePerKg: pricePerKg,
      weight: weight.toFixed(2),
      unit: 'kg',
      byAmount: true
    });
  };

  // Función extendida para agregar al carrito con detalles
  function addToCartWithDetails(productName, price, details = {}) {
    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(item => 
      item.name === productName && 
      JSON.stringify(item.details) === JSON.stringify(details)
    );
    
    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity++;
      cartItems[existingItemIndex].total = cartItems[existingItemIndex].quantity * cartItems[existingItemIndex].price;
    } else {
      cartItems.push({
        name: productName,
        price: price,
        quantity: 1,
        total: price,
        details: details
      });
    }
    
    // Actualizar contador y mostrar notificación
    updateCartCount();
    
    // Mensaje personalizado según tipo de compra
    let message = '';
    if (details.byAmount) {
      message = `${productName} (₡${Math.round(price)}, aprox. ${details.weight} kg) agregado`;
    } else if (details.weight) {
      message = `${productName} (${details.weight} ${details.unit}) agregado`;
    } else {
      message = `${productName} agregado al carrito`;
    }
    
    showNotification(message);
    
    // Guardar carrito en localStorage
    saveCart();
  }
  
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
    
    if (!searchToggle || !searchBar || !searchInput || !searchButton) {
      console.error("Elementos de búsqueda no encontrados");
      return;
    }
    
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
    
    const allCategoryButton = document.querySelector('[data-category="all"]');
    if (allCategoryButton) {
      allCategoryButton.classList.add('active', 'bg-azul-bm', 'text-white');
      allCategoryButton.classList.remove('bg-white', 'border-gray-300');
    }
    
    // Mostrar todos los productos
    let foundProducts = 0;
    products.forEach(product => {
      const productName = product.querySelector('h3')?.textContent.toLowerCase() || '';
      const productDesc = product.querySelector('p')?.textContent.toLowerCase() || '';
      
      if (productName.includes(query) || productDesc.includes(query)) {
        product.style.display = 'block';
        // Resaltar resultado
        product.classList.add('search-result');
        setTimeout(() => {
          product.classList.remove('search-result');
        }, 2000);
        foundProducts++;
      } else {
        product.style.display = 'none';
      }
    });
    
    // Mostrar mensaje si no hay resultados
    if (foundProducts === 0) {
      showNotification("No se encontraron productos que coincidan con su búsqueda");
    }
    
    // Ocultar barra de búsqueda
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
      searchBar.classList.add('hidden');
    }
  }
  
  function initCartButton() {
    const cartButton = document.getElementById('cart-button');
    
    if (!cartButton) {
      console.error("Botón de carrito no encontrado");
      return;
    }
    
    cartButton.addEventListener('click', function() {
      const shoppingCart = document.getElementById('shopping-cart');
      
      if (!shoppingCart) {
        console.error("Elemento shopping-cart no encontrado");
        return;
      }
      
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
    
    if (!shoppingCart) {
      console.error("Elemento shopping-cart no encontrado");
      return;
    }
    
    // Actualizar el contenido del carrito primero
    updateCartDisplay();
    
    // Luego mostrar el carrito
    shoppingCart.classList.remove('hidden');
    
    // Y finalmente desplazarse hacia el carrito con un pequeño retraso
    setTimeout(() => {
      shoppingCart.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
        
        // Scroll hacia arriba después de ocultar
        const carnesSection = document.getElementById('carnes-section');
        if (carnesSection) {
          carnesSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
  
  function initScrollToTopButton() {
    const scrollTopBtn = document.getElementById('scroll-to-top');
    
    if (!scrollTopBtn) return;
    
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
    
    // Listeners para la secuencia de checkout
    if (proceedToCheckout) {
      proceedToCheckout.addEventListener('click', function() {
        if (!orderForm || !checkoutSection) {
          console.error("Elementos de checkout no encontrados");
          return;
        }
        
        orderForm.classList.remove('hidden');
        checkoutSection.classList.remove('hidden');
        orderForm.scrollIntoView({ behavior: 'smooth' });
        
        // Pre-seleccionar sucursal guardada en localStorage
        const selectedSucursal = localStorage.getItem('selectedSucursal');
        if (selectedSucursal && document.getElementById('sucursal')) {
          document.getElementById('sucursal').value = selectedSucursal;
        }
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
    let firstInvalidField = null;
    
    // Validar cada campo
    requiredFields.forEach(field => {
      if (!field) return;
      
      if (!field.value) {
        field.classList.add('border-red-500');
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      } else {
        field.classList.remove('border-red-500');
      }
    });
    
    if (!isValid) {
      showNotification('Por favor complete todos los campos obligatorios');
      
      // Enfocar el primer campo inválido
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    }
    
    return isValid;
  }
  
  function placeOrder() {
    const orderForm = document.getElementById('order-form');
    const checkoutSection = document.getElementById('checkout-section');
    const shoppingCart = document.getElementById('shopping-cart');
    const orderConfirmation = document.getElementById('order-confirmation');
    
    if (!orderForm || !checkoutSection || !shoppingCart || !orderConfirmation) {
      console.error("Elementos de checkout no encontrados");
      return;
    }
    
    const orderNumber = document.getElementById('order-number');
    const pickupConfirmation = document.getElementById('pickup-confirmation');
    
    // Generar número de orden aleatorio
    const orderNum = Math.floor(100000 + Math.random() * 900000);
    if (orderNumber) {
      orderNumber.textContent = `Número de pedido: #${orderNum}`;
    }
    
    // Mostrar detalles de recogida
    const dateInput = document.getElementById('pickup-date');
    const timeInput = document.getElementById('pickup-time');
    const sucursalSelect = document.getElementById('sucursal');
    
    if (dateInput && timeInput && sucursalSelect && pickupConfirmation) {
      const date = dateInput.value;
      const time = timeInput.value;
      const sucursalValue = sucursalSelect.value;
      const sucursal = sucursalValue === 'lima' ? 'Lima de Cartago' : 'San Rafael de Oreamuno';
      
      pickupConfirmation.innerHTML = `
        <p>Su pedido estará listo para recoger:</p>
        <p class="font-bold">${formatDate(date)} a las ${formatTime(time)}</p>
        <p>Sucursal: ${sucursal}</p>
      `;
    }
    
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
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CR', options);
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return dateString;
    }
  }
  
  function formatTime(timeString) {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      return `${hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    } catch (error) {
      console.error("Error al formatear hora:", error);
      return timeString;
    }
  }
  
  // Funciones para manipular el carrito
  function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    
    if (!cartCount) {
      console.error("Contador del carrito no encontrado");
      return;
    }
    
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
  
  function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItemsContainer || !emptyCartMessage || !cartSummary) {
      console.error("Elementos del carrito no encontrados");
      return;
    }
    
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
      cartItem.className = 'cart-item flex justify-between items-center py-3 border-b border-gray-200';
      
      // Preparar descripción adicional basada en detalles
      let additionalDesc = '';
      if (item.details) {
        if (item.details.byAmount) {
          additionalDesc = `<span class="text-sm text-gray-500">(aprox. ${item.details.weight} kg)</span>`;
        } else if (item.details.weight) {
          additionalDesc = `<span class="text-sm text-gray-500">(${item.details.weight} ${item.details.unit})</span>`;
        }
      }
      
      cartItem.innerHTML = `
        <div>
          <h4 class="font-medium">${item.name} ${additionalDesc}</h4>
          <div class="flex items-center mt-1">
            <button type="button" class="decrease-quantity px-2 bg-gray-200 rounded-l hover:bg-gray-300" onclick="decreaseQuantity(${index})">-</button>
            <span class="px-3 bg-white border-t border-b">${item.quantity}</span>
            <button type="button" class="increase-quantity px-2 bg-gray-200 rounded-r hover:bg-gray-300" onclick="increaseQuantity(${index})">+</button>
          </div>
        </div>
        <div class="text-right">
          <p class="font-medium">₡${formatNumber(item.total)}</p>
          <button type="button" class="remove-item text-sm text-red-500 hover:text-red-700" onclick="removeCartItem(${index})">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      `;
      
      cartItemsContainer.appendChild(cartItem);
    });
    
    // Actualizar resumen del carrito
    updateCartSummary();
  }
  
  // Estas funciones deben ser globales para que funcionen con onclick en el HTML
  window.decreaseQuantity = function(index) {
    console.log("Disminuyendo cantidad para item:", index);
    
    if (cartItems[index].quantity > 1) {
      cartItems[index].quantity--;
      cartItems[index].total = cartItems[index].quantity * cartItems[index].price;
    } else {
      cartItems.splice(index, 1);
    }
    
    updateCartDisplay();
    updateCartCount();
    saveCart();
  };

  window.increaseQuantity = function(index) {
    console.log("Aumentando cantidad para item:", index);
    
    cartItems[index].quantity++;
    cartItems[index].total = cartItems[index].quantity * cartItems[index].price;
    
    updateCartDisplay();
    updateCartCount();
    saveCart();
  };

  window.removeCartItem = function(index) {
    console.log("Eliminando item:", index);
    
    cartItems.splice(index, 1);
    
    updateCartDisplay();
    updateCartCount();
    saveCart();
  };
  
  window.clearCart = function() {
    console.log("Vaciando carrito");
    
    cartItems.length = 0;
    updateCartCount();
    updateCartDisplay();
    
    // Limpiar localStorage
    localStorage.removeItem('bmSuperNeloCart');
    
    showNotification("Carrito vaciado correctamente");
  };
  
  function updateCartSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement || !taxElement || !totalElement) {
      console.error("Elementos de resumen del carrito no encontrados");
      return;
    }
    
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
    subtotalElement.textContent = `₡${formatNumber(subtotal)}`;
    taxElement.textContent = `₡${formatNumber(tax)}`;
    totalElement.textContent = `₡${formatNumber(total)}`;
    
    // Guardar total para analytics
    cartTotal = total;
  }
  
  function saveCart() {
    console.log("Guardando carrito:", cartItems.length, "items");
    
    localStorage.setItem('bmSuperNeloCart', JSON.stringify({
      items: cartItems,
      updatedAt: new Date().toISOString()
    }));
  }
  
  function loadCart() {
    const savedCart = localStorage.getItem('bmSuperNeloCart');
    console.log("Intentando cargar carrito desde localStorage:", savedCart ? "Encontrado" : "No encontrado");
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        
        // Verificar si el carrito tiene menos de 1 día
        const cartDate = new Date(parsedCart.updatedAt);
        const now = new Date();
        const daysDiff = (now - cartDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 1 && parsedCart.items && parsedCart.items.length) {
          // Vaciar carrito actual
          cartItems.length = 0;
          
          // Cargar items guardados
          cartItems.push(...parsedCart.items);
          
          // Actualizar interfaz
          console.log("Carrito cargado con", cartItems.length, "items");
          updateCartCount();
        } else {
          console.log("Carrito expirado o vacío");
          localStorage.removeItem('bmSuperNeloCart');
        }
      } catch (e) {
        console.error('Error al cargar el carrito:', e);
        localStorage.removeItem('bmSuperNeloCart');
      }
    }
  }
  
  // Optimizaciones para versión móvil
  function initMobileOptimizations() {
    // Ajuste para navegación de categorías en móvil
    const categoryNav = document.querySelector('.category-nav');
    if (categoryNav && window.innerWidth < 768) {
      categoryNav.scrollLeft = 0;
      
      // Desplazar automáticamente para mostrar la categoría activa
      const activeButton = categoryNav.querySelector('.category-button.active');
      if (activeButton) {
        const navRect = categoryNav.getBoundingClientRect();
        const activeRect = activeButton.getBoundingClientRect();
        const scrollPos = activeRect.left - navRect.left - (navRect.width / 2) + (activeRect.width / 2);
        categoryNav.scrollLeft = scrollPos;
      }
    }
    
    // Ajustes para las pestañas de compra en móvil
    document.querySelectorAll('.purchase-tab').forEach(tab => {
      if (window.innerWidth < 640) {
        tab.classList.add('text-xs', 'px-2', 'py-1');
      }
    });
    
    // Mejor manejo de toques en móvil
    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('touchstart', function() {
        this.classList.add('active-touch');
      });
      
      button.addEventListener('touchend', function() {
        this.classList.remove('active-touch');
      });
    });
  }
  
    // Funciones de utilidad
  function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (!notification || !notificationMessage) {
      console.error("Elementos de notificación no encontrados");
      return;
    }
    
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    // Asegurarse de que la notificación sea visible en móvil
    if (window.innerWidth <= 768) {
      notification.style.right = '10px';
      notification.style.left = '10px';
      notification.style.width = 'calc(100% - 20px)';
      notification.style.textAlign = 'center';
    }
    
    // Ocultar la notificación después de un tiempo
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  function formatNumber(number) {
    try {
      return Math.round(number).toLocaleString('es-CR');
    } catch (error) {
      console.error("Error al formatear número:", error);
      return number.toString();
    }
  }
  
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    if (!('IntersectionObserver' in window)) {
      // Fallback para navegadores antiguos
      reveals.forEach(reveal => reveal.classList.add('active'));
      return;
    }
    
    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px 50px 0px'
    });
    
    reveals.forEach(reveal => {
      revealObserver.observe(reveal);
    });
  }
  
  // Funciones adicionales para mejorar la experiencia móvil
  window.addEventListener('resize', function() {
    // Ajuste para la navegación de categorías en tiempo real
    const categoryNav = document.querySelector('.category-nav');
    if (categoryNav && window.innerWidth < 768) {
      const activeButton = categoryNav.querySelector('.category-button.active');
      if (activeButton) {
        const navRect = categoryNav.getBoundingClientRect();
        const activeRect = activeButton.getBoundingClientRect();
        const scrollPos = activeRect.left - navRect.left - (navRect.width / 2) + (activeRect.width / 2);
        categoryNav.scrollLeft = scrollPos;
      }
    }
    
    // Ajustar tamaño de elementos en móvil
    if (window.innerWidth <= 640) {
      document.querySelectorAll('.product-card').forEach(card => {
        card.classList.add('mobile-card');
      });
    } else {
      document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('mobile-card');
      });
    }
  });
  
  // Detección de desconexión
  window.addEventListener('offline', function() {
    showNotification("Sin conexión a internet. Algunas funciones pueden no estar disponibles.");
  });
  
  window.addEventListener('online', function() {
    showNotification("Conexión a internet restablecida.");
  });
  
  // Función para verificar la salud del carrito (puede llamarse periódicamente)
  function checkCartHealth() {
    if (cartItems && Array.isArray(cartItems)) {
      // Verificar si hay elementos con propiedades inválidas
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        if (!item || typeof item !== 'object' || !item.name || isNaN(parseFloat(item.price))) {
          console.warn("Elemento de carrito inválido detectado en posición", i, "- Eliminando");
          cartItems.splice(i, 1);
          i--;
        }
      }
      
      // Guardar el carrito limpio
      saveCart();
    } else {
      console.error("El carrito no es un array válido - Inicializando");
      window.cartItems = [];
    }
  }
  
  // Ejecutar verificación inicial
  checkCartHealth();
  
  // Agregar un botón para vaciar el carrito en la interfaz
  function addClearCartButton() {
    const cartSummary = document.getElementById('cart-summary');
    if (!cartSummary) return;
    
    const clearCartButton = document.createElement('div');
    clearCartButton.className = 'mt-4 text-center';
    clearCartButton.innerHTML = `
      <button type="button" onclick="clearCart()" class="text-red-500 hover:text-red-700 text-sm transition-colors">
        <i class="fas fa-trash mr-1"></i> Vaciar carrito
      </button>
    `;
    
    // Verificar si ya existe el botón
    const existingButton = document.querySelector('[onclick="clearCart()"]');
    if (!existingButton) {
      cartSummary.appendChild(clearCartButton);
    }
  }
  
  // Ejecutar una vez cargado el DOM
  setTimeout(addClearCartButton, 1000);
  
  // Función para cargar dinámicamente recursos de CSS para mejorar el rendimiento
  function loadOptimizedResources() {
    // Cargar Animate.css para animaciones solo si es necesario
    if (document.querySelectorAll('.animate__animated').length > 0) {
      const animateCss = document.createElement('link');
      animateCss.rel = 'stylesheet';
      animateCss.href = 'https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css';
      document.head.appendChild(animateCss);
    }
    
    // Agregar polyfill para IntersectionObserver para navegadores antiguos
    if (!('IntersectionObserver' in window)) {
      const polyfillScript = document.createElement('script');
      polyfillScript.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
      document.head.appendChild(polyfillScript);
    }
  }
  
  // Cargar recursos optimizados después de que la página principal esté lista
  window.addEventListener('load', loadOptimizedResources);
  
  // Mejorar experiencia táctil para dispositivos móviles
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    document.body.classList.add('touch-device');
    
    // Hacer los botones de categoría más grandes en móvil
    document.querySelectorAll('.category-button').forEach(button => {
      button.classList.add('py-2');
    });
    
    // Mejorar los campos de formulario en móvil
    document.querySelectorAll('input, select, textarea').forEach(input => {
      input.classList.add('mobile-input');
    });
  }
  
  // Compatibilidad con PWA si se implementa en el futuro
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      // Si se implementa un service worker, descomentar esto
      // navigator.serviceWorker.register('/service-worker.js');
    });
  }
  
  // Función para debug del carrito (útil en desarrollo)
  window.debugCart = function() {
    console.log("Estado actual del carrito:", cartItems);
    console.log("LocalStorage:", localStorage.getItem('bmSuperNeloCart'));
  };
  
  // Mensaje de ayuda para desarrolladores en la consola
  console.log(
    "%c BM Super Nelo - Herramientas de desarrollo", 
    "color: #0752a2; font-size: 16px; font-weight: bold;"
  );
  console.log(
    "%c Use debugCart() para ver el estado del carrito", 
    "color: #4caf50; font-size: 12px;"
  );
});

    
