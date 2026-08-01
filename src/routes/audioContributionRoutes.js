const express = require('express');
const audioContributionController = require('../controllers/audioContributionController');
const { auth } = require('../middleware/auth');

const router = express.Router();
// Playback and listing are public — a plain <audio src> tag can't send an
// Authorization header, and there's no sensitive data here once
// contributed. Submitting/reporting/listing your own still require auth.
router.get('/', audioContributionController.listAudioForWord);
router.get('/mine', auth, audioContributionController.getMyAudio);
router.get('/:id/file', audioContributionController.getAudioFile);
router.post('/', auth, audioContributionController.submitAudio);
router.post('/:id/report', auth, audioContributionController.reportAudio);
module.exports = router;
