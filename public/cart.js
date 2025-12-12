// =======================
// CART STORAGE FUNCTIONS
// =======================
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// =======================
// ADD TO CART
// =======================
function addToCart(item) {
    // Validate size
    if (!item.size || item.size === "" || item.size === "Select Size") {
        alert("Please select your size first.");
        return;
    }

    const cart = getCart();

    // Does same product + same size already exist?
    const existing = cart.find(
        (c) => c.name === item.name && c.size === item.size
    );

    if (existing) {
        existing.quantity += 1; // increase quantity
    } else {
        item.quantity = 1; // initialize
        cart.push(item);
    }

    saveCart(cart);
    updateCartCount();
    alert("Added to cart!");
}

// =======================
// UPDATE CART COUNT (Navbar)
// =======================
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const countElements = document.querySelectorAll(".cart-count");
    countElements.forEach(el => (el.textContent = count));
}

// Run this on all pages
updateCartCount();

// =======================
// CART PAGE RENDER
// =======================
function renderCart() {
    const cart = getCart();
    const cartContainer = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    if (!cartContainer) return;

    cartContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;

        const row = document.createElement("div");
        row.className = "cart-row";

        row.innerHTML = `
            <img src="${item.image}" class="cart-img">

            <div class="cart-info">
                <h3>${item.name}</h3>
                <p>Size: ${item.size}</p>
                AED ${item.price} × ${item.quantity} = 
                <strong>AED ${lineTotal.toFixed(2)}</strong>

                <br/><br/>
                <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
            </div>
        `;

        cartContainer.appendChild(row);
    });

    totalEl.textContent = "AED " + total.toFixed(2);
}

// =======================
// REMOVE ITEM
// =======================
function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    updateCartCount();
}
