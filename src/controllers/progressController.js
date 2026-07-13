const progressService = require('../services/progressService');
const { progressSchema } = require('../models/schemas');
const { sendServerError } = require('../utils/errors');

// Our own `throw new Error('Course not found')`-style messages are safe to
// show as-is; anything carrying Prisma's `clientVersion` is a driver/DB
// error whose raw text (hostnames, internals) must never reach the client.
const isAppError = (error) => !error?.clientVersion;

async function enroll(req, res) {
  try {
    const { courseId } = req.body;
    const enrollment = await progressService.enrollInCourse(req.user.id, courseId);
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Enroll error');
  }
}

async function track(req, res) {
  try {
    const payload = progressSchema.parse(req.body);
    const progress = await progressService.trackLessonProgress(req.user.id, payload);
    res.json({ success: true, data: progress });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Track progress error');
  }
}

async function getProgress(req, res) {
  try {
    const progress = await progressService.getUserProgress(req.user.id);
    res.json({ success: true, data: progress });
  } catch (error) {
    sendServerError(res, error, 'Get progress error');
  }
}

module.exports = {
  enroll,
  track,
  getProgress,
};
