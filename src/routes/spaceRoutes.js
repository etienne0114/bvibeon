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
router.patch('/:spaceId', auth, spaceController.updateSpace);
router.delete('/:spaceId', auth, spaceController.deleteSpace);
router.post('/:spaceId/leave', auth, spaceController.leaveSpace);
router.get('/:spaceId/members', auth, spaceController.listMembers);
router.patch('/:spaceId/members/:userId/role', auth, spaceController.updateMemberRole);
router.delete('/:spaceId/members/:userId', auth, spaceController.removeMember);
router.post('/:spaceId/transfer/:userId', auth, spaceController.transferOwnership);
router.post('/:spaceId/channels', auth, spaceController.createChannel);

router.patch('/channels/:channelId', auth, spaceController.updateChannel);
router.delete('/channels/:channelId', auth, spaceController.deleteChannel);
router.get('/channels/:channelId/messages', auth, spaceController.listMessages);
router.post('/channels/:channelId/messages', auth, spaceController.postMessage);
router.delete('/channels/:channelId/messages/:messageId', auth, spaceController.deleteMessage);
router.get('/messages/:messageId/replies', auth, spaceController.listReplies);
router.post('/channels/:channelId/debate/request', auth, spaceController.requestToJoinDebate);
router.get('/channels/:channelId/debate/requests', auth, spaceController.listDebateRequests);
router.get('/channels/:channelId/debate/participants', auth, spaceController.listApprovedDebateParticipants);
router.get('/channels/:channelId/debate/roster', auth, spaceController.listAllDebateParticipants);
router.get('/channels/:channelId/debate/my-status', auth, spaceController.getMyDebateStatus);
router.post('/debate/requests/:requestId/resolve', auth, spaceController.resolveDebateRequest);
router.post('/debate/requests/:requestId/revoke', auth, spaceController.revokeDebateApproval);
router.post('/channels/:channelId/debate/vote', auth, spaceController.castDebateVote);
router.get('/channels/:channelId/debate/vote', auth, spaceController.getDebateVoteTally);
router.post('/messages/:messageId/reactions', auth, spaceController.toggleMessageReaction);

// Public — a plain <audio>/<img src> can't send an Authorization header.
router.get('/messages/:messageId/media', spaceController.getMessageMedia);

module.exports = router;
