const practiceService = require('../services/practiceService');
const { sendServerError } = require('../utils/errors');

// Our own `throw new Error('Scenario not found')`-style messages (and the
// STT/AI failure messages we deliberately wrote to be shown as-is) are safe
// to return directly. Restricting to the plain `Error` constructor (not
// TypeError/ReferenceError etc.) keeps genuine bugs from leaking their raw
// message too — those still go through sendServerError's sanitizing.
const isAppError = (error) => error?.constructor === Error && !error?.clientVersion && !error?.isAxiosError;


async function getDailyVocabulary(req, res) {
  try {
    const language = req.query.language || 'en';
    const entry = await practiceService.getDailyVocabulary(req.user.id, language);
    res.json({ success: true, data: entry });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get daily vocabulary error');
  }
}

async function getVocabularyQueue(req, res) {
  try {
    const language = req.query.language || 'en';
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 8);
    const queue = await practiceService.getSpacedRepetitionQueue(req.user.id, language, limit);
    res.json({ success: true, data: queue });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get vocabulary queue error');
  }
}

async function markVocabularyResult(req, res) {
  try {
    const { vocabularyItemId, correct } = req.body;
    if (!vocabularyItemId || typeof correct !== 'boolean') {
      return res.status(400).json({ success: false, error: 'vocabularyItemId and correct flag are required' });
    }
    const result = await practiceService.markVocabularyResult(req.user.id, vocabularyItemId, correct);
    res.json({ success: true, data: result });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Mark vocabulary result error');
  }
}

async function getVocabularyStats(req, res) {
  try {
    const stats = await practiceService.getVocabularyStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get vocabulary stats error');
  }
}

async function getRoleplayScenarios(req, res) {
  try {
    const category = req.query.category;
    const scenarios = await practiceService.getRoleplayScenarios(category);
    res.json({ success: true, data: scenarios });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get roleplay scenarios error');
  }
}

async function startRoleplaySession(req, res) {
  try {
    const { scenarioId, language } = req.body;
    if (!scenarioId) {
      return res.status(400).json({ success: false, error: 'scenarioId is required' });
    }
    const session = await practiceService.startRoleplaySession(req.user.id, scenarioId, language);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Start roleplay session error');
  }
}

async function sendRoleplayMessage(req, res) {
  try {
    const { sessionId, message, language, audio } = req.body;
    if (!sessionId || (!message && !audio)) {
      return res.status(400).json({ success: false, error: 'sessionId and either message or audio are required' });
    }

    let audioBuffer = null;
    if (audio) {
      audioBuffer = Buffer.from(audio, 'base64');
    }

    const reply = await practiceService.sendRoleplayMessage(req.user.id, sessionId, message, language, audioBuffer);
    res.json({ success: true, data: reply });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Send roleplay message error');
  }
}

async function completeRoleplaySession(req, res) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }
    const result = await practiceService.completeRoleplaySession(req.user.id, sessionId);
    res.json({ success: true, data: result });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Complete roleplay session error');
  }
}

async function generateQuiz(req, res) {
  try {
    const { topic, language, count } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, error: 'topic is required' });
    }
    const quiz = await practiceService.generateQuiz(req.user.id, topic, language, count || 5);
    res.json({ success: true, data: quiz });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Generate quiz error');
  }
}

async function submitQuizAnswer(req, res) {
  try {
    const { quizId, answers } = req.body;
    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'quizId and answers array are required' });
    }
    const result = await practiceService.submitQuizAnswer(req.user.id, quizId, answers);
    res.json({ success: true, data: result });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Submit quiz answer error');
  }
}

async function getQuizHistory(req, res) {
  try {
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
    const history = await practiceService.getQuizHistory(req.user.id, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get quiz history error');
  }
}

async function getTechnologyTopics(req, res) {
  try {
    const category = req.query.category;
    const topics = await practiceService.getTechnologyTopics(category);
    res.json({ success: true, data: topics });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get technology topics error');
  }
}

async function startTechnologySession(req, res) {
  try {
    const { topicId, language } = req.body;
    if (!topicId) {
      return res.status(400).json({ success: false, error: 'topicId is required' });
    }
    const session = await practiceService.startTechnologySession(req.user.id, topicId, language);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Start technology session error');
  }
}

async function sendTechnologyMessage(req, res) {
  try {
    const { sessionId, message, language, audio } = req.body;
    if (!sessionId || (!message && !audio)) {
      return res.status(400).json({ success: false, error: 'sessionId and either message or audio are required' });
    }

    let audioBuffer = null;
    if (audio) {
      audioBuffer = Buffer.from(audio, 'base64');
    }

    const reply = await practiceService.sendTechnologyMessage(req.user.id, sessionId, message, language, audioBuffer);
    res.json({ success: true, data: reply });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Send technology message error');
  }
}

async function completeTechnologySession(req, res) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }
    const result = await practiceService.completeTechnologySession(req.user.id, sessionId);
    res.json({ success: true, data: result });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Complete technology session error');
  }
}

async function getAchievements(req, res) {
  try {
    const achievements = await practiceService.getAchievements(req.user.id);
    res.json({ success: true, data: achievements });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get achievements error');
  }
}

module.exports = {
  getDailyVocabulary,
  getVocabularyQueue,
  markVocabularyResult,
  getVocabularyStats,
  getRoleplayScenarios,
  startRoleplaySession,
  sendRoleplayMessage,
  completeRoleplaySession,
  generateQuiz,
  submitQuizAnswer,
  getQuizHistory,
  getTechnologyTopics,
  startTechnologySession,
  sendTechnologyMessage,
  completeTechnologySession,
  getAchievements,
};
