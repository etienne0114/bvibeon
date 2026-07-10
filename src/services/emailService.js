const axios = require('axios');
const logger = require('../utils/logger');

const RESEND_API_URL = 'https://api.resend.com/emails';

// Resend free tier without a verified domain can only send from onboarding@resend.dev
const FROM = process.env.EMAIL_FROM || 'Vibeon Learn <onboarding@resend.dev>';

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

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn('RESEND_API_KEY not set; skipping email send');
    return null;
  }
  const response = await axios.post(
    RESEND_API_URL,
    { from: FROM, to: [to], subject, html },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 10000 },
  );
  logger.info(`Email sent to ${to} (id: ${response.data?.id})`);
  return response.data;
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
