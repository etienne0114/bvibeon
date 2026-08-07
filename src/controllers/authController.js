const userService = require('../services/userService');
const logger = require('../utils/logger');
const { registerSchema, registerStartSchema, registerCompleteSchema, profileSchema, avatarSchema, loginSchema, changePasswordSchema, verifyEmailSchema, resendCodeSchema, forgotPasswordSchema, resetPasswordSchema } = require('../models/schemas');

function handleAuthError(res, error) {
  // Zod validation errors: surface the first human-readable issue
  if (Array.isArray(error?.issues) && error.issues.length > 0) {
    return res.status(400).json({ success: false, error: error.issues[0].message });
  }
  // Known auth errors carry their own status and safe message
  if (error instanceof userService.AuthError) {
    return res.status(error.status || 400).json({
      success: false,
      error: error.message,
      ...(error.requiresVerification ? { requiresVerification: true } : {}),
    });
  }
  // Anything else is unexpected: log it, never leak internals to the user
  logger.error(`Auth error: ${error.message}`);
  return res.status(500).json({ success: false, error: 'Something went wrong on our side. Please try again.' });
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

async function registerStart(req, res) {
  try {
    const data = registerStartSchema.parse(req.body);
    const result = await userService.startRegistration(data);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function registerCheckCode(req, res) {
  try {
    const data = verifyEmailSchema.parse(req.body);
    const result = await userService.checkVerificationCode(data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function registerComplete(req, res) {
  try {
    const data = registerCompleteSchema.parse(req.body);
    const result = await userService.completeRegistration(data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function updateProfile(req, res) {
  try {
    const data = profileSchema.parse(req.body);
    const result = await userService.updateProfile(req.user.id, data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function uploadAvatar(req, res) {
  try {
    const { avatarBase64, mimeType } = avatarSchema.parse(req.body);
    const result = await userService.uploadAvatar(req.user.id, avatarBase64, mimeType);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function removeAvatar(req, res) {
  try {
    const result = await userService.removeAvatar(req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function getAvatar(req, res) {
  try {
    const user = await userService.getAvatarFile(req.params.userId);
    if (!user || !user.avatarData) return res.status(404).json({ success: false, error: 'Not found' });
    res.set('Content-Type', user.avatarMimeType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(user.avatarData, 'base64'));
  } catch (error) {
    logger.error(`Get avatar error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Something went wrong on our side. Please try again.' });
  }
}

async function changePassword(req, res) {
  try {
    const data = changePasswordSchema.parse(req.body);
    const result = await userService.changePassword(req.user.id, data);
    res.json({ success: true, ...result });
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

async function forgotPassword(req, res) {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await userService.requestPasswordReset(data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function verifyResetCode(req, res) {
  try {
    const data = verifyEmailSchema.parse(req.body);
    const result = await userService.verifyResetCode(data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function resetPassword(req, res) {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await userService.resetPassword(data);
    res.json({ success: true, ...result });
  } catch (error) {
    handleAuthError(res, error);
  }
}

async function me(req, res) {
  try {
    const result = await userService.getMe(req.user.id);
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
  me,
  register,
  registerStart,
  registerCheckCode,
  registerComplete,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getAvatar,
  changePassword,
  login,
  verifyEmail,
  resendCode,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  googleAuth,
};
