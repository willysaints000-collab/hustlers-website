import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  try {
    // ✅ Handle preflight (important)
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
      };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    console.log("👉 Function triggered");

    const data = JSON.parse(event.body);
    const { name, email, message } = data;

    console.log("📨 Payload:", { name, email });

    const result = await resend.emails.send({
      from: "H&CO Contact <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO_EMAIL],
      subject: "New Contact Message — H&CO.",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    });

    console.log("✅ Email sent:", result);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error("❌ Function error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: "Failed to send message" })
    };
  }
}

