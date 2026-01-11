import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  try {
    const { name, email, message } = JSON.parse(event.body);

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fields" })
      };
    }

    await resend.emails.send({
      from: "H&CO <orders@hustlersandco.com>",
      to: process.env.CONTACT_TO_EMAIL,
      reply_to: email,
      subject: "📩 New Contact Message — H&CO.",
      html: `
        <strong>Name:</strong> ${name}<br/>
        <strong>Email:</strong> ${email}<br/><br/>
        <strong>Message:</strong><br/>
        ${message}
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send message" })
    };
  }
}

