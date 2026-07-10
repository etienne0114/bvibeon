const express = require('express');
const { listCourses, getCourse } = require('../controllers/courseController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.get('/', auth, listCourses);
router.get('/:courseId', auth, getCourse);
module.exports = router;
