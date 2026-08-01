const learningPathService = require('../services/learningPathService');
const { sendServerError } = require('../utils/errors');

const isAppError = (error) => error?.constructor === Error && !error?.clientVersion;

async function listPaths(req, res) {
  try {
    const paths = await learningPathService.listPathsForUser(req.user?.id, { difficulty: req.query.difficulty });
    res.json({ success: true, data: paths });
  } catch (error) {
    sendServerError(res, error, 'List paths error');
  }
}

async function getPath(req, res) {
  try {
    const path = await learningPathService.getPathWithProgress(req.user?.id, req.params.pathId);
    if (!path) {
      return res.status(404).json({ success: false, error: 'Learning path not found' });
    }
    res.json({ success: true, data: path });
  } catch (error) {
    sendServerError(res, error, 'Get path error');
  }
}

async function enroll(req, res) {
  try {
    const enrollment = await learningPathService.enrollUser(req.user.id, req.params.pathId);
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Enroll in path error');
  }
}

module.exports = { listPaths, getPath, enroll };
