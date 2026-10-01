// Sends real email when SMTP is configured; otherwise falls back to a
// console log so local/dev setups keep working with zero configuration
// (this was the *only* behavior before — see PHASE3_OTP_AI_JOURNEY.md).
//
// Configure via .env (see .env.example):
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
//
// Works with any standard SMTP provider — Gmail (App Password), Outlook,
// SendGrid, Mailgun, Resend, AWS SES SMTP, Brevo, a company mail server,
// etc. Just fill in the host/port/credentials that provider gives you.

const nodemailer = require('nodemailer');

let transporter = null;
let loggedConfigState = false;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isConfigured()) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    // true for port 465 (implicit TLS), false for 587/25 (STARTTLS)
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured. Never throws — a mail failure
 * should never break registration/login; callers just get `false` back
 * and the OTP is still available in the server console as a fallback.
 */
async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();

  if (!t) {
    if (!loggedConfigState) {
      console.log('[mailer] SMTP not configured — emails will only be logged to this console. See backend/.env.example (SMTP_HOST/SMTP_USER/SMTP_PASS) to send real emails.');
      loggedConfigState = true;
    }
    return false;
  }

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`[mailer] Email sent to ${to}: "${subject}"`);
    return true;
  } catch (err) {
    console.error(`[mailer] Failed to send email to ${to}:`, err.message);
    return false;
  }
}

async function sendOtpEmail({ to, name, otp, purpose }) {
  const subject = purpose === 'resend'
    ? 'Your new verification code'
    : 'Verify your account — OTP inside';

  const text = `Hi ${name || ''},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0f172a;">Verify your account</h2>
      <p style="color: #334155;">Hi ${name || ''},</p>
      <p style="color: #334155;">Use the code below to verify your account. It expires in 10 minutes.</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; background: #f1f5f9; padding: 16px; border-radius: 8px; color: #0f172a;">
        ${otp}
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  return sendMail({ to, subject, text, html });
}

module.exports = { sendMail, sendOtpEmail, isConfigured };
