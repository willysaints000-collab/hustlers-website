import Stripe from "stripe";
import { Resend } from "resend";
import getRawBody from "raw-body";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

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
    console.error("Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "Customer";
    const amount = (session.amount_total / 100).toFixed(2);

    /* 📦 SHIPPING ADDRESS */
    const address = session.shipping_details?.address || {};
    const shippingAddress = `
      ${session.shipping_details?.name || customerName}<br/>
      ${address.line1 || ""} ${address.line2 || ""}<br/>
      ${address.city || ""}${address.state ? ", " + address.state : ""}<br/>
      ${address.postal_code || ""}<br/>
      ${address.country || ""}
    `;

    try {
      /* 🛍 FETCH LINE ITEMS */
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 10 }
      );

      const productRows = lineItems.data
        .map((item) => {
          const unit = (item.price.unit_amount / 100).toFixed(2);
          const total = (item.amount_total / 100).toFixed(2);

          return `
            <tr>
              <td style="padding:12px;border-bottom:1px solid #eee;">
                ${item.description}
              </td>
              <td style="padding:12px;text-align:center;border-bottom:1px solid #eee;">
                ${item.quantity}
              </td>
              <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;">
                AED ${unit}
              </td>
              <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;">
                AED ${total}
              </td>
            </tr>
          `;
        })
        .join("");

      /* ============================
         📧 CUSTOMER EMAIL
      ============================ */
      await resend.emails.send({
        from: "Hustlers & Co. <orders@hustlersandco.com>",
        to: customerEmail,
        subject: "Your Hustlers & Co. Order Confirmation",
        html: `
        <div style="max-width:600px;margin:0 auto;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#111;">

          <!-- LOGO -->
          <div style="text-align:center;padding:40px 30px 20px;">
            <img
              src="https://hustlersandco.com/images/email-logo.png"
              alt="Hustlers & Co."
              style="max-width:180px;height:auto;"
            />
          </div>

          <div style="padding:30px;">
            <p>Hi <strong>${customerName}</strong>,</p>

            <p>
              Thank you for your order. We are preparing it with care.
            </p>

            <!-- ORDER TABLE -->
            <table width="100%" style="border-collapse:collapse;margin-top:25px;">
              <thead>
                <tr style="border-bottom:2px solid #000;">
                  <th align="left" style="padding:10px;">Item</th>
                  <th align="center" style="padding:10px;">Qty</th>
                  <th align="right" style="padding:10px;">Unit</th>
                  <th align="right" style="padding:10px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>

            <div style="margin-top:25px;text-align:right;">
              <p style="font-size:14px;color:#666;">Total Paid</p>
              <p style="font-size:22px;font-weight:600;">AED ${amount}</p>
            </div>

            <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />

            <h3 style="margin-bottom:8px;">Shipping Address</h3>
            <p style="line-height:1.6;">${shippingAddress}</p>

            <p style="margin-top:25px;">
              We’ll notify you once your order ships.
            </p>

            <p style="margin-top:20px;">— Hustlers & Co.</p>
          </div>

          <div style="padding:20px;text-align:center;font-size:12px;color:#888;border-top:1px solid #eee;">
            © ${new Date().getFullYear()} Hustlers & Co.
          </div>
        </div>
        `,
      });

      /* ============================
         📧 ADMIN EMAIL
      ============================ */
      await resend.emails.send({
        from: "Hustlers & Co. <orders@hustlersandco.com>",
        to: "orders@hustlersandco.com",
        subject: "🛒 New Order Received",
        html: `
          <h2>New Order</h2>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Total:</strong> AED ${amount}</p>

          <h3>Shipping Address</h3>
          <p>${shippingAddress}</p>
        `,
      });
    } catch (error) {
      console.error("Resend email error:", error);
      return res.status(500).json({ error: "Email sending failed" });
    }
  }

  res.status(200).json({ received: true });
}
