const express = require('express');
const controller = require('../controllers/readingListeningController');

const router = express.Router();

router.get('/reading/passage', controller.getReadingPassage);
router.post('/reading/sessions', controller.submitReadingSession);
router.get('/reading/stats', controller.getReadingStats);

router.get('/listening/passage', controller.getListeningPassage);
router.post('/listening/sessions', controller.submitListeningSession);
router.get('/listening/stats', controller.getListeningStats);

module.exports = router;
