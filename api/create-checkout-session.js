const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
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
                    name: `${item.name}${item.size ? ` (${item.size})` : ""}`,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.qty || item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items,
            success_url: "https://hustlers-website.vercel.app/success.html",
            cancel_url: "https://hustlers-website.vercel.app/cancel.html",
        });

        res.status(200).json({ url: session.url });

    } catch (err) {
        console.error("Stripe error:", err);
        res.status(500).json({ error: err.message });
    }
};

