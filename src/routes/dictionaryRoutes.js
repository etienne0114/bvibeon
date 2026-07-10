const express = require('express');
const dictionaryController = require('../controllers/dictionaryController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.get('/word/:word', auth, dictionaryController.getWordDefinition);
router.get('/search', auth, dictionaryController.searchVocabulary);
router.get('/recommendations', auth, dictionaryController.getVocabularyRecommendations);
router.get('/recent', auth, dictionaryController.getRecentVocabulary);
router.post('/daily-vocabulary', auth, dictionaryController.getDailyVocabulary);
router.get('/translate', auth, dictionaryController.translateText);
router.post('/translate-entry', auth, dictionaryController.translateEntry);
module.exports = router;
