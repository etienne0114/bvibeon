const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

// No fallback: this repo is public, so any hardcoded default would be a
// publicly-known signing secret, letting anyone forge a valid token for any
// userId. Fail loudly at startup instead of silently signing/verifying
// tokens with a secret the whole world can read on GitHub.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required and must not be empty.');
}

async function auth(req, res, next) {
  try {
    const header = req.header('Authorization');
    if (!header) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
    const token = header.replace('Bearer ', '').trim();
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication required' });
  }
}

async function optionalAuth(req, _res, next) {
  try {
    const header = req.header('Authorization');
    if (!header) {
      req.user = null;
      return next();
    }
    const token = header.replace('Bearer ', '').trim();
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }
  next();
}

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

module.exports = {
  auth,
  optionalAuth,
  signToken,
};
