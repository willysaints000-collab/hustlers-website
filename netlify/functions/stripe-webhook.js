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

  // ✅ Only after successful payment
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;

    try {
      // Fetch line items
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 10 }
      );

      const itemsHtml = lineItems.data
        .map(
          (item) =>
            `<li>${item.quantity} × ${item.description}</li>`
        )
        .join("");

      // ✅ Send email
      await resend.emails.send({
        from: "Hustlers & Co <onboarding@resend.dev>",
        to: session.customer_details.email,
        subject: "Order Confirmed — H&CO.",
        html: `
          <h2>Thank you for your order</h2>
          <p>Hi ${session.customer_details.name},</p>

          <p>Your order has been successfully confirmed.</p>

          <ul>${itemsHtml}</ul>

          <p><strong>Total:</strong> ${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}</p>

          <p>We’ll notify you once your order is on the way.</p>

          <p>— Hustlers & Co.</p>
        `,
      });

      console.log("Confirmation email sent");
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
