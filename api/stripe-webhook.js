import Stripe from "stripe";

// Initialize Stripe with your SECRET key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Vercel needs raw body for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Read raw body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    // Verify event
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("✅ Checkout completed");
    console.log("Customer email:", session.customer_details?.email);
    console.log("Amount paid:", session.amount_total);

    // 👉 later you can save to DB / send email / etc
  }

  // ✅ ALWAYS return 200 to Stripe
  res.status(200).json({ received: true });
}
