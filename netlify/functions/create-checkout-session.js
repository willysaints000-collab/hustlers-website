const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const cart = body.cart;

    if (!cart || cart.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Cart is empty" }),
      };
    }

    // ✅ Build Stripe line items
    const line_items = cart.map(item => ({
      price_data: {
        currency: "aed",
        product_data: {
          name: `${item.name}${item.size ? " (" + item.size + ")" : ""}`,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.qty || 1,
    }));

    // ✅ CREATE CHECKOUT SESSION (EMAIL RECEIPT ENABLED)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      customer_creation: "always",

      billing_address_collection: "required",

      shipping_address_collection: {
        allowed_countries: ["AE"],
      },

      phone_number_collection: {
        enabled: true,
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "aed",
            },
            display_name: "Standard Shipping",
          },
        },
      ],

      line_items,

      // ✅ THIS IS THE KEY PART (FOR EMAIL RECEIPTS)
      customer_email: body.email || undefined,
      receipt_email: body.email || undefined,

      success_url: `${event.headers.origin}/success.html`,
      cancel_url: `${event.headers.origin}/cart.html`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (error) {
    console.error("Stripe error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
