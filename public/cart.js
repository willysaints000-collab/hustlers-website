<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Heritage Tee — H&CO.</title>

    <!-- Luxury Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

    <style>
        body {
            margin: 0;
            background: #f8f6f3;
            font-family: 'Inter', sans-serif;
            color: #111;
        }

        /* NAVBAR */
        header {
            width: 100%;
            padding: 25px 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #000;
        }

        header a {
            color: white;
            margin-left: 35px;
            text-decoration: none;
            font-size: 15px;
            letter-spacing: 1px;
        }

        .logo {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 600;
            color: white;
        }

        /* PRODUCT LAYOUT */
        .product-container {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 60px;
            padding: 80px 80px;
        }

        .product-img {
            width: 100%;
            border-radius: 6px;
        }

        .product-details h1 {
            font-family: "Playfair Display", serif;
            font-size: 46px;
            margin-bottom: 10px;
        }

        .price {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 25px;
        }

        .description {
            font-size: 17px;
            margin-bottom: 25px;
            opacity: 0.8;
            line-height: 1.6;
        }

        /* SIZE SELECT */
        .size-label {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 5px;
            display: block;
        }

        .size-select {
            width: 100%;
            padding: 12px;
            border: 1px solid #d6d2cc;
            border-radius: 4px;
            font-size: 15px;
            margin-bottom: 25px;
        }

        /* BUTTON */
        .add-btn {
            background: black;
            color: white;
            padding: 14px 28px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            letter-spacing: 1px;
            font-size: 15px;
        }
    </style>
</head>

<body>

    <!-- NAV -->
    <header>
        <div class="logo">H&CO.</div>
        <nav>
            <a href="index.html">Home</a>
            <a href="collection.html">Collection</a>
            <a href="shop.html">Shop</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
            <a href="cart.html">Cart (<span class="cart-count">0</span>)</a>
        </nav>
    </header>

    <!-- PRODUCT BODY -->
    <section class="product-container">

        <!-- IMAGE -->
        <img src="images/heritage-tee.webp" class="product-img" />

        <!-- DETAILS -->
        <div class="product-details">
            <h1>Heritage Tee</h1>
            <p class="price">AED 199</p>

            <p class="description">
                Crafted from premium cotton for everyday comfort. A timeless essential designed for the modern gentleman.
            </p>

            <!-- SIZE SELECTOR -->
            <label class="size-label">Select Size:</label>
            <select id="product-size" class="size-select">
                <option value="">Select Size</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="XL">XL</option>
            </select>

            <!-- ADD TO CART -->
            <button class="add-btn" onclick="addToCart({
                id: 1,
                name: 'Heritage Tee',
                price: 199,
                image: 'images/heritage-tee.webp',
                size: document.getElementById('product-size').value
            })">
                Add to Cart
            </button>

        </div>
    </section>

    <script src="cart.js"></script>

</body>
</html>
