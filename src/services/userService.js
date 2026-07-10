const crypto = require('crypto');
const bcrypt = require('bcrypt');
const axios = require('axios');
const prisma = require('../utils/prismaClient');
const { signToken } = require('../middleware/auth');
const { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } = require('./emailService');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5;

class AuthError extends Error {
  constructor(message, { status = 400, requiresVerification = false } = {}) {
    super(message);
    this.status = status;
    this.requiresVerification = requiresVerification;
  }
}

function sanitizeUser(user) {
  const {
    password,
    verificationCode,
    verificationExpiresAt,
    verificationAttempts,
    resetCode,
    resetExpiresAt,
    resetAttempts,
    ...safe
  } = user;
  return safe;
}

function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function fireWelcomeEmail(user) {
  sendWelcomeEmail({ to: user.email, username: user.username }).catch((error) => {
    logger.error(`Welcome email failed for ${user.email}: ${error.message}`);
  });
}

async function issueVerificationCode(user) {
  const code = generateCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationCode: hashCode(code),
      verificationExpiresAt: new Date(Date.now() + CODE_TTL_MS),
      verificationAttempts: 0,
    },
  });
  await sendVerificationEmail({ to: user.email, username: user.username, code });
}

async function registerUser({ username, email, password }) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });
  if (existing) {
    throw new AuthError('Email or username already registered');
  }
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
    },
  });
  let message = 'We sent a 6-digit verification code to your email.';
  try {
    await issueVerificationCode(user);
  } catch (error) {
    // Account stays usable: the verify screen offers a resend button
    logger.error(`Verification email failed for ${email}: ${error.message}`);
    message = 'Account created. If the code does not arrive shortly, tap "Resend code".';
  }
  return {
    requiresVerification: true,
    email: user.email,
    message,
  };
}

async function verifyEmail({ email, code }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError('Invalid verification code', { status: 401 });
  }
  if (user.emailVerified) {
    return { user: sanitizeUser(user), token: signToken(user.id) };
  }
  if (!user.verificationCode || !user.verificationExpiresAt || user.verificationExpiresAt < new Date()) {
    throw new AuthError('Verification code expired. Request a new one.', { status: 410 });
  }
  if (user.verificationAttempts >= MAX_VERIFY_ATTEMPTS) {
    throw new AuthError('Too many attempts. Request a new code.', { status: 429 });
  }
  if (user.verificationCode !== hashCode(code)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    });
    throw new AuthError('Invalid verification code', { status: 401 });
  }
  const verified = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
      verificationAttempts: 0,
    },
  });
  fireWelcomeEmail(verified);
  return { user: sanitizeUser(verified), token: signToken(verified.id) };
}

async function resendVerification({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always answer the same way so account existence can't be probed
  const genericResponse = { message: 'If that email is registered, a new code is on its way.' };
  if (!user || user.emailVerified) {
    return genericResponse;
  }
  try {
    await issueVerificationCode(user);
  } catch (error) {
    logger.error(`Resend verification failed for ${email}: ${error.message}`);
  }
  return genericResponse;
}

async function requestPasswordReset({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Same response either way so account existence can't be probed
  const genericResponse = { message: 'If that email is registered, a reset code is on its way.' };
  if (!user) {
    return genericResponse;
  }
  const code = generateCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetCode: hashCode(code),
      resetExpiresAt: new Date(Date.now() + CODE_TTL_MS),
      resetAttempts: 0,
    },
  });
  try {
    await sendPasswordResetEmail({ to: user.email, username: user.username, code });
  } catch (error) {
    logger.error(`Password reset email failed for ${email}: ${error.message}`);
  }
  return genericResponse;
}

async function resetPassword({ email, code, newPassword }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError('Invalid reset code', { status: 401 });
  }
  if (!user.resetCode || !user.resetExpiresAt || user.resetExpiresAt < new Date()) {
    throw new AuthError('Reset code expired. Request a new one.', { status: 410 });
  }
  if (user.resetAttempts >= MAX_VERIFY_ATTEMPTS) {
    throw new AuthError('Too many attempts. Request a new code.', { status: 429 });
  }
  if (user.resetCode !== hashCode(code)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetAttempts: { increment: 1 } },
    });
    throw new AuthError('Invalid reset code', { status: 401 });
  }
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetCode: null,
      resetExpiresAt: null,
      resetAttempts: 0,
      // Receiving the code proves ownership of the inbox
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
    },
  });
  return { user: sanitizeUser(updated), token: signToken(updated.id) };
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError('Invalid credentials', { status: 401 });
  }
  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw new AuthError('Invalid credentials', { status: 401 });
  }
  if (!user.emailVerified) {
    issueVerificationCode(user).catch((error) => {
      logger.error(`Verification email failed for ${email}: ${error.message}`);
    });
    throw new AuthError('Please verify your email first — we just sent you a new code.', {
      status: 403,
      requiresVerification: true,
    });
  }
  return { user: sanitizeUser(user), token: signToken(user.id) };
}

async function uniqueUsernameFrom(email) {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 24) || 'learner';
  let candidate = base;
  // Retry with a random suffix until free (collisions are rare)
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) {
      return candidate;
    }
    candidate = `${base}${crypto.randomInt(1000, 9999)}`;
  }
  return `${base}${Date.now()}`;
}

async function loginWithGoogle({ credential }) {
  if (!credential) {
    throw new AuthError('Missing Google credential', { status: 400 });
  }
  let payload;
  try {
    const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token: credential },
      timeout: 10000,
    });
    payload = response.data;
  } catch (_error) {
    throw new AuthError('Invalid Google token', { status: 401 });
  }

  const expectedAudience = process.env.GOOGLE_CLIENT_ID;
  if (!expectedAudience || payload.aud !== expectedAudience) {
    throw new AuthError('Google token audience mismatch', { status: 401 });
  }
  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    throw new AuthError('Google account email is not verified', { status: 401 });
  }

  const email = payload.email;
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Google-managed account: store an unguessable password so email/password
    // login stays disabled until the user sets one explicitly.
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashed = await bcrypt.hash(randomPassword, SALT_ROUNDS);
    user = await prisma.user.create({
      data: {
        email,
        username: await uniqueUsernameFrom(email),
        password: hashed,
        firstName: payload.given_name || null,
        lastName: payload.family_name || null,
        emailVerified: true,
      },
    });
    fireWelcomeEmail(user);
  } else if (!user.emailVerified) {
    // Google already verified this address
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationCode: null, verificationExpiresAt: null },
    });
  }
  return { user: sanitizeUser(user), token: signToken(user.id) };
}

module.exports = {
  AuthError,
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  loginWithGoogle,
};
