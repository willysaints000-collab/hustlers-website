import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const data = JSON.parse(event.body);

    console.log("Incoming contact form data:", data);

    const { name, email, message } = data;

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const response = await resend.emails.send({
      // ✅ SAFE sender — works instantly
      from: "H&CO Contact <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `New Contact Message — H&CO`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log("Resend response:", response);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Contact form error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send message" }),
    };
  }
}

