const twilio = require('twilio');
const nodemailer = require('nodemailer');

let transporter;
let transporterMode = 'uninitialized';
let etherealAccountPromise;

function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function getTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    if (!transporter || transporterMode !== 'smtp') {
      transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      transporterMode = 'smtp';
    }

    return transporter;
  }

  if (!etherealAccountPromise) {
    etherealAccountPromise = nodemailer.createTestAccount();
  }

  const account = await etherealAccountPromise;

  if (!transporter || transporterMode !== 'ethereal') {
    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    transporterMode = 'ethereal';
    console.log('[Ethereal] Test SMTP Server online.');
  }

  return transporter;
}

class OTPService {
  async sendEmail({ to, subject, html }) {
    const mailTransporter = await getTransporter();

    return mailTransporter.sendMail({
      from: `"LuxBank Security" <${process.env.SMTP_USER || 'security@luxbank.test'}>`,
      to,
      subject,
      html
    });
  }

  async sendOtpEmail(email, otp) {
    const info = await this.sendEmail({
      to: email,
      subject: "Your LuxBank One-Time Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
           <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1e3a8a; margin-top: 0;">LuxBank Secure Authentication</h2>
              <p>Hello,</p>
              <p>We received a request to access your account. Please use the following One-Time Password to proceed:</p>
              <h1 style="font-size: 36px; letter-spacing: 8px; color: #3b82f6; text-align: center; margin: 30px 0;">${otp}</h1>
              <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. Do not share this with anyone.</p>
           </div>
        </div>
      `
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log(`[Real OTP] Email sent to ${email}`);
    } else {
      console.log(`\n=============================\n[ETHEREAL OTP PREVIEW URL]\nClick to view email sent to ${email}:\n%s\n=============================\n`, nodemailer.getTestMessageUrl(info));
    }
  }

  async sendPasswordResetEmail(email, resetLink) {
    const info = await this.sendEmail({
      to: email,
      subject: 'Reset Your LuxBank Password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
          <div style="max-width: 520px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e3a8a; margin-top: 0;">Password Recovery Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your LuxBank password. Click the button below to continue.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="word-break: break-all; color: #475569; font-size: 13px;">If the button does not work, use this link: ${resetLink}</p>
            <p style="color: #64748b; font-size: 12px;">This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>
          </div>
        </div>
      `
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log(`[Password Reset] Email sent to ${email}`);
    } else {
      console.log(`\n=============================\n[ETHEREAL RESET PREVIEW URL]\nClick to view password reset email sent to ${email}:\n%s\n=============================\n`, nodemailer.getTestMessageUrl(info));
    }
  }

  async sendOtpSms(phone, otp) {
    const twilioClient = getTwilioClient();

    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      await twilioClient.messages.create({
        body: `LuxBank: Your security OTP is ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      console.log(`[Real OTP] SMS sent to ${phone}`);
    } else {
       console.log(`\n=============================\n[MOCK SMS] To: ${phone} | Body: LuxBank OTP is ${otp}\n=============================\n`);
    }
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  }
}

module.exports = new OTPService();
