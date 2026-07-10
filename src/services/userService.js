const crypto = require('crypto');
const bcrypt = require('bcrypt');
const axios = require('axios');
const prisma = require('../utils/prismaClient');
const { signToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('./emailService');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function fireWelcomeEmail(user) {
  sendWelcomeEmail({ to: user.email, username: user.username }).catch((error) => {
    logger.error(`Welcome email failed for ${user.email}: ${error.message}`);
  });
}

async function registerUser({ username, email, password }) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });
  if (existing) {
    throw new Error('Email or username already registered');
  }
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
    },
  });
  fireWelcomeEmail(user);
  return { user: sanitizeUser(user), token: signToken(user.id) };
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw new Error('Invalid credentials');
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
    throw new Error('Missing Google credential');
  }
  let payload;
  try {
    const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token: credential },
      timeout: 10000,
    });
    payload = response.data;
  } catch (_error) {
    throw new Error('Invalid Google token');
  }

  const expectedAudience = process.env.GOOGLE_CLIENT_ID;
  if (!expectedAudience || payload.aud !== expectedAudience) {
    throw new Error('Google token audience mismatch');
  }
  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    throw new Error('Google account email is not verified');
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
      },
    });
    fireWelcomeEmail(user);
  }
  return { user: sanitizeUser(user), token: signToken(user.id) };
}

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
};
