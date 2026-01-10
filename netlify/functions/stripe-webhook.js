const Stripe = require("stripe");
const { Resend } = require("resend");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // ✅ Only act on completed checkout
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "Customer";
    const totalAmount = (session.amount_total / 100).toFixed(2);

    try {
      // 📩 ADMIN EMAIL
      await resend.emails.send({
        from: "Hustlers & Co. <orders@hustlersandco.com>",
        to: [
          "orders@hustlersandco.com",
          "salazarwilma104@yahoo.com"
        ],
        subject: "🛒 New Order Received — Hustlers & Co.",
        html: `
          <h2>New Order Received</h2>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Total:</strong> AED ${totalAmount}</p>
        `,
      });

      // 📩 CUSTOMER EMAIL
      await resend.emails.send({
        from: "Hustlers & Co. <orders@hustlersandco.com>",
        to: customerEmail,
        subject: "Your Order Is Confirmed — Hustlers & Co.",
        html: `
          <p>Hi ${customerName},</p>
          <p>Thank you for your order. We’ve received it and are preparing it with care.</p>
          <p><strong>Total Paid:</strong> AED ${totalAmount}</p>
          <br/>
          <p>— Hustlers & Co.</p>
        `,
      });

    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
