const courseService = require('../services/courseService');
const { courseQuerySchema } = require('../models/schemas');

async function listCourses(req, res) {
  try {
    const query = courseQuerySchema.parse(req.query);
    const data = await courseService.getCourses(query);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  listCourses,
  getCourse,
};
