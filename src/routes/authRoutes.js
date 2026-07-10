const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, verifyEmail, resendCode, googleAuth } = require('../controllers/authController');

// Auth endpoints are the main brute-force target — keep limits tight
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Try again in a few minutes.' },
});

// Sending email costs money — resend gets an extra-tight limit
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many code requests. Try again later.' },
});

const router = express.Router();
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-code', resendLimiter, resendCode);
router.post('/google', authLimiter, googleAuth);
module.exports = router;
