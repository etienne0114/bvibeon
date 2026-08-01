const placementTestService = require('../services/placementTestService');
const { sendServerError } = require('../utils/errors');

const isAppError = (error) => error?.constructor === Error && !error?.clientVersion;

async function getQuestions(req, res) {
  try {
    const questions = await placementTestService.getQuestions();
    res.json({ success: true, data: questions });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get placement test error');
  }
}

async function submit(req, res) {
  try {
    const { answers } = req.body;
    const result = await placementTestService.submit(req.user.id, answers);
    res.json({ success: true, data: result });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Submit placement test error');
  }
}

module.exports = { getQuestions, submit };
