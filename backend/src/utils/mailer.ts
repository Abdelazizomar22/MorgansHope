import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER?.trim();
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();

const transporter = (gmailUser && gmailAppPassword)
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })
  : null;

export async function sendOTPEmail(toEmail: string, otp: string) {
  if (!toEmail) {
    throw new Error('A recipient email address is required to send the OTP.');
  }

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP] Gmail SMTP missing. Dev OTP for ${toEmail}: ${otp}`);
      return;
    }
    throw new Error('Email OTP is not configured yet. Missing Gmail SMTP credentials.');
  }

  await transporter.sendMail({
    from: gmailUser,
    to: toEmail,
    subject: 'Your Morgan\'s Hope verification code',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #16322b;">
        <h2 style="margin-bottom: 12px;">Verify your phone number</h2>
        <p>Use the 6-digit code below to complete verification in Morgan's Hope:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0; color: #1b4d3e;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}
