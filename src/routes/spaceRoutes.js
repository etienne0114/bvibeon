const express = require('express');
const spaceController = require('../controllers/spaceController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, spaceController.createSpace);
router.get('/', auth, spaceController.listSpaces);
router.post('/join/:code', auth, spaceController.joinViaInvite);
router.get('/:spaceId', auth, spaceController.getSpace);
router.post('/:spaceId/join', auth, spaceController.joinSpace);
router.post('/:spaceId/invites', auth, spaceController.createInvite);
router.post('/:spaceId/channels', auth, spaceController.createChannel);

router.get('/channels/:channelId/messages', auth, spaceController.listMessages);
router.post('/channels/:channelId/messages', auth, spaceController.postMessage);
router.post('/channels/:channelId/debate/request', auth, spaceController.requestToJoinDebate);
router.get('/channels/:channelId/debate/requests', auth, spaceController.listDebateRequests);
router.get('/channels/:channelId/debate/my-status', auth, spaceController.getMyDebateStatus);
router.post('/debate/requests/:requestId/resolve', auth, spaceController.resolveDebateRequest);

// Public — a plain <audio>/<img src> can't send an Authorization header.
router.get('/messages/:messageId/media', spaceController.getMessageMedia);

module.exports = router;
