import Stripe from "stripe";
import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await resend.emails.send({
        from: "Hustlers & Co <orders@hustlersandco.com>",
        to: "orders@hustlersandco.com",
        subject: "🛒 New Order Received — Hustlers & Co.",
        html: `
          <h2>New Order Received</h2>
          <p><strong>Customer Email:</strong> ${session.customer_details?.email}</p>
          <p><strong>Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
          <p><strong>Payment Status:</strong> ${session.payment_status}</p>
          <p><strong>Session ID:</strong> ${session.id}</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send order email:", emailError);
      return res.status(500).send("Email sending failed");
    }
  }

  res.status(200).json({ received: true });
}
