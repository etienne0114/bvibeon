const userService = require('../services/userService');
const { registerSchema, loginSchema } = require('../models/schemas');

async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await userService.registerUser(data);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

async function login(req, res) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await userService.loginUser(data);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

module.exports = {
  register,
  login,
};
