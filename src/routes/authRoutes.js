const express = require('express');
const rateLimit = require('express-rate-limit');
const { me, register, registerStart, registerCheckCode, registerComplete, updateProfile, uploadAvatar, removeAvatar, getAvatar, changePassword, login, verifyEmail, resendCode, forgotPassword, verifyResetCode, resetPassword, googleAuth } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

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
router.post('/register/start', authLimiter, registerStart);
router.post('/register/check-code', authLimiter, registerCheckCode);
router.post('/register/complete', authLimiter, registerComplete);
router.patch('/profile', auth, updateProfile);
router.patch('/avatar', auth, uploadAvatar);
router.delete('/avatar', auth, removeAvatar);
// Public — a plain <img src> can't send an Authorization header; a profile picture is meant
// to be visible wherever the user's name is, like the username itself, not access-controlled.
router.get('/avatar/:userId', getAvatar);
router.post('/change-password', auth, authLimiter, changePassword);
router.get('/me', auth, me);
router.post('/login', authLimiter, login);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-code', resendLimiter, resendCode);
router.post('/forgot-password', resendLimiter, forgotPassword);
router.post('/verify-reset-code', authLimiter, verifyResetCode);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/google', authLimiter, googleAuth);
module.exports = router;
