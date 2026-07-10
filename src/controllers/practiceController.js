const practiceService = require('../services/practiceService');

async function getDailyVocabulary(req, res) {
  try {
    const language = req.query.language || 'en';
    const entry = await practiceService.getDailyVocabulary(req.user.id, language);
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getVocabularyQueue(req, res) {
  try {
    const language = req.query.language || 'en';
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 8);
    const queue = await practiceService.getSpacedRepetitionQueue(req.user.id, language, limit);
    res.json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getVocabularyStats(req, res) {
  try {
    const stats = await practiceService.getVocabularyStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getRoleplayScenarios(req, res) {
  try {
    const category = req.query.category;
    const scenarios = await practiceService.getRoleplayScenarios(category);
    res.json({ success: true, data: scenarios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getQuizHistory(req, res) {
  try {
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
    const history = await practiceService.getQuizHistory(req.user.id, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getTechnologyTopics(req, res) {
  try {
    const category = req.query.category;
    const topics = await practiceService.getTechnologyTopics(category);
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getAchievements(req, res) {
  try {
    const achievements = await practiceService.getAchievements(req.user.id);
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
