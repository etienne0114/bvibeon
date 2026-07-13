const courseService = require('../services/courseService');
const { courseQuerySchema } = require('../models/schemas');
const { sendServerError } = require('../utils/errors');

async function listCourses(req, res) {
  try {
    const query = courseQuerySchema.parse(req.query);
    const data = await courseService.getCourses(query);
    res.json({ success: true, ...data });
  } catch (error) {
    if (Array.isArray(error?.issues)) {
      return res.status(400).json({ success: false, error: error.issues[0].message });
    }
    sendServerError(res, error, 'List courses error');
  }
}

async function getCourse(req, res) {
  try {
    const course = await courseService.getCourseById(req.params.courseId, req.user?.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    sendServerError(res, error, 'Get course error');
  }
}

module.exports = {
  listCourses,
  getCourse,
};
