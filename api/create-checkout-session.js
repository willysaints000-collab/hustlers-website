import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = cart.map(item => {
      const quantity = item.quantity || item.qty || 1;

      return {
        price_data: {
          currency: "aed",
          product_data: {
            name: `${item.name}${item.size ? ` (${item.size})` : ""}`
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
}

