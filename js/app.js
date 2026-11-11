// --- ESTADO DE LA APLICACIÓN ---
let cart = JSON.parse(localStorage.getItem('mirkis_cart')) || [];
let shippingCost = 0;

// --- ELEMENTOS DOM ---
const productsGrid = document.getElementById('productsGrid');
const cartDrawer = document.getElementById('cartDrawer');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const overlay = document.getElementById('overlay');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotalAmount = document.getElementById('cartSubtotalAmount');
const cartShippingAmount = document.getElementById('cartShippingAmount');
const cartTotalAmount = document.getElementById('cartTotalAmount');
const shippingRow = document.getElementById('shippingRow');
const shippingForm = document.getElementById('shippingForm');
const shippingResult = document.getElementById('shippingResult');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const categoriesFilter = document.getElementById('categoriesFilter');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  if (typeof db !== 'undefined') {
    db.collection('products').onSnapshot((snapshot) => {
      const products = [];
      snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      window.catalogProducts = products;
      renderProducts('todos');
    });
  }
});

// --- RENDERIZAR PRODUCTOS ---
function renderProducts(category) {
filtered.forEach(product => {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-card-img-wrapper">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
    </div>
    <div class="product-info">
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">$${Number(product.price).toLocaleString('es-AR')}</p>
      <button class="btn-primary btn-full" onclick="addToCart('${product.id}')">Agregar al Carrito</button>
    </div>
  `;
  productsGrid.appendChild(card);
});
}

// --- FILTROS DE CATEGORÍA ---
if (categoriesFilter) {
  categoriesFilter.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      renderProducts(e.target.dataset.cat);
    }
  });
}

// --- LÓGICA DEL CARRITO ---
function addToCart(id) {
  const products = window.catalogProducts || [];
  const product = products.find(p => p.id === id);
  if (!product) return;

  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveAndRefreshCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveAndRefreshCart();
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      saveAndRefreshCart();
    }
  }
}

function saveAndRefreshCart() {
  localStorage.setItem('mirkis_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = totalCount;
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = '';
  let subtotal = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 3rem;">Tu carrito está vacío.</p>';
  } else {
    cart.forEach(item => {
      subtotal += Number(item.price) * item.quantity;
      const itemEl = document.createElement('div');
      itemEl.style.display = 'flex';
      itemEl.style.justifyContent = 'space-between';
      itemEl.style.alignItems = 'center';
      itemEl.style.marginBottom = '1.2rem';
      
      itemEl.innerHTML = `
        <div>
          <strong>${item.name}</strong><br>
          <small color="var(--text-muted)">$${Number(item.price).toLocaleString('es-AR')} x ${item.quantity}</small>
        </div>
        <div>
          <button onclick="updateQuantity('${item.id}', -1)" style="padding: 2px 8px; cursor:pointer;">-</button>
          <button onclick="updateQuantity('${item.id}', 1)" style="padding: 2px 8px; cursor:pointer;">+</button>
          <button onclick="removeFromCart('${item.id}')" style="color: #C94A4A; margin-left: 0.5rem; background:none; border:none; cursor:pointer; font-size:1.2rem;">&times;</button>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });
  }

  if (cartSubtotalAmount) cartSubtotalAmount.textContent = `$${subtotal.toLocaleString('es-AR')}`;
  
  if (shippingCost > 0) {
    if (shippingRow) shippingRow.style.display = 'flex';
    if (cartShippingAmount) cartShippingAmount.textContent = `$${shippingCost.toLocaleString('es-AR')}`;
  } else {
    if (shippingRow) shippingRow.style.display = 'none';
  }

  const grandTotal = subtotal + shippingCost;
  if (cartTotalAmount) cartTotalAmount.textContent = `$${grandTotal.toLocaleString('es-AR')}`;
}

// --- APERTURA Y CIERRE DE DRAWER Y MODAL ---
function openCart() {
  if (cartDrawer) cartDrawer.classList.add('open');
  if (overlay) overlay.classList.add('active');
}

function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (overlay) {
  overlay.addEventListener('click', () => {
    closeCart();
    if (checkoutModal) checkoutModal.classList.remove('active');
  });
}

// --- CALCULADORA DE ENVÍOS EN CARRITO ---
if (shippingForm) {
  shippingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cp = document.getElementById('postalCode').value.trim();
    if (cp) {
      shippingResult.textContent = "Calculando...";
      setTimeout(() => {
        shippingCost = 4200; // Tarifa simulada
        shippingResult.innerHTML = `<small>Envío a CP ${cp}: <strong>$4.200</strong></small>`;
        updateCartUI();
      }, 500);
    }
  });
}

// --- CHECKOUT MODAL ---
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert("Tu carrito está vacío");
    closeCart();
    if (checkoutModal) checkoutModal.classList.add('active');
    if (overlay) overlay.classList.add('active');
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    if (checkoutModal) checkoutModal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  });
}