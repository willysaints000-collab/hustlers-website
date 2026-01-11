const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  // ✅ Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // ✅ Parse form data
    const params = new URLSearchParams(event.body);
    const name = params.get("name");
    const email = params.get("email");
    const message = params.get("message");

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: "Missing required fields",
      };
    }

    // ✅ Send email via Resend (TEST MODE SAFE)
    await resend.emails.send({
      from: "H&CO Contact <onboarding@resend.dev>",
      to: "willysaints000@gmail.com",
      subject: "New Contact Message — H&CO.",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // ✅ Redirect back to contact page with success
    return {
      statusCode: 302,
      headers: {
        Location: "/contact.html?success=true",
      },
      body: "",
    };

  } catch (err) {
    console.error("Contact form error:", err);

    return {
      statusCode: 500,
      body: "Failed to send message",
    };
  }
};

