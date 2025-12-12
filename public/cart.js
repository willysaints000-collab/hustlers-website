// ----------------------------
// Load cart from storage
// ----------------------------
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// ----------------------------
// Save cart
// ----------------------------
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// ----------------------------
// Add item to cart
// ----------------------------
function addToCart(item) {
    // item = { id, name, price, image, size }

    if (!item.size || item.size === "" || item.size === "Select Size") {
        alert("Please select your size first.");
        return;
    }

    const cart = getCart();

    // Check if same item + same size exists → increase quantity
    const existing = cart.find(
        c => c.name === item.name && c.size === item.size
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        item.quantity = 1;
        cart.push(item);
    }

    saveCart(cart);
    alert("Added to cart!");
}

// ----------------------------
// Display cart items on cart.html
// ----------------------------
function displayCart() {
    const cart = getCart();
    const container = document.getElementById("cart-items");
    const subtotalArea = document.getElementById("cart-subtotal");

    if (!container) return;

    container.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.image}" class="cart-img">

            <div class="cart-details">
                <p class="cart-name">${item.name}</p>
                <p class="cart-size">Size: ${item.size}</p>
                <p class="cart-price">
                    AED ${item.price} × ${item.quantity} = 
                    <strong>AED ${lineTotal.toFixed(2)}</strong>
                </p>
            </div>

            <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        `;

        container.appendChild(div);
    });

    subtotalArea.textContent = `AED ${subtotal.toFixed(2)}`;
}

// ----------------------------
// Remove item
// ----------------------------
function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

// ----------------------------
// Proceed to Checkout
// ----------------------------
function proceedToCheckout() {
    const cart = getCart();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    window.location.href = "checkout.html";
}

// ----------------------------
displayCart();
