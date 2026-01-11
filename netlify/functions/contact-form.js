const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  try {
    const { name, email, message } = JSON.parse(event.body);

    await resend.emails.send({
      from: "Hustlers & Co <orders@hustlersandco.com>",
      to: ["orders@hustlersandco.com"],
      reply_to: email,
      subject: "📩 New Contact Message — H&CO.",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
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
};

