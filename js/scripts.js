// Global variables
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let lastScrollTop = 0;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateCartDisplay();
  setMinDate();
  checkSucursal();
  handleHeaderScroll();
});

// Handle header scroll
function handleHeaderScroll() {
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScrollTop && currentScroll > 200) {
      header.style.transform = "translateY(-100%)";
    } else {
      header.style.transform = "translateY(0)";
    }
    lastScrollTop = currentScroll;
  });
}

// Check sucursal on load
function checkSucursal() {
  const selectedSucursal = localStorage.getItem("selectedSucursal");
  const sucursalModal = document.getElementById("sucursalModal");
  const sucursalActual = document.getElementById("sucursalActual");
  const mainContent = document.querySelector("main");

  if (!selectedSucursal) {
    sucursalModal.style.display = "flex";
    mainContent.style.filter = "blur(5px)";
    mainContent.style.pointerEvents = "none";
  } else {
    sucursalActual.textContent = selectedSucursal;
    mainContent.style.filter = "none";
    mainContent.style.pointerEvents = "auto";
  }
}

// Setup event listeners
function setupEventListeners() {
  // Prevent closing sucursal modal if no sucursal is selected
  document.querySelectorAll(".close").forEach((button) => {
    button.addEventListener("click", (e) => {
      const modal = button.closest(".modal");
      if (
        modal.id === "sucursalModal" &&
        !localStorage.getItem("selectedSucursal")
      ) {
        e.preventDefault();
        showNotification("Por favor seleccione una sucursal para continuar");
        return;
      }
      modal.style.display = "none";
    });
  });

  // Prevent closing sucursal modal on outside click if no sucursal is selected
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      if (
        event.target.id === "sucursalModal" &&
        !localStorage.getItem("selectedSucursal")
      ) {
        showNotification("Por favor seleccione una sucursal para continuar");
        return;
      }
      event.target.style.display = "none";
    }
  });

  // Sucursal selection
  document.getElementById("sucursalBtn")?.addEventListener("click", () => {
    document.getElementById("sucursalModal").style.display = "flex";
  });

  // Cart button
  document.getElementById("cartBtn")?.addEventListener("click", () => {
    document.getElementById("cartModal").style.display = "flex";
  });

  // Setup product type selectors
  document.querySelectorAll(".tipo-compra").forEach((select) => {
    select.addEventListener("change", (e) => {
      const card = e.target.closest(".producto-card");
      const cantidadInput = card.querySelector(".input-cantidad");
      const montoInput = card.querySelector(".input-monto");

      if (e.target.value === "peso") {
        cantidadInput.style.display = "flex";
        montoInput.style.display = "none";
      } else {
        cantidadInput.style.display = "none";
        montoInput.style.display = "flex";
      }
    });
  });

  // Add to cart buttons
  document.querySelectorAll(".btn-add-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".producto-card");
      const tipoCompra = card.querySelector(".tipo-compra").value;
      let quantity;

      if (tipoCompra === "peso") {
        quantity = parseFloat(card.querySelector(".cantidad-input").value);
      } else {
        const monto = parseFloat(card.querySelector(".monto-input").value);
        const precio = parseFloat(button.dataset.precio);
        quantity = monto / precio;
      }

      // Try to get the product image, use a default if not found
      let productImage = "";
      const imageElement = card.querySelector(".producto-img");
      if (imageElement) {
        productImage = imageElement.src;
      } else {
        // Default image based on product category (meat, chicken, etc.)
        if (button.dataset.nombre.toLowerCase().includes("pollo")) {
          productImage =
            "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg";
        } else if (
          button.dataset.nombre.toLowerCase().includes("cerdo") ||
          button.dataset.nombre.toLowerCase().includes("salchicha") ||
          button.dataset.nombre.toLowerCase().includes("mortadela") ||
          button.dataset.nombre.toLowerCase().includes("jamón")
        ) {
          productImage =
            "https://images.pexels.com/photos/4110276/pexels-photo-4110276.jpeg";
        } else {
          // Default for beef and other products
          productImage =
            "https://images.pexels.com/photos/1927377/pexels-photo-1927377.jpeg";
        }
      }

      const product = {
        id: button.dataset.id,
        name: button.dataset.nombre,
        price: parseFloat(button.dataset.precio),
        unit: button.dataset.unidad,
        quantity: quantity,
        image: productImage,
      };
      addToCart(product);
    });
  });

  // Share buttons
  document.querySelectorAll(".share-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const platform = e.currentTarget.classList[1];
      const productName = btn
        .closest(".producto-card")
        .querySelector("h3").textContent;
      shareProduct(platform, productName);
    });
  });

  // Checkout form
  document
    .getElementById("checkoutForm")
    ?.addEventListener("submit", processOrder);

  // Checkout button in cart modal
  document.getElementById("btnCheckout")?.addEventListener("click", () => {
    const fechaRecogida = document.getElementById("cartFechaRecogida")?.value;
    const horaRecogida = document.getElementById("cartHoraRecogida")?.value;
    const notasAdicionales = document.getElementById("cartNotasAdicionales")?.value.trim();

    if (!fechaRecogida || !horaRecogida) {
      showNotification(
        "Por favor seleccione la fecha y hora de recogida en el carrito.",
      );
      return;
    }

    const cartPickupDetails = {
      date: fechaRecogida,
      time: horaRecogida,
      notes: notasAdicionales,
    };
    localStorage.setItem("cartPickupDetails", JSON.stringify(cartPickupDetails));

    showCheckoutForm(); // Proceed to checkout form
  });
}

// Cart functions
function addToCart(product) {
  if (!localStorage.getItem("selectedSucursal")) {
    showNotification("Por favor seleccione una sucursal");
    document.getElementById("sucursalModal").style.display = "flex";
    return;
  }

  if (product.quantity <= 0) {
    showNotification("Por favor ingrese una cantidad válida");
    return;
  }

  const existingProduct = cart.find((item) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += product.quantity;
    existingProduct.amount = existingProduct.quantity * existingProduct.price;
  } else {
    cart.push({
      ...product,
      amount: product.quantity * product.price,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
  showNotification("Producto agregado al carrito");
}

function updateCartDisplay() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartTotal = document.getElementById("cartTotal");
  const btnCheckout = document.getElementById("btnCheckout");

  if (!cartCount || !cartItems || !cartEmpty || !cartTotal || !btnCheckout)
    return;

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems.toFixed(1);

  if (cart.length === 0) {
    cartItems.style.display = "none";
    cartEmpty.style.display = "flex";
    btnCheckout.disabled = true;
    cartTotal.textContent = "₡0";
    return;
  }

  cartItems.style.display = "block";
  cartEmpty.style.display = "none";
  btnCheckout.disabled = false;

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-item">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₡${item.price.toLocaleString()} / ${item.unit}</p>
            </div>
            <div class="item-actions">
                <div class="quantity-control">
                    <button onclick="updateQuantity(${index}, ${(item.quantity - 0.1).toFixed(1)})">-</button>
                    <input type="number" value="${item.quantity.toFixed(1)}" min="0.1" step="0.1"
                           onchange="updateQuantity(${index}, this.value)">
                    <button onclick="updateQuantity(${index}, ${(item.quantity + 0.1).toFixed(1)})">+</button>
                </div>
                <div class="item-price">₡${Math.round(item.amount).toLocaleString()}</div>
                <button class="btn-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.amount, 0);
  cartTotal.textContent = `₡${Math.round(total).toLocaleString()}`;
}

function updateQuantity(index, quantity) {
  quantity = parseFloat(quantity);
  if (quantity <= 0) {
    removeFromCart(index);
    return;
  }

  cart[index].quantity = quantity;
  cart[index].amount = quantity * cart[index].price;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
}

function removeFromCart(index) {
  const product = cart[index];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
  showNotification(`${product.name} eliminado del carrito`);
}

// Checkout functions
function showCheckoutForm() {
  const fechaRecogida = document.getElementById("cartFechaRecogida")?.value;
  const horaRecogida = document.getElementById("cartHoraRecogida")?.value;
  const notasAdicionales = document.getElementById("cartNotasAdicionales")?.value.trim();

  if (!fechaRecogida || !horaRecogida) {
    showNotification(
      "Por favor seleccione la fecha y hora de recogida en el carrito.",
    );
    // Do not proceed to checkout modal if validation fails
    // Ensure cart modal remains visible or is re-shown if hidden by other logic
    const cartModal = document.getElementById("cartModal");
    if (cartModal.style.display === "none") {
        cartModal.style.display = "flex";
    }
    return;
  }

  const cartPickupDetails = {
    date: fechaRecogida,
    time: horaRecogida,
    notes: notasAdicionales,
  };
  localStorage.setItem("cartPickupDetails", JSON.stringify(cartPickupDetails));

  document.getElementById("cartModal").style.display = "none";
  document.getElementById("checkoutModal").style.display = "flex";
}

function processOrder(event) {
  event.preventDefault();

  const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  // Retrieve pickup details from localStorage
  const cartPickupDetailsString = localStorage.getItem("cartPickupDetails");
  if (!cartPickupDetailsString) {
    // This should ideally not happen if showCheckoutForm validated and stored it
    showNotification("Error: Detalles de recogida no encontrados. Por favor, vuelva al carrito.");
    // Potentially redirect back to cart or handle error appropriately
    document.getElementById("checkoutModal").style.display = "none";
    document.getElementById("cartModal").style.display = "flex";
    return;
  }
  const cartPickupDetails = JSON.parse(cartPickupDetailsString);

  if (!nombreCompleto || !telefono) {
    showNotification("Por favor complete su nombre y teléfono.");
    return;
  }
  // Validation for date and time from cartPickupDetails is already done in showCheckoutForm

  const order = {
    customer: {
      name: nombreCompleto,
      phone: telefono,
    },
    pickup: {
      store: localStorage.getItem("selectedSucursal"),
      date: cartPickupDetails.date,
      time: cartPickupDetails.time,
      notes: cartPickupDetails.notes,
    },
    items: cart,
    total: cart.reduce((sum, item) => sum + item.amount, 0),
  };

  showOrderConfirmation(order);
}

function showOrderConfirmation(order) {
  document.getElementById("checkoutModal").style.display = "none";

  const orderSummary = document.getElementById("orderSummary");
  orderSummary.innerHTML = order.items
    .map(
      (item) => `
        <div class="order-item">
            <span>${item.name}</span>
            <span>${item.quantity.toFixed(1)} ${item.unit}</span>
            <span>₡${Math.round(item.amount).toLocaleString()}</span>
        </div>
    `,
    )
    .join("");

  document.getElementById("orderTotal").textContent =
    `₡${Math.round(order.total).toLocaleString()}`;

  document.getElementById("confirmationModal").style.display = "flex";
}

function finishOrder() {
  cart = [];
  localStorage.removeItem("cart");
  localStorage.removeItem("cartPickupDetails"); // Remove pickup details
  document.getElementById("confirmationModal").style.display = "none";
  updateCartDisplay();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Utility functions
function setMinDate() {
  const fechaRecogida = document.getElementById("fechaRecogida");
  if (fechaRecogida) {
    const today = new Date().toISOString().split("T")[0];
    fechaRecogida.min = today;
  }
  const cartFechaRecogida = document.getElementById("cartFechaRecogida");
  if (cartFechaRecogida) {
    const today = new Date().toISOString().split("T")[0];
    cartFechaRecogida.min = today;
  }
}

function selectSucursal(sucursal) {
  localStorage.setItem("selectedSucursal", sucursal);
  document.getElementById("sucursalActual").textContent = sucursal;
  document.getElementById("sucursalModal").style.display = "none";

  // Remove blur from main content
  const mainContent = document.querySelector("main");
  mainContent.style.filter = "none";
  mainContent.style.pointerEvents = "auto";

  showNotification(`Sucursal seleccionada: ${sucursal}`);
}

function shareProduct(platform, productName) {
  const url = window.location.href;
  const text = `¡Mira este producto en BM Super Nelo! ${productName}`;

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  };

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], "_blank");
  }
}

function showNotification(message) {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.add("show");
  });

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
