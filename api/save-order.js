import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { orderType, items, customer, total } = req.body;

    const filePath = path.join(process.cwd(), "orders.json");

    // Read existing orders
    let orders = [];
    try {
        const fileData = fs.readFileSync(filePath, "utf8");
        orders = JSON.parse(fileData);
    } catch (e) {
        orders = [];
    }

    // Create new order entry
    const newOrder = {
        id: Date.now(),
        orderType,   // "COD" or "Stripe"
        items,
        customer,
        total,
        date: new Date().toISOString()
    };

    orders.push(newOrder);

    // Save back to JSON
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));

    return res.status(200).json({ success: true, orderId: newOrder.id });
}
