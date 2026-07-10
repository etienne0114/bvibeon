const express = require('express');
const learnController = require('../controllers/learnController');
const { auth } = require('../middleware/auth');
const dictionaryRoutes = require('./dictionaryRoutes');
const practiceRoutes = require('./practiceRoutes');

const router = express.Router();
router.get('/dashboard', auth, learnController.getDashboard);
router.get('/courses/search', auth, learnController.searchCourses);
router.post('/paths', auth, learnController.generatePath);
router.get('/analytics', auth, learnController.getAnalytics);
router.get('/motivation', auth, learnController.getMotivation);
router.get('/practices', auth, learnController.getPractices);
router.post('/practices/sessions', auth, learnController.startPracticeSession);
router.use('/dictionary', dictionaryRoutes);
router.use('/practice', auth, practiceRoutes);
module.exports = router;
