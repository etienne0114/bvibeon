const callService = require('../services/callService');
const { sendServerError } = require('../utils/errors');

const isAppError = (error) => error?.constructor === Error && !error?.clientVersion;
const handle = (res, error, context) => {
  if (isAppError(error)) return res.status(400).json({ success: false, error: error.message });
  sendServerError(res, error, context);
};

async function getActiveCall(req, res) {
  try {
    const call = await callService.getActiveCall(req.user.id, req.params.channelId);
    res.json({ success: true, data: call });
  } catch (error) {
    handle(res, error, 'Get active call error');
  }
}

async function joinCall(req, res) {
  try {
    const { speakingMode, speakerTimeSec, topic, requireApproval, autoMuteOnJoin } = req.body || {};
    const result = await callService.joinCall(req.user.id, req.params.channelId, {
      speakingMode,
      speakerTimeSec,
      topic,
      requireApproval,
      autoMuteOnJoin,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    handle(res, error, 'Join call error');
  }
}

async function leaveCall(req, res) {
  try {
    await callService.leaveCall(req.user.id, req.params.callSessionId);
    res.json({ success: true });
  } catch (error) {
    handle(res, error, 'Leave call error');
  }
}

async function sendSignal(req, res) {
  try {
    const { type, toUserId, payload } = req.body;
    const signal = await callService.sendSignal(req.user.id, req.params.callSessionId, { type, toUserId, payload });
    res.status(201).json({ success: true, data: { id: signal.id } });
  } catch (error) {
    handle(res, error, 'Send signal error');
  }
}

async function pollSignals(req, res) {
  try {
    const signals = await callService.pollSignals(req.user.id, req.params.callSessionId, req.query.since);
    res.json({ success: true, data: signals });
  } catch (error) {
    handle(res, error, 'Poll signals error');
  }
}

async function getCallState(req, res) {
  try {
    const state = await callService.getCallState(req.user.id, req.params.callSessionId);
    res.json({ success: true, data: state });
  } catch (error) {
    handle(res, error, 'Get call state error');
  }
}

async function raiseHand(req, res) {
  try {
    const state = await callService.raiseHand(req.user.id, req.params.callSessionId);
    res.json({ success: true, data: state });
  } catch (error) {
    handle(res, error, 'Raise hand error');
  }
}

async function lowerHand(req, res) {
  try {
    const state = await callService.lowerHand(req.user.id, req.params.callSessionId);
    res.json({ success: true, data: state });
  } catch (error) {
    handle(res, error, 'Lower hand error');
  }
}

async function advanceSpeaker(req, res) {
  try {
    const state = await callService.advanceSpeaker(req.user.id, req.params.callSessionId);
    res.json({ success: true, data: state });
  } catch (error) {
    handle(res, error, 'Advance speaker error');
  }
}

async function getMyJoinRequestStatus(req, res) {
  try {
    const status = await callService.getMyJoinRequestStatus(req.user.id, req.params.callSessionId);
    res.json({ success: true, data: status });
  } catch (error) {
    handle(res, error, 'Get join request status error');
  }
}

async function resolveJoinRequest(req, res) {
  try {
    const { decision } = req.body;
    const result = await callService.resolveJoinRequest(req.user.id, req.params.callSessionId, req.params.requesterId, decision);
    res.json({ success: true, data: result });
  } catch (error) {
    handle(res, error, 'Resolve join request error');
  }
}

async function updateCallSettings(req, res) {
  try {
    const state = await callService.updateCallSettings(req.user.id, req.params.callSessionId, req.body || {});
    res.json({ success: true, data: state });
  } catch (error) {
    handle(res, error, 'Update call settings error');
  }
}

async function removeParticipant(req, res) {
  try {
    const state = await callService.removeParticipant(req.user.id, req.params.callSessionId, req.params.targetUserId);
    res.json({ success: true, data: state });
  } catch (error) {
    handle(res, error, 'Remove participant error');
  }
}

async function advancePhase(req, res) {
  try {
    const state = await callService.advancePhase(req.user.id, req.params.callSessionId);
    res.json({ success: true, data: state });
  } catch (error) {
    handle(res, error, 'Advance phase error');
  }
}

module.exports = {
  getActiveCall,
  joinCall,
  leaveCall,
  sendSignal,
  pollSignals,
  getCallState,
  raiseHand,
  lowerHand,
  advanceSpeaker,
  getMyJoinRequestStatus,
  resolveJoinRequest,
  updateCallSettings,
  removeParticipant,
  advancePhase,
};
