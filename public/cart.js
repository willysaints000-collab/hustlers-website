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
  if (typeof name !== "string") return;

  const cart = getCart();

  const existing = cart.find(
    i => i.name === name && i.size === size
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name,
      size,
      price: num(price),
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

function renderCart() {
  const cart = getCart();
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!list || !totalEl) return;

  list.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    const itemTotal = num(item.price) * num(item.qty);
    total += itemTotal;

    list.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}">
        <div>
          <strong>${item.name}</strong> ${item.size ? `(${item.size})` : ""}
          <p>AED ${item.price}</p>
          <input type="number" min="1" value="${item.qty}"
            onchange="updateQty(${i}, this.value)">
          <button onclick="removeItem(${i})">Remove</button>
        </div>
      </div>
    `;
  });

  totalEl.textContent = total.toFixed(2);
}

function updateQty(i, q) {
  const cart = getCart();
  cart[i].qty = num(q);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function removeItem(i) {
  const cart = getCart();
  cart.splice(i, 1);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

document.addEventListener("DOMContentLoaded", renderCart);
