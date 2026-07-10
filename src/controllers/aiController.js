const aiService = require('../services/aiService');

async function chat(req, res) {
  try {
    const { message } = req.body;
    const data = await aiService.chatWithTutor({ userId: req.user.id, message });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  chat,
};
