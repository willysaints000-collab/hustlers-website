// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update Cart UI
function renderCart() {
    const cartContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    cartContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <h4>${item.name}</h4>
                <p>AED ${item.price}</p>
                <p>Qty: ${item.quantity}</p>
                <button onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });

    cartTotal.innerText = total;
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

renderCart();

// -----------------------------
// STRIPE CHECKOUT
// -----------------------------
document.getElementById("checkout-btn").addEventListener("click", async () => {
    const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
    });

    const session = await response.json();

    if (session.id) {
        window.location.href = `https://checkout.stripe.com/pay/${session.id}`;
    } else {
        alert("Error creating payment session");
    }
});

