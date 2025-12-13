export const config = {
  runtime: "nodejs"
};

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

    const line_items = cart.map(item => ({
      price_data: {
        currency: "aed",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: "https://hustlers-website.vercel.app/success.html",
      cancel_url: "https://hustlers-website.vercel.app/cancel.html",
    });

    // ✅ SUCCESS
    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Stripe error:", error);

    // ✅ CORRECT ERROR RESPONSE
    return res.status(500).json({
      error: error.message || "Stripe session creation failed"
    });
  }
}
