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

function welcomeTemplate(username) {
  return `
  <div style="background:${brand.cream};padding:40px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid ${brand.line};border-radius:16px;overflow:hidden;">
      <div style="background:${brand.ink};padding:28px 32px;">
        <span style="color:#ffffff;font-size:22px;font-weight:bold;font-family:Georgia,serif;">Vibeon Learn</span>
      </div>
      <div style="padding:32px;">
        <h1 style="color:${brand.ink};font-family:Georgia,serif;font-size:26px;margin:0 0 16px;">Muraho, ${username} 👋</h1>
        <p style="color:${brand.inkSoft};font-size:15px;line-height:1.7;margin:0 0 20px;">
          Welcome to <strong>Vibeon Learn</strong> — your account is ready. Your AI tutor,
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
        </a>
        <p style="color:${brand.inkSoft};font-size:12px;line-height:1.6;margin:28px 0 0;">
          Kinyarwanda · English · Français<br/>© 2026 Vibeon Learn — built for learners in Rwanda
        </p>
      </div>
    </div>
  </div>`;
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

async function sendWelcomeEmail({ to, username }) {
  return sendEmail({
    to,
    subject: 'Welcome to Vibeon Learn — Muraho! 👋',
    html: welcomeTemplate(username),
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
};
