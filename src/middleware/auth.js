const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'learn-jwt-secret';

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
