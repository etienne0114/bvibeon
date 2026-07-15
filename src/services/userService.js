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

// Step 1 of the new flow: create the account with a placeholder password and
// send the code. The real password is only set after the email is verified.
async function startRegistration({ username, email, firstName = null, lastName = null }) {
  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail && byEmail.emailVerified) {
    throw new AuthError('Email already registered. Sign in instead.');
  }
  const byUsername = await prisma.user.findUnique({ where: { username } });
  if (byUsername && byUsername.email !== email) {
    throw new AuthError('Username already taken');
  }
  let user;
  if (byEmail) {
    // Unverified account restarting sign-up: refresh identity, keep the row
    user = await prisma.user.update({
      where: { id: byEmail.id },
      data: { username, firstName, lastName },
    });
  } else {
    // Unguessable placeholder keeps password login disabled until step 3
    const placeholder = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);
    user = await prisma.user.create({
      data: { username, email, password: placeholder, firstName, lastName },
    });
  }
  let message = `We sent a 6-digit verification code to ${user.email}.`;
  try {
    await issueVerificationCode(user);
  } catch (error) {
    logger.error(`Verification email failed for ${email}: ${error.message}`);
    message = 'If the code does not arrive shortly, tap "Resend code".';
  }
  return { requiresVerification: true, email: user.email, message };
}

function assertVerificationCodeValid(user) {
  if (!user) {
    throw new AuthError('Invalid verification code', { status: 401 });
  }
  if (!user.verificationCode || !user.verificationExpiresAt || user.verificationExpiresAt < new Date()) {
    throw new AuthError('Verification code expired. Request a new one.', { status: 410 });
  }
  if (user.verificationAttempts >= MAX_VERIFY_ATTEMPTS) {
    throw new AuthError('Too many attempts. Request a new code.', { status: 429 });
  }
}

// Step 2: validate the code without consuming it, so it can still be
// presented together with the password in step 3.
async function checkVerificationCode({ email, code }) {
  const user = await prisma.user.findUnique({ where: { email } });
  assertVerificationCodeValid(user);
  if (user.verificationCode !== hashCode(code)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    });
    throw new AuthError('Invalid verification code', { status: 401 });
  }
  return { message: 'Email verified — now choose your password.' };
}

// Step 3: code + new password → account becomes verified and usable
async function completeRegistration({ email, code, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  assertVerificationCodeValid(user);
  if (user.verificationCode !== hashCode(code)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    });
    throw new AuthError('Invalid verification code', { status: 401 });
  }
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const verified = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
      verificationAttempts: 0,
    },
  });
  fireWelcomeEmail(verified);
  return { user: sanitizeUser(verified), token: signToken(verified.id) };
}

// Step 4 (optional): basic learner profile, can also be filled in later
async function updateProfile(userId, data) {
  const updated = await prisma.user.update({ where: { id: userId }, data });
  return { user: sanitizeUser(updated) };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError('Account not found', { status: 404 });
  }
  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw new AuthError('Current password is incorrect', { status: 401 });
  }
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { success: true };
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
  // Product decision: fail fast on unknown emails instead of sending blind,
  // so we never pay for emails that can't reach an account.
  if (!user) {
    throw new AuthError("This email isn't registered. Enter the email you signed up with.", { status: 404 });
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
    throw new AuthError('We could not send the email. Please try again in a moment.', { status: 502 });
  }
  return { message: `We sent a 6-digit reset code to ${user.email}.` };
}

function assertResetCodeValid(user, code) {
  if (!user) {
    throw new AuthError('That code is incorrect. Check your email and try again.', { status: 401 });
  }
  if (!user.resetCode || !user.resetExpiresAt || user.resetExpiresAt < new Date()) {
    throw new AuthError('This code has expired. Request a new one.', { status: 410 });
  }
  if (user.resetAttempts >= MAX_VERIFY_ATTEMPTS) {
    throw new AuthError('Too many wrong attempts. Request a new code.', { status: 429 });
  }
}

async function verifyResetCode({ email, code }) {
  const user = await prisma.user.findUnique({ where: { email } });
  assertResetCodeValid(user, code);
  if (user.resetCode !== hashCode(code)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetAttempts: { increment: 1 } },
    });
    throw new AuthError('That code is incorrect. Check your email and try again.', { status: 401 });
  }
  return { message: 'Code verified — choose your new password.' };
}

async function resetPassword({ email, code, newPassword }) {
  const user = await prisma.user.findUnique({ where: { email } });
  assertResetCodeValid(user, code);
  if (user.resetCode !== hashCode(code)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetAttempts: { increment: 1 } },
    });
    throw new AuthError('That code is incorrect. Check your email and try again.', { status: 401 });
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

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError('Account not found', { status: 404 });
  }
  return { user: sanitizeUser(user) };
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
  getMe,
  registerUser,
  startRegistration,
  checkVerificationCode,
  completeRegistration,
  updateProfile,
  changePassword,
  loginUser,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  loginWithGoogle,
};
