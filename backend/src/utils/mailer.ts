import nodemailer from 'nodemailer';
import { env } from '../config/env';

function createSmtpTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFrom) return null;

  return {
    from: env.smtpFrom,
    transporter: nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    }),
  };
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

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

  const mailer = createSmtpTransporter();
  if (!mailer) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP] SMTP missing. Dev code for ${toEmail}: ${code}`);
      return;
    }
    throw new Error('Email delivery is not configured yet. Missing SMTP credentials.');
  }

  await mailer.transporter.sendMail({
    from: mailer.from,
    to: toEmail,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #16322b;">
        <h2 style="margin-bottom: 12px;">${options.heading}</h2>
        <p>${options.intro}</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0; color: #1b4d3e;">
          ${code}
        </div>
        <p>This code expires in 5 minutes.</p>
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

export async function sendContactEmail(payload: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const mailer = createSmtpTransporter();
  if (!mailer) {
    throw new Error('Email delivery is not configured yet. Missing SMTP credentials.');
  }

  await mailer.transporter.sendMail({
    from: mailer.from,
    to: env.contactEmail || env.smtpUser,
    replyTo: payload.email,
    subject: `Morgan's Hope contact form - ${payload.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #16322b;">
        <h2>New message from Morgan's Hope website</h2>
        <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(payload.phone || 'Not provided')}</p>
        <p><strong>Message:</strong></p>
        <div style="padding: 14px; border-radius: 12px; background: #f6fbfa; border: 1px solid #d7ebe5;">
          ${escapeHtml(payload.message).replace(/\n/g, '<br />')}
        </div>
      </div>
    `,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}
