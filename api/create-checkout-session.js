import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Build line items
    const line_items = cart.map(item => ({
      price_data: {
        currency: "aed",
        product_data: {
          name: `${item.name}${item.color ? " - " + item.color : ""}${item.size ? " (" + item.size + ")" : ""}`,
        },
        unit_amount: Math.round(item.price * 100), // AED → fils
      },
      quantity: item.quantity || item.qty || 1,
    }));

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items,

      /* ✅ COLLECT CUSTOMER DETAILS */
      billing_address_collection: "required",

      shipping_address_collection: {
        allowed_countries: ["AE", "US", "GB", "EU"],
      },

      phone_number_collection: {
        enabled: true,
      },

      /* ✅ OPTIONAL SHIPPING (FREE) */
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "aed",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
      ],

      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cart.html`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: error.message });
  }
}

