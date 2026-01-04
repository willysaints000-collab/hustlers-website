import Stripe from "stripe";
import { buffer } from "micro";
import { Resend } from "resend";

// Disable body parsing (REQUIRED for Stripe webhooks)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Send confirmation email
      await resend.emails.send({
        from: "Hustlers & Co <orders@hustlersandco.com>",
        to: session.customer_details?.email,
        subject: "Order Confirmed — Hustlers & Co.",
        html: `
          <h2>Thank you for your order</h2>
          <p>Your payment was successful.</p>
          <p><strong>Order ID:</strong> ${session.id}</p>
          <p>We’ll notify you once your order is shipped.</p>
          <br/>
          <p>— Hustlers & Co.</p>
        `,
      });

      console.log("✅ Order email sent successfully");
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
    }
  }

  // Acknowledge receipt
  res.status(200).json({ received: true });
}
