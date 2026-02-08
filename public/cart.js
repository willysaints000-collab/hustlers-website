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

  if (cart.length === 0) {
    list.innerHTML = `
      <div style="
        text-align:center;
        padding:70px 20px;
        color:#555;
      ">
        <p style="font-size:16px;margin-bottom:6px;">
          <strong>Your cart is currently empty.</strong>
        </p>
        <p style="font-size:14px;opacity:.8;">
          Explore the collection and find your essentials.
        </p>
      </div>
    `;
    totalEl.textContent = "AED 0.00";
    return;
  }

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

/* ========= CHECKOUT (EMAIL FIX) ========= */

function checkout() {
  const cartItems = getCart();
  const emailInput = document.querySelector("#email");

  if (!emailInput || !emailInput.value) {
    alert("Please enter your email address.");
    return;
  }

  if (cartItems.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  fetch("/.netlify/functions/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cart: cartItems,
      email: emailInput.value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed. Please try again.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Something went wrong. Please try again.");
    });
}

