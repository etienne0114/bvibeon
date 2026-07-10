const express = require('express');
const practiceController = require('../controllers/practiceController');

const router = express.Router();

const setNoCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
};

router.use(setNoCache);

// Vocabulary
router.get('/vocabulary/daily', practiceController.getDailyVocabulary);
router.get('/vocabulary/queue', practiceController.getVocabularyQueue);
router.post('/vocabulary/mark', practiceController.markVocabularyResult);
router.get('/vocabulary/stats', practiceController.getVocabularyStats);

// Roleplay
router.get('/roleplay/scenarios', practiceController.getRoleplayScenarios);
router.post('/roleplay/start', practiceController.startRoleplaySession);
router.post('/roleplay/message', practiceController.sendRoleplayMessage);
router.post('/roleplay/complete', practiceController.completeRoleplaySession);

// Quiz
router.post('/quiz/generate', practiceController.generateQuiz);
router.post('/quiz/submit', practiceController.submitQuizAnswer);
router.get('/quiz/history', practiceController.getQuizHistory);

// Technology
router.get('/technology/topics', practiceController.getTechnologyTopics);
router.post('/technology/start', practiceController.startTechnologySession);
router.post('/technology/message', practiceController.sendTechnologyMessage);
router.post('/technology/complete', practiceController.completeTechnologySession);

// Achievements
router.get('/achievements', practiceController.getAchievements);

module.exports = router;
