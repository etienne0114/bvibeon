const axios = require('axios');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const RESEND_API_URL = 'https://api.resend.com/emails';

// Resend free tier without a verified domain can only send from onboarding@resend.dev
// AND only to the Resend account owner's address — real recipients need either a
// verified domain (resend.com/domains) or the SMTP fallback below.
const FROM = process.env.EMAIL_FROM || 'Vibeon Learn <onboarding@resend.dev>';

// SMTP fallback (e.g. Gmail with an app password) — delivers to any recipient
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let smtpTransport = null;
function getSmtpTransport() {
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return smtpTransport;
}

const brand = {
  ink: '#2E1F26',
  inkSoft: '#5C4A52',
  rose: '#D9536F',
  cream: '#FBF3E9',
  card: '#F8EDDE',
  line: '#E9D9C5',
};

function shell(content) {
  return `
  <div style="background:${brand.cream};padding:40px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid ${brand.line};border-radius:16px;overflow:hidden;">
      <div style="background:${brand.ink};padding:28px 32px;">
        <span style="color:#ffffff;font-size:22px;font-weight:bold;font-family:Georgia,serif;">Vibeon Learn</span>
      </div>
      <div style="padding:32px;">
        ${content}
        <p style="color:${brand.inkSoft};font-size:12px;line-height:1.6;margin:28px 0 0;">
          Learn in 10+ languages · Anywhere, at your own pace<br/>© 2026 Vibeon Learn
        </p>
      </div>
    </div>
  </div>`;
}

function verificationTemplate(username, code) {
  return shell(`
    <h1 style="color:${brand.ink};font-family:Georgia,serif;font-size:24px;margin:0 0 16px;">Verify your email</h1>
    <p style="color:${brand.inkSoft};font-size:15px;line-height:1.7;margin:0 0 24px;">
      Muraho, ${username} 👋 — use this code to finish creating your Vibeon Learn account.
      It expires in <strong>10 minutes</strong>.
    </p>
    <div style="background:${brand.card};border:1px solid ${brand.line};border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <span style="color:${brand.ink};font-size:34px;font-weight:bold;letter-spacing:10px;font-family:Georgia,serif;">${code}</span>
    </div>
    <p style="color:${brand.inkSoft};font-size:13px;line-height:1.7;margin:0;">
      If you didn't create an account, you can safely ignore this email.
    </p>`);
}

function welcomeTemplate(username) {
  return shell(`
    <h1 style="color:${brand.ink};font-family:Georgia,serif;font-size:26px;margin:0 0 16px;">Muraho, ${username} 👋</h1>
    <p style="color:${brand.inkSoft};font-size:15px;line-height:1.7;margin:0 0 20px;">
      Welcome to <strong>Vibeon Learn</strong> — your account is verified and ready. Your AI tutor,
      instant translator, and daily practice drills are waiting for you.
    </p>
    <div style="background:${brand.card};border:1px solid ${brand.line};border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:${brand.ink};font-size:14px;margin:0 0 8px;"><strong>Get started in 3 steps:</strong></p>
      <p style="color:${brand.inkSoft};font-size:14px;line-height:1.8;margin:0;">
        1. Pick a course and set your daily goal<br/>
        2. Try a vocabulary drill to start your streak 🔥<br/>
        3. Ask the AI tutor anything — it never judges
      </p>
    </div>
    <a href="https://fvibeon.vercel.app" style="display:inline-block;background:${brand.ink};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:bold;">
      Start learning
    </a>`);
}

async function sendViaResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not set');
  }
  const response = await axios.post(
    RESEND_API_URL,
    { from: FROM, to: [to], subject, html },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 10000 },
  );
  logger.info(`Email sent via Resend to ${to} (id: ${response.data?.id})`);
  return response.data;
}

async function sendViaSmtp({ to, subject, html }) {
  const transport = getSmtpTransport();
  if (!transport) {
    throw new Error('SMTP fallback not configured (set SMTP_USER and SMTP_PASS)');
  }
  const from = process.env.SMTP_FROM || `Vibeon Learn <${SMTP_USER}>`;
  const info = await transport.sendMail({ from, to, subject, html });
  logger.info(`Email sent via SMTP to ${to} (id: ${info.messageId})`);
  return info;
}

// While the Resend account is in testing mode it can only deliver to the account
// owner. Once we see that rejection, remember the owner address and stop paying
// a failed API round-trip (and an error log) for every other recipient.
let resendOwnerOnly = null;

function resendCanDeliver(to) {
  return resendOwnerOnly === null || to === resendOwnerOnly;
}

async function sendEmail({ to, subject, html }) {
  // Primary: Resend. Its API errors carry the actual reason (e.g. testing-mode
  // recipient restriction), so surface that instead of a bare status code.
  let resendError = null;
  if (process.env.RESEND_API_KEY && resendCanDeliver(to)) {
    try {
      return await sendViaResend({ to, subject, html });
    } catch (error) {
      resendError = error.response?.data?.message || error.message;
      const ownerMatch = /own email address \(([^)]+)\)/.exec(resendError || '');
      if (ownerMatch) {
        resendOwnerOnly = ownerMatch[1];
      }
      logger.warn(`Resend unavailable for ${to}, using SMTP fallback: ${resendError}`);
    }
  }
  // Fallback: plain SMTP (e.g. Gmail app password) — no domain verification needed
  try {
    return await sendViaSmtp({ to, subject, html });
  } catch (error) {
    logger.error(`SMTP send failed for ${to}: ${error.message}`);
    // Local development: don't block sign-up on email delivery. The 6-digit
    // code is part of the subject line, so print it to the server console.
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`[DEV EMAIL FALLBACK] To: ${to} | Subject: ${subject}`);
      return { dev: true };
    }
    throw new Error(resendError || error.message);
  }
}

async function sendVerificationEmail({ to, username, code }) {
  return sendEmail({
    to,
    subject: `${code} is your Vibeon Learn verification code`,
    html: verificationTemplate(username, code),
  });
}

function passwordResetTemplate(username, code) {
  return shell(`
    <h1 style="color:${brand.ink};font-family:Georgia,serif;font-size:24px;margin:0 0 16px;">Reset your password</h1>
    <p style="color:${brand.inkSoft};font-size:15px;line-height:1.7;margin:0 0 24px;">
      Hi ${username} — we received a request to reset your Vibeon Learn password.
      Use this code to continue. It expires in <strong>10 minutes</strong>.
    </p>
    <div style="background:${brand.card};border:1px solid ${brand.line};border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <span style="color:${brand.ink};font-size:34px;font-weight:bold;letter-spacing:10px;font-family:Georgia,serif;">${code}</span>
    </div>
    <p style="color:${brand.inkSoft};font-size:13px;line-height:1.7;margin:0;">
      If you didn't request this, ignore this email — your password will stay unchanged.
    </p>`);
}

async function sendPasswordResetEmail({ to, username, code }) {
  return sendEmail({
    to,
    subject: `${code} is your Vibeon Learn password reset code`,
    html: passwordResetTemplate(username, code),
  });
}

async function sendWelcomeEmail({ to, username }) {
  return sendEmail({
    to,
    subject: 'Welcome to Vibeon Learn — Muraho! 👋',
    html: welcomeTemplate(username),
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
