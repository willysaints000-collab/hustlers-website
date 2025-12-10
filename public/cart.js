// Load cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Save cart
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Add item to cart
function addToCart(name, price, image, size) {
    // Prevent adding without selecting size
    if (!size || size === "" || size === "Select Size") {
        alert("Please select your size first.");
        return;
    }

    const cart = getCart();

    cart.push({
        name,
        price: Number(price),
        image,
        size
    });

    saveCart(cart);
    alert("Added to cart!");
}

// Display cart items on cart.html
function displayCart() {
    const cart = getCart();
    const cartContainer = document.getElementById("cart-items");
    const subtotalElement = document.getElementById("cart-subtotal");

    if (!cartContainer) return; // Avoid errors on pages without cart

    cartContainer.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.image}" class="cart-img">

            <div class="cart-details">
                <p class="cart-name">${item.name}</p>
                <p class="cart-size">Size: ${item.size}</p>
                <p class="cart-price">AED ${item.price}</p>
            </div>

            <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        `;

        cartContainer.appendChild(div);
        subtotal += item.price;
    });

    subtotalElement.textContent = `AED ${subtotal}`;
}

// Remove a cart item
function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

// Stripe payment button (cart.html)
async function proceedToCheckout() {
    const cart = getCart();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    window.location.href = "checkout.html";
}

displayCart();
