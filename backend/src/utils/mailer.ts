import nodemailer from 'nodemailer';

function createGmailTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '').trim();

  if (!user || !pass) return null;

  return {
    user,
    transporter: nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      auth: { user, pass },
    }),
  };
}

interface VerificationEmailOptions {
  subject: string;
  heading: string;
  intro: string;
  footer?: string;
}

async function sendCodeEmail(toEmail: string, code: string, options: VerificationEmailOptions) {
  if (!toEmail) {
    throw new Error('A recipient email address is required to send the verification code.');
  }

  const mailer = createGmailTransporter();
  if (!mailer) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP] Gmail SMTP missing. Dev code for ${toEmail}: ${code}`);
      return;
    }
    throw new Error('Email delivery is not configured yet. Missing Gmail SMTP credentials.');
  }

  await mailer.transporter.sendMail({
    from: `Morgan's Hope <${mailer.user}>`,
    to: toEmail,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #16322b;">
        <h2 style="margin-bottom: 12px;">${options.heading}</h2>
        <p>${options.intro}</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0; color: #1b4d3e;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
        ${options.footer ? `<p style="margin-top: 14px; color: #4b5563;">${options.footer}</p>` : ''}
      </div>
    `,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

export async function sendVerificationCodeEmail(toEmail: string, code: string) {
  await sendCodeEmail(toEmail, code, {
    subject: "Verify your Morgan's Hope email",
    heading: 'Verify your email address',
    intro: 'Use the 6-digit code below to activate your Morgan\'s Hope account and unlock protected services.',
    footer: 'If you did not create this account, you can safely ignore this email.',
  });
}

export async function sendOTPEmail(toEmail: string, otp: string) {
  await sendCodeEmail(toEmail, otp, {
    subject: "Your Morgan's Hope phone verification code",
    heading: 'Verify your phone number',
    intro: 'Use the 6-digit code below to complete phone verification in Morgan\'s Hope.',
  });
}
