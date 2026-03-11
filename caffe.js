// =============================================
//  CAFE WEBSITE — tejas.js
//  Features: Auth Modal, Cart, Orders, Nav
// =============================================

const API = 'http://localhost:5000/api';

// ── State ──────────────────────────────────
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// ── On Load ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectUI();
  setupNavbar();
  setupScrollSpy();
  setupProductButtons();
  updateAuthButton();
  updateCartBadge();
});

// =============================================
//  INJECT DYNAMIC UI (Modal + Cart Drawer)
// =============================================
function injectUI() {
  document.body.insertAdjacentHTML('beforeend', `

    <!-- AUTH MODAL -->
    <div id="authModal" class="modal-overlay" style="display:none">
      <div class="modal-box">
        <button class="modal-close" onclick="closeModal('authModal')">✕</button>
        <div class="modal-tabs">
          <button class="tab-btn active" onclick="switchTab('login')">Sign In</button>
          <button class="tab-btn" onclick="switchTab('register')">Register</button>
        </div>

        <!-- LOGIN -->
        <div id="loginTab">
          <h2 class="modal-title">Welcome Back ☕</h2>
          <div id="loginError" class="form-error" style="display:none"></div>
          <input type="email" id="loginEmail" class="form-input" placeholder="Email address">
          <input type="password" id="loginPassword" class="form-input" placeholder="Password">
          <button class="form-btn" onclick="handleLogin()">Sign In</button>
        </div>

        <!-- REGISTER -->
        <div id="registerTab" style="display:none">
          <h2 class="modal-title">Create Account ☕</h2>
          <div id="registerError" class="form-error" style="display:none"></div>
          <input type="text" id="regName" class="form-input" placeholder="Full name">
          <input type="email" id="regEmail" class="form-input" placeholder="Email address">
          <input type="password" id="regPassword" class="form-input" placeholder="Password (min 6 chars)">
          <button class="form-btn" onclick="handleRegister()">Create Account</button>
        </div>
      </div>
    </div>

    <!-- CART DRAWER -->
    <div id="cartOverlay" class="modal-overlay" style="display:none" onclick="closeCart(event)">
      <div class="cart-drawer">
        <div class="cart-header">
          <h2>Your Order 🛒</h2>
          <button class="modal-close" onclick="closeModal('cartOverlay')">✕</button>
        </div>
        <div id="cartItems" class="cart-items"></div>
        <div class="cart-footer">
          <div class="cart-total">Total: <span id="cartTotal">$0.00</span></div>
          <button class="form-btn" onclick="handleCheckout()">Place Order</button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div id="toast" class="toast" style="display:none"></div>

    <!-- CART BADGE on Order Online button -->
    <style>
      /* ── Modal Overlay ── */
      .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center;}
      .modal-box{background:#1a1008;border:1px solid rgb(131,91,45);border-radius:16px;padding:36px 32px;width:360px;position:relative;color:blanchedalmond;}
      .modal-close{position:absolute;top:12px;right:16px;background:none;border:none;color:blanchedalmond;font-size:20px;cursor:pointer;}
      .modal-tabs{display:flex;gap:8px;margin-bottom:20px;}
      .tab-btn{flex:1;padding:8px;border:1px solid rgb(131,91,45);background:transparent;color:blanchedalmond;border-radius:8px;cursor:pointer;font-size:15px;font-family:'Times New Roman',serif;transition:.3s;}
      .tab-btn.active{background:rgb(88,49,3);border-color:rgb(88,49,3);}
      .modal-title{font-family:Cochin,Georgia,serif;font-size:22px;margin-bottom:18px;color:rgb(213,160,61);}
      .form-input{width:100%;padding:10px 12px;margin-bottom:12px;background:rgba(255,255,255,.08);border:1px solid rgb(131,91,45);border-radius:8px;color:blanchedalmond;font-size:15px;box-sizing:border-box;outline:none;}
      .form-input::placeholder{color:rgba(245,245,220,.45);}
      .form-btn{width:100%;padding:11px;background:rgb(88,49,3);color:blanchedalmond;border:none;border-radius:10px;font-size:16px;font-family:'Times New Roman',serif;font-style:italic;cursor:pointer;transition:.3s;margin-top:4px;}
      .form-btn:hover{background:rgb(131,91,45);}
      .form-error{background:rgba(200,50,50,.25);border:1px solid tomato;color:tomato;padding:8px 12px;border-radius:8px;margin-bottom:12px;font-size:14px;}
      /* ── Cart ── */
      .cart-drawer{background:#1a1008;border-left:2px solid rgb(131,91,45);width:360px;height:100vh;margin-left:auto;display:flex;flex-direction:column;padding:24px;box-sizing:border-box;overflow-y:auto;}
      .cart-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
      .cart-header h2{color:rgb(213,160,61);font-family:Cochin,Georgia,serif;}
      .cart-items{flex:1;overflow-y:auto;}
      .cart-item{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(131,91,45,.4);color:blanchedalmond;font-family:Cochin,Georgia,serif;}
      .cart-item-name{font-size:15px;}
      .cart-item-right{display:flex;align-items:center;gap:10px;}
      .cart-item-price{color:rgb(213,160,61);font-size:15px;}
      .qty-btn{background:rgb(88,49,3);color:blanchedalmond;border:none;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:16px;line-height:1;}
      .cart-empty{color:rgba(245,245,220,.5);text-align:center;margin-top:60px;font-family:Cochin,Georgia,serif;font-size:16px;}
      .cart-footer{border-top:1px solid rgb(131,91,45);padding-top:16px;margin-top:16px;}
      .cart-total{color:blanchedalmond;font-size:18px;font-family:Cochin,Georgia,serif;margin-bottom:14px;}
      .cart-total span{color:rgb(213,160,61);font-weight:bold;}
      /* ── Toast ── */
      .toast{position:fixed;bottom:28px;right:28px;background:rgb(88,49,3);color:blanchedalmond;padding:12px 22px;border-radius:10px;font-family:Cochin,Georgia,serif;font-size:15px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.5);}
      /* ── Cart badge ── */
      .cart-badge{position:absolute;top:-6px;right:-6px;background:rgb(213,160,61);color:#1a1008;font-size:11px;font-weight:bold;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;}
      .btn-wrapper{position:relative;display:inline-block;}
      /* ── Add to cart on product cards ── */
      .add-cart-btn{display:block;margin:10px 12px 0;padding:8px;background:transparent;border:1px solid rgb(131,91,45);color:blanchedalmond;border-radius:8px;font-family:Cochin,Georgia,serif;font-style:italic;font-size:14px;cursor:pointer;transition:.3s;width:calc(100% - 24px);}
      .add-cart-btn:hover{background:rgb(88,49,3);border-color:rgb(88,49,3);}
    </style>
  `);

  // Wrap "Order Online" button to support badge
  const btn2 = document.querySelector('.button2');
  if (btn2) {
    const wrapper = document.createElement('span');
    wrapper.className = 'btn-wrapper';
    btn2.parentNode.insertBefore(wrapper, btn2);
    wrapper.appendChild(btn2);
    btn2.addEventListener('click', openCart);
  }

  // Sign In button
  const btn1 = document.querySelector('.button1');
  if (btn1) btn1.addEventListener('click', openAuthModal);
}

// =============================================
//  NAVBAR
// =============================================
function setupNavbar() {
  // Highlight active link on click
  document.querySelectorAll('.anchor a').forEach(link => {
    link.addEventListener('click', function () {
      document.querySelectorAll('.anchor a').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function setupScrollSpy() {
  const sections = ['home', 'product', 'contact'];
  const links = {
    home: document.querySelector('a[href="#home"]'),
    product: document.querySelector('a[href="#product"]'),
    contact: document.querySelector('a[href="#contact"]'),
  };
  window.addEventListener('scroll', () => {
    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    Object.values(links).forEach(l => l && l.classList.remove('active'));
    if (links[current]) links[current].classList.add('active');
  });
}

// =============================================
//  ADD "ADD TO CART" BUTTONS ON PRODUCT CARDS
// =============================================
const PRODUCTS = [
  { id: 1, name: 'Cappuccino', price: 18.29 },
  { id: 2, name: 'Latte',      price: 22.29 },
  { id: 3, name: 'Mocha',      price: 20.00 },
];

function setupProductButtons() {
  const containers = document.querySelectorAll('.container');
  containers.forEach((card, i) => {
    const p = PRODUCTS[i];
    if (!p) return;
    const btn = document.createElement('button');
    btn.className = 'add-cart-btn';
    btn.textContent = '+ Add to Cart';
    btn.addEventListener('click', () => addToCart(p));
    card.querySelector('div').appendChild(btn);
  });
}

// =============================================
//  CART LOGIC
// =============================================
function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`${product.name} added to cart ☕`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartBadge();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); updateCartBadge(); }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  let badge = document.querySelector('.cart-badge');
  const wrapper = document.querySelector('.btn-wrapper');
  if (!wrapper) return;
  if (total > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      wrapper.appendChild(badge);
    }
    badge.textContent = total;
  } else {
    if (badge) badge.remove();
  }
}

function renderCart() {
  const el = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!el) return;

  if (cart.length === 0) {
    el.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Add some coffee! ☕</p>';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <div class="cart-item-right">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span style="color:blanchedalmond">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function openCart() {
  renderCart();
  document.getElementById('cartOverlay').style.display = 'flex';
}

function closeCart(e) {
  if (e && e.target !== document.getElementById('cartOverlay')) return;
  closeModal('cartOverlay');
}

// =============================================
//  AUTH MODAL
// =============================================
function openAuthModal() {
  if (currentUser) {
    handleLogout();
    return;
  }
  switchTab('login');
  document.getElementById('authModal').style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function switchTab(tab) {
  document.getElementById('loginTab').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('registerTab').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
}

function updateAuthButton() {
  const btn = document.querySelector('.button1');
  if (!btn) return;
  btn.textContent = currentUser ? `Hi, ${currentUser.name.split(' ')[0]} ↩` : 'Sign In';
}

// ── Login ──
async function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  errEl.style.display = 'none';

  if (!email || !password) return showFormError(errEl, 'Please fill in all fields.');

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return showFormError(errEl, data.message || 'Login failed.');
    currentUser = data;
    localStorage.setItem('user', JSON.stringify(data));
    closeModal('authModal');
    updateAuthButton();
    showToast(`Welcome back, ${data.name.split(' ')[0]}! ☕`);
  } catch {
    showFormError(errEl, 'Server error. Is the backend running?');
  }
}

// ── Register ──
async function handleRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const errEl    = document.getElementById('registerError');
  errEl.style.display = 'none';

  if (!name || !email || !password) return showFormError(errEl, 'Please fill in all fields.');
  if (password.length < 6)          return showFormError(errEl, 'Password must be at least 6 characters.');

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return showFormError(errEl, data.message || 'Registration failed.');
    currentUser = data;
    localStorage.setItem('user', JSON.stringify(data));
    closeModal('authModal');
    updateAuthButton();
    showToast(`Account created! Welcome, ${data.name.split(' ')[0]}! ☕`);
  } catch {
    showFormError(errEl, 'Server error. Is the backend running?');
  }
}

// ── Logout ──
function handleLogout() {
  currentUser = null;
  localStorage.removeItem('user');
  updateAuthButton();
  showToast('Signed out. See you soon! ☕');
}

// =============================================
//  CHECKOUT
// =============================================
async function handleCheckout() {
  if (cart.length === 0) return showToast('Your cart is empty!');

  if (!currentUser) {
    closeModal('cartOverlay');
    openAuthModal();
    showToast('Please sign in to place an order.');
    return;
  }

  const orderData = {
    items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
    total: cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2),
  };

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
    closeModal('cartOverlay');
    showToast('Order placed! ☕ We\'ll have it ready soon.');
  } catch (err) {
    showToast('Order failed: ' + err.message);
  }
}

// =============================================
//  HELPERS
// =============================================
function showFormError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.display = 'none'; }, 3000);
}