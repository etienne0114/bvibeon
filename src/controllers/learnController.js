const learnService = require('../services/learnService');

async function getDashboard(req, res) {
  try {
    const data = await learnService.getLearningDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    res.status(400).json({ success: false, error: error.message });
  }
}

async function generatePath(req, res) {
  try {
    const { goal, level } = req.body;
    const path = await learnService.generateLearningPath(req.user.id, goal, level);
    res.json({ success: true, data: path });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

async function getAnalytics(req, res) {
  try {
    const data = await learnService.getLearningAnalytics(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getMotivation(req, res) {
  try {
    const data = await learnService.getLearningMotivation(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getPractices(req, res) {
  try {
    const data = await learnService.getPracticeModules(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function startPracticeSession(req, res) {
  try {
    const { moduleId } = req.body;
    const data = await learnService.startPracticeSession(req.user.id, moduleId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
