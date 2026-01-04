import Stripe from "stripe";
import nodemailer from "nodemailer";
import getRawBody from "raw-body";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "Customer";
    const amount = (session.amount_total / 100).toFixed(2);

    // ✅ EMAIL TRANSPORTER (STABLE FOR NAMECHEAP + VERCEL)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,        // smtp.namecheap.com
      port: 587,                           // IMPORTANT
      secure: false,                       // MUST be false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,         // avoids handshake issues
      },
    });

    // 📩 CUSTOMER EMAIL
    await transporter.sendMail({
      from: `"Hustlers & Co." <orders@hustlersandco.com>`,
      to: customerEmail,
      subject: "Your order with Hustlers & Co.",
      html: `
        <h2>Thank you for your order</h2>
        <p>Hi ${customerName},</p>
        <p>We’ve received your order and are preparing it with care.</p>
        <p><strong>Total Paid:</strong> AED ${amount}</p>
        <p>We’ll notify you once your order is shipped.</p>
        <br/>
        <p>— Hustlers & Co.</p>
      `,
    });

    // 📩 ADMIN EMAIL
    await transporter.sendMail({
      from: `"Hustlers & Co." <orders@hustlersandco.com>`,
      to: "orders@hustlersandco.com",
      subject: "🛒 New Order Received",
      html: `
        <h2>New Order</h2>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Amount:</strong> AED ${amount}</p>
        <p>Check Stripe dashboard for full order details.</p>
      `,
    });
  }

  res.status(200).json({ received: true });
}

