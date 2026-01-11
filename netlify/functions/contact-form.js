const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  // Allow only POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const data = new URLSearchParams(event.body);

    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    await resend.emails.send({
      from: "H&CO Contact <onboarding@resend.dev>", // ✅ testing sender
      to: "willysaints000@gmail.com",               // ✅ MUST be your Resend email
      subject: "New Contact Message — H&CO.",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return {
      statusCode: 302,
      headers: {
        Location: "/contact.html?success=true",
      },
      body: "",
    };

  } catch (error) {
    console.error("Contact form error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send message" }),
    };
  }
};
