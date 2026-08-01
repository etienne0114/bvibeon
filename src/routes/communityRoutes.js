const express = require('express');
const communityController = require('../controllers/communityController');
const audioContributionRoutes = require('./audioContributionRoutes');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.post('/sentences', auth, communityController.submitSentence);
router.get('/sentences/to-correct', auth, communityController.getSentenceToCorrect);
router.post('/sentences/:submissionId/correct', auth, communityController.submitCorrection);
router.get('/sentences/mine', auth, communityController.getMySubmissions);
router.get('/stats', auth, communityController.getStats);
router.use('/audio', audioContributionRoutes);
module.exports = router;
