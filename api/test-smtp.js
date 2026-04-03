require('dotenv').config();
const nodemailer = require('nodemailer');

async function testVerboseSMTP() {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    logger: true,
    debug: true
  });

  try {
    const info = await transporter.sendMail({
      from: `"LuxBank Diagnostics" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Test Diagnostic",
      text: "This is a raw diagnostic payload test. If you see this, delivery works."
    });
    console.log("SUCCESS:", info.response);
  } catch (err) {
    console.error("FAILURE:", err.message);
  }
}

testVerboseSMTP();
