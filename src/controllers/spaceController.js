const spaceService = require('../services/spaceService');
const { sendServerError } = require('../utils/errors');

const isAppError = (error) => error?.constructor === Error && !error?.clientVersion;
const handle = (res, error, context) => {
  if (isAppError(error)) return res.status(400).json({ success: false, error: error.message });
  sendServerError(res, error, context);
};

async function createSpace(req, res) {
  try {
    const space = await spaceService.createSpace(req.user.id, req.body);
    res.status(201).json({ success: true, data: space });
  } catch (error) {
    handle(res, error, 'Create space error');
  }
}

async function listSpaces(req, res) {
  try {
    const spaces = await spaceService.listSpacesForUser(req.user.id);
    res.json({ success: true, data: spaces });
  } catch (error) {
    handle(res, error, 'List spaces error');
  }
}

async function getSpace(req, res) {
  try {
    const space = await spaceService.getSpace(req.user.id, req.params.spaceId);
    if (!space) return res.status(404).json({ success: false, error: 'Space not found' });
    res.json({ success: true, data: space });
  } catch (error) {
    handle(res, error, 'Get space error');
  }
}

async function joinSpace(req, res) {
  try {
    const membership = await spaceService.joinPublicSpace(req.user.id, req.params.spaceId);
    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    handle(res, error, 'Join space error');
  }
}

async function createInvite(req, res) {
  try {
    const invite = await spaceService.createInvite(req.user.id, req.params.spaceId);
    res.status(201).json({ success: true, data: invite });
  } catch (error) {
    handle(res, error, 'Create invite error');
  }
}

async function joinViaInvite(req, res) {
  try {
    const result = await spaceService.joinViaInvite(req.user.id, req.params.code);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    handle(res, error, 'Join via invite error');
  }
}

async function updateSpace(req, res) {
  try {
    const space = await spaceService.updateSpace(req.user.id, req.params.spaceId, req.body);
    res.json({ success: true, data: space });
  } catch (error) {
    handle(res, error, 'Update space error');
  }
}

async function deleteSpace(req, res) {
  try {
    await spaceService.deleteSpace(req.user.id, req.params.spaceId);
    res.json({ success: true });
  } catch (error) {
    handle(res, error, 'Delete space error');
  }
}

async function listMembers(req, res) {
  try {
    const members = await spaceService.listMembers(req.user.id, req.params.spaceId);
    res.json({ success: true, data: members });
  } catch (error) {
    handle(res, error, 'List members error');
  }
}

async function updateMemberRole(req, res) {
  try {
    const { role } = req.body;
    const membership = await spaceService.updateMemberRole(req.user.id, req.params.spaceId, req.params.userId, role);
    res.json({ success: true, data: membership });
  } catch (error) {
    handle(res, error, 'Update member role error');
  }
}

async function removeMember(req, res) {
  try {
    await spaceService.removeMember(req.user.id, req.params.spaceId, req.params.userId);
    res.json({ success: true });
  } catch (error) {
    handle(res, error, 'Remove member error');
  }
}

async function leaveSpace(req, res) {
  try {
    await spaceService.leaveSpace(req.user.id, req.params.spaceId);
    res.json({ success: true });
  } catch (error) {
    handle(res, error, 'Leave space error');
  }
}

async function transferOwnership(req, res) {
  try {
    await spaceService.transferOwnership(req.user.id, req.params.spaceId, req.params.userId);
    res.json({ success: true });
  } catch (error) {
    handle(res, error, 'Transfer ownership error');
  }
}

async function updateChannel(req, res) {
  try {
    const channel = await spaceService.updateChannel(req.user.id, req.params.channelId, req.body);
    res.json({ success: true, data: channel });
  } catch (error) {
    handle(res, error, 'Update channel error');
  }
}

async function deleteChannel(req, res) {
  try {
    await spaceService.deleteChannel(req.user.id, req.params.channelId);
    res.json({ success: true });
  } catch (error) {
    handle(res, error, 'Delete channel error');
  }
}

async function deleteMessage(req, res) {
  try {
    await spaceService.deleteMessage(req.user.id, req.params.messageId);
    res.json({ success: true });
  } catch (error) {
    handle(res, error, 'Delete message error');
  }
}

async function createChannel(req, res) {
  try {
    const channel = await spaceService.createChannel(req.user.id, req.params.spaceId, req.body);
    res.status(201).json({ success: true, data: channel });
  } catch (error) {
    handle(res, error, 'Create channel error');
  }
}

async function listMessages(req, res) {
  try {
    const result = await spaceService.listMessages(req.user.id, req.params.channelId);
    res.json({ success: true, data: result });
  } catch (error) {
    handle(res, error, 'List messages error');
  }
}

async function postMessage(req, res) {
  try {
    const { type, text, media, mimeType, parentMessageId } = req.body;
    const message = await spaceService.postMessage(req.user.id, req.params.channelId, {
      type,
      text,
      mediaBase64: media,
      mimeType,
      parentMessageId,
    });
    res.status(201).json({ success: true, data: { ...message, mediaData: undefined } });
  } catch (error) {
    handle(res, error, 'Post message error');
  }
}

async function listReplies(req, res) {
  try {
    const result = await spaceService.listReplies(req.user.id, req.params.messageId);
    res.json({ success: true, data: result });
  } catch (error) {
    handle(res, error, 'List replies error');
  }
}

async function getMessageMedia(req, res) {
  try {
    const message = await spaceService.getMessageMedia(req.params.messageId);
    if (!message || !message.mediaData) return res.status(404).json({ success: false, error: 'Not found' });
    res.set('Content-Type', message.mimeType || 'application/octet-stream');
    res.set('Cache-Control', 'private, max-age=86400');
    res.send(Buffer.from(message.mediaData, 'base64'));
  } catch (error) {
    handle(res, error, 'Get message media error');
  }
}

async function requestToJoinDebate(req, res) {
  try {
    const request = await spaceService.requestToJoinDebate(req.user.id, req.params.channelId);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    handle(res, error, 'Request to join debate error');
  }
}

async function listDebateRequests(req, res) {
  try {
    const requests = await spaceService.listDebateRequests(req.user.id, req.params.channelId);
    res.json({ success: true, data: requests });
  } catch (error) {
    handle(res, error, 'List debate requests error');
  }
}

async function listApprovedDebateParticipants(req, res) {
  try {
    const participants = await spaceService.listApprovedDebateParticipants(req.user.id, req.params.channelId);
    res.json({ success: true, data: participants });
  } catch (error) {
    handle(res, error, 'List approved debate participants error');
  }
}

async function listAllDebateParticipants(req, res) {
  try {
    const roster = await spaceService.listAllDebateParticipants(req.user.id, req.params.channelId);
    res.json({ success: true, data: roster });
  } catch (error) {
    handle(res, error, 'List debate roster error');
  }
}

async function revokeDebateApproval(req, res) {
  try {
    const request = await spaceService.revokeDebateApproval(req.user.id, req.params.requestId);
    res.json({ success: true, data: request });
  } catch (error) {
    handle(res, error, 'Revoke debate approval error');
  }
}

async function resolveDebateRequest(req, res) {
  try {
    const { approve, side } = req.body;
    const request = await spaceService.resolveDebateRequest(req.user.id, req.params.requestId, Boolean(approve), side);
    res.json({ success: true, data: request });
  } catch (error) {
    handle(res, error, 'Resolve debate request error');
  }
}

async function getMyDebateStatus(req, res) {
  try {
    const status = await spaceService.getMyDebateStatus(req.user.id, req.params.channelId);
    res.json({ success: true, data: { status } });
  } catch (error) {
    handle(res, error, 'Get debate status error');
  }
}

async function toggleMessageReaction(req, res) {
  try {
    const reactions = await spaceService.toggleMessageReaction(req.user.id, req.params.messageId, req.body.emoji);
    res.json({ success: true, data: reactions });
  } catch (error) {
    handle(res, error, 'Toggle message reaction error');
  }
}

async function castDebateVote(req, res) {
  try {
    const tally = await spaceService.castDebateVote(req.user.id, req.params.channelId, req.body.side);
    res.json({ success: true, data: tally });
  } catch (error) {
    handle(res, error, 'Cast debate vote error');
  }
}

async function getDebateVoteTally(req, res) {
  try {
    const tally = await spaceService.getDebateVoteTally(req.user.id, req.params.channelId);
    res.json({ success: true, data: tally });
  } catch (error) {
    handle(res, error, 'Get debate vote tally error');
  }
}

module.exports = {
  createSpace,
  listSpaces,
  getSpace,
  joinSpace,
  createInvite,
  joinViaInvite,
  updateSpace,
  deleteSpace,
  listMembers,
  updateMemberRole,
  removeMember,
  leaveSpace,
  transferOwnership,
  createChannel,
  updateChannel,
  deleteChannel,
  listMessages,
  postMessage,
  listReplies,
  getMessageMedia,
  deleteMessage,
  requestToJoinDebate,
  listDebateRequests,
  listApprovedDebateParticipants,
  listAllDebateParticipants,
  revokeDebateApproval,
  resolveDebateRequest,
  getMyDebateStatus,
  toggleMessageReaction,
  castDebateVote,
  getDebateVoteTally,
};
