const learnService = require('../services/learnService');
const { sendServerError } = require('../utils/errors');

async function getDashboard(req, res) {
  try {
    const data = await learnService.getLearningDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    sendServerError(res, error, 'Dashboard service error');
  }
}

async function searchCourses(req, res) {
  try {
    const data = await learnService.searchCourses({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      level: req.query.level,
      search: req.query.search,
    });
    res.json({ success: true, data });
  } catch (error) {
    sendServerError(res, error, 'Search courses error');
  }
}

async function generatePath(req, res) {
  try {
    const { goal, level } = req.body;
    const path = await learnService.generateLearningPath(req.user.id, goal, level);
    res.json({ success: true, data: path });
  } catch (error) {
    sendServerError(res, error, 'Generate path error');
  }
}

async function getAnalytics(req, res) {
  try {
    const data = await learnService.getLearningAnalytics(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    sendServerError(res, error, 'Analytics service error');
  }
}

async function getMotivation(req, res) {
  try {
    const data = await learnService.getLearningMotivation(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    sendServerError(res, error, 'Motivation service error');
  }
}

async function getPractices(req, res) {
  try {
    const data = await learnService.getPracticeModules(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    sendServerError(res, error, 'Practices service error');
  }
}

async function startPracticeSession(req, res) {
  try {
    const { moduleId } = req.body;
    const data = await learnService.startPracticeSession(req.user.id, moduleId);
    res.json({ success: true, data });
  } catch (error) {
    sendServerError(res, error, 'Start practice session error');
  }
}

module.exports = {
  getDashboard,
  searchCourses,
  generatePath,
  getAnalytics,
  getMotivation,
  getPractices,
  startPracticeSession,
};
