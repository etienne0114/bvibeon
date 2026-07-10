const progressService = require('../services/progressService');
const { progressSchema } = require('../models/schemas');

async function enroll(req, res) {
  try {
    const { courseId } = req.body;
    const enrollment = await progressService.enrollInCourse(req.user.id, courseId);
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

async function track(req, res) {
  try {
    const payload = progressSchema.parse(req.body);
    const progress = await progressService.trackLessonProgress(req.user.id, payload);
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

async function getProgress(req, res) {
  try {
    const progress = await progressService.getUserProgress(req.user.id);
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  enroll,
  track,
  getProgress,
};
