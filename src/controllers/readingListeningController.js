const readingListeningService = require('../services/readingListeningService');
const { sendServerError } = require('../utils/errors');

const isAppError = (error) => error?.constructor === Error && !error?.clientVersion && !error?.isAxiosError;

async function getPassage(req, res, skill) {
  try {
    const language = req.query.language || 'en';
    const level = req.query.level || undefined;
    const data = await readingListeningService.getPassage(req.user.id, skill, language, level);
    res.json({ success: true, data });
  } catch (error) {
    if (isAppError(error)) return res.status(400).json({ success: false, error: error.message });
    sendServerError(res, error, `Get ${skill.toLowerCase()} passage error`);
  }
}

async function submitSession(req, res, skill) {
  try {
    const { passageId, accuracy, mistakes } = req.body;
    if (!passageId || typeof accuracy !== 'number') {
      return res.status(400).json({ success: false, error: 'passageId and accuracy are required' });
    }
    const data = await readingListeningService.submitSession(req.user.id, { passageId, skill, accuracy, mistakes });
    res.json({ success: true, data });
  } catch (error) {
    if (isAppError(error)) return res.status(400).json({ success: false, error: error.message });
    sendServerError(res, error, `Submit ${skill.toLowerCase()} session error`);
  }
}

async function getStats(req, res, skill) {
  try {
    const language = req.query.language || 'en';
    const data = await readingListeningService.getStats(req.user.id, skill, language);
    res.json({ success: true, data });
  } catch (error) {
    if (isAppError(error)) return res.status(400).json({ success: false, error: error.message });
    sendServerError(res, error, `Get ${skill.toLowerCase()} stats error`);
  }
}

module.exports = {
  getReadingPassage: (req, res) => getPassage(req, res, 'READING'),
  submitReadingSession: (req, res) => submitSession(req, res, 'READING'),
  getReadingStats: (req, res) => getStats(req, res, 'READING'),
  getListeningPassage: (req, res) => getPassage(req, res, 'LISTENING'),
  submitListeningSession: (req, res) => submitSession(req, res, 'LISTENING'),
  getListeningStats: (req, res) => getStats(req, res, 'LISTENING'),
};
