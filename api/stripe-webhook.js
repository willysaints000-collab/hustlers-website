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
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "Customer";
    const amount = (session.amount_total / 100).toFixed(2);

    try {
      // 🔹 FETCH LINE ITEMS FROM STRIPE
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 10 }
      );

      // 🔹 BUILD PRODUCT TABLE ROWS
      const productRows = lineItems.data
        .map((item) => {
          const price = (item.amount_total / 100).toFixed(2);
          const unit = (item.price.unit_amount / 100).toFixed(2);

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
                AED ${price}
              </td>
            </tr>
          `;
        })
        .join("");

      /* ============================
         CUSTOMER EMAIL
      ============================ */
      await resend.emails.send({
        from: "Hustlers & Co. <orders@hustlersandco.com>",
        to: customerEmail,
        subject: "Your Hustlers & Co. Order Confirmation",
        html: `
        <div style="max-width:600px;margin:0 auto;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111;">
          
          <div style="padding:30px;text-align:center;border-bottom:1px solid #eee;">
            <h1 style="margin:0;font-size:26px;letter-spacing:1px;">HUSTLERS & CO.</h1>
            <p style="margin-top:6px;color:#777;font-size:14px;">
              Premium Menswear • Timeless Style
            </p>
          </div>

          <div style="padding:30px;">
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>Thank you for your order. Here are your purchase details:</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:20px;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:10px;border-bottom:2px solid #000;">Item</th>
                  <th style="text-align:center;padding:10px;border-bottom:2px solid #000;">Qty</th>
                  <th style="text-align:right;padding:10px;border-bottom:2px solid #000;">Unit</th>
                  <th style="text-align:right;padding:10px;border-bottom:2px solid #000;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>

            <div style="margin-top:25px;text-align:right;">
              <p style="font-size:14px;color:#555;">Total Paid</p>
              <p style="font-size:22px;font-weight:bold;">AED ${amount}</p>
            </div>

            <p style="margin-top:30px;font-size:14px;">
              We’ll notify you once your order ships.
            </p>

            <p style="margin-top:20px;">— The Hustlers & Co. Team</p>
          </div>

          <div style="padding:20px;text-align:center;font-size:12px;color:#888;border-top:1px solid #eee;">
            © ${new Date().getFullYear()} Hustlers & Co.
          </div>
        </div>
        `,
      });

      /* ============================
         ADMIN EMAIL
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
        `,
      });
    } catch (error) {
      console.error("Resend email error:", error);
      return res.status(500).json({ error: "Email sending failed" });
    }
  }

  res.status(200).json({ received: true });
}

