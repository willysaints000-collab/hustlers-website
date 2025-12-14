/* ========= CART CORE ========= */

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function num(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/* ========= ADD TO CART ========= */

function addToCart(name, price, image, size = "") {
  if (!name) return;

  const cart = getCart();
  const p = num(price);

  const existing = cart.find(
    i => i.name === name && i.size === size
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name,
      size,
      price: p,
      image,
      qty: 1
    });
  }

  saveCart(cart);
  updateCartCount();
}

/* ========= HEADER COUNT ========= */

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((t, i) => t + num(i.qty), 0);
  const el = document.querySelector(".cart-count");
  if (el) el.textContent = count;
}

document.addEventListener("DOMContentLoaded", updateCartCount);

/* ========= CART PAGE ========= */

function displayCart() {
  const cart = getCart();
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!list || !totalEl) return;

  list.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    const qty = Math.max(1, num(item.qty));
    const price = num(item.price);
    const itemTotal = price * qty;
    total += itemTotal;

    list.innerHTML += `
      <div class="cart-row">
        <img src="${item.image}" class="cart-img" alt="${item.name}">
        <div class="cart-info">
          <h3>${item.name} ${item.size ? `(${item.size})` : ""}</h3>
          <p>AED ${price.toFixed(2)}</p>
          <input type="number" min="1" value="${qty}"
            onchange="updateQty(${i}, this.value)">
          <br><br>
          <button class="remove-btn" onclick="removeItem(${i})">Remove</button>
        </div>
      </div>
    `;
  });

  totalEl.textContent = `AED ${total.toFixed(2)}`;
}

function updateQty(i, q) {
  const cart = getCart();
  cart[i].qty = Math.max(1, num(q));
  saveCart(cart);
  displayCart();
  updateCartCount();
}

function removeItem(i) {
  const cart = getCart();
  cart.splice(i, 1);
  saveCart(cart);
  displayCart();
  updateCartCount();
}

document.addEventListener("DOMContentLoaded", displayCart);
