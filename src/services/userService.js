const bcrypt = require('bcrypt');
const prisma = require('../utils/prismaClient');
const { signToken } = require('../middleware/auth');

const SALT_ROUNDS = 10;

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
  return { user, token: signToken(user.id) };
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
  return { user, token: signToken(user.id) };
}

module.exports = {
  registerUser,
  loginUser,
};
