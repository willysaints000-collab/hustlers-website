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
      /* ============================
         CUSTOMER EMAIL (LUXURY)
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
            <h2 style="font-size:20px;margin-bottom:10px;">
              Thank you for your order
            </h2>

            <p style="font-size:15px;line-height:1.6;">
              Hi <strong>${customerName}</strong>,
            </p>

            <p style="font-size:15px;line-height:1.6;">
              We’ve received your order and it’s now being carefully prepared by our team.
            </p>

            <div style="background:#f8f8f8;padding:20px;margin:25px 0;">
              <p style="margin:0;font-size:14px;color:#555;">
                <strong>Total Paid:</strong>
              </p>
              <p style="margin:5px 0 0;font-size:22px;font-weight:bold;">
                AED ${amount}
              </p>
            </div>

            <p style="font-size:14px;line-height:1.6;color:#555;">
              You’ll receive another email once your order has been shipped.
            </p>

            <p style="margin-top:30px;font-size:14px;">
              — The Hustlers & Co. Team
            </p>
          </div>

          <div style="padding:20px;text-align:center;font-size:12px;color:#888;border-top:1px solid #eee;">
            © ${new Date().getFullYear()} Hustlers & Co. All rights reserved.
          </div>

        </div>
        `,
      });

      /* ============================
         ADMIN EMAIL (CLEAN)
      ============================ */
      await resend.emails.send({
        from: "Hustlers & Co. <orders@hustlersandco.com>",
        to: "orders@hustlersandco.com",
        subject: "🛒 New Order Received",
        html: `
        <div style="font-family:Arial,Helvetica,sans-serif;">
          <h2>New Order Received</h2>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Total:</strong> AED ${amount}</p>
          <p>View full order details in the Stripe dashboard.</p>
        </div>
        `,
      });
    } catch (error) {
      console.error("Resend email error:", error);
      return res.status(500).json({ error: "Email sending failed" });
    }
  }

  res.status(200).json({ received: true });
}
