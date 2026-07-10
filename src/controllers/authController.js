const userService = require('../services/userService');
const { registerSchema, loginSchema, verifyEmailSchema, resendCodeSchema } = require('../models/schemas');

function handleAuthError(res, error) {
  const status = error.status || 400;
  res.status(status).json({
    success: false,
    error: error.message,
    ...(error.requiresVerification ? { requiresVerification: true } : {}),
  });
}

async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await userService.registerUser(data);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function login(req, res) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await userService.loginUser(data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function verifyEmail(req, res) {
  try {
    const data = verifyEmailSchema.parse(req.body);
    const result = await userService.verifyEmail(data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function resendCode(req, res) {
  try {
    const data = resendCodeSchema.parse(req.body);
    const result = await userService.resendVerification(data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function googleAuth(req, res) {
  try {
    const result = await userService.loginWithGoogle({ credential: req.body?.credential });
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

module.exports = {
  register,
  login,
  verifyEmail,
  resendCode,
  googleAuth,
};
