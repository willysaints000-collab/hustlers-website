/* =========================
   CART CORE
========================= */

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   ADD TO CART
========================= */

function addToCart(name, price, image) {
  const cart = getCart();

  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name,
      price: Number(price),
      image,
      qty: 1
    });
  }

  saveCart(cart);
  updateCartCount();
  alert("Added to cart");
}

/* =========================
   CART COUNT (HEADER)
========================= */

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const counter = document.querySelector(".cart-count");
  if (counter) counter.textContent = count;
}

document.addEventListener("DOMContentLoaded", updateCartCount);

/* =========================
   CART PAGE RENDER
========================= */

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!container || !totalEl) return;

  container.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>AED ${item.price}</p>
          <input type="number" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)">
          <button onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
  });

  totalEl.textContent = total.toFixed(2);
}

function updateQty(index, qty) {
  const cart = getCart();
  cart[index].qty = Number(qty);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

document.addEventListener("DOMContentLoaded", renderCart);
