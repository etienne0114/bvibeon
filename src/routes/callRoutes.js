const express = require('express');
const callController = require('../controllers/callController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.get('/channel/:channelId', auth, callController.getActiveCall);
router.post('/channel/:channelId/join', auth, callController.joinCall);
router.post('/:callSessionId/leave', auth, callController.leaveCall);
router.post('/:callSessionId/signal', auth, callController.sendSignal);
router.get('/:callSessionId/signals', auth, callController.pollSignals);
module.exports = router;
