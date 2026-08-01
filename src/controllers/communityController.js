const communityService = require('../services/communityService');
const { sendServerError } = require('../utils/errors');

const isAppError = (error) => error?.constructor === Error && !error?.clientVersion;

async function submitSentence(req, res) {
  try {
    const { language, text } = req.body;
    const submission = await communityService.submitSentence(req.user.id, language, text);
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Submit sentence error');
  }
}

async function getSentenceToCorrect(req, res) {
  try {
    const language = req.query.language || 'en';
    const sentence = await communityService.getSentenceToCorrect(req.user.id, language);
    res.json({ success: true, data: sentence });
  } catch (error) {
    sendServerError(res, error, 'Get sentence to correct error');
  }
}

async function submitCorrection(req, res) {
  try {
    const { correctedText, note } = req.body;
    const correction = await communityService.submitCorrection(req.user.id, req.params.submissionId, correctedText, note);
    res.status(201).json({ success: true, data: correction });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Submit correction error');
  }
}

async function getMySubmissions(req, res) {
  try {
    const submissions = await communityService.getMySubmissions(req.user.id);
    res.json({ success: true, data: submissions });
  } catch (error) {
    sendServerError(res, error, 'Get my submissions error');
  }
}

async function getStats(req, res) {
  try {
    const stats = await communityService.getStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    sendServerError(res, error, 'Get community stats error');
  }
}

module.exports = { submitSentence, getSentenceToCorrect, submitCorrection, getMySubmissions, getStats };
