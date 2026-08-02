const prisma = require('../utils/prismaClient');

const MAX_SIGNAL_PAYLOAD_BYTES = 8 * 1024; // SDP/ICE payloads are small text; this is generous headroom
const MIN_SPEAKER_TIME_SEC = 15;
const MAX_SPEAKER_TIME_SEC = 300;

/**
 * Voice/video calls — mesh WebRTC entirely on free, open infrastructure.
 * The browser's native RTCPeerConnection does the actual audio/video;
 * this service is only the signaling relay peers use to exchange SDP
 * offers/answers and ICE candidates, since Vercel's serverless functions
 * can't host a persistent WebSocket/Socket.io server the way a real-time
 * app normally would. Clients poll for new signals instead.
 */
class CallService {
  async _requireMember(userId, channelId) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new Error('Channel not found.');
    const membership = await prisma.spaceMembership.findUnique({
      where: { spaceId_userId: { spaceId: channel.spaceId, userId } },
    });
    if (!membership) throw new Error('Join this space first.');
    return { channel, role: membership.role };
  }

  async _requireActiveParticipant(userId, callSessionId) {
    const participant = await prisma.callParticipant.findUnique({
      where: { callSessionId_userId: { callSessionId, userId } },
    });
    if (!participant || participant.leftAt) throw new Error("You're not in this call.");
    return participant;
  }

  async _usernamesById(ids) {
    if (!ids.length) return new Map();
    const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, username: true } });
    return new Map(users.map((u) => [u.id, u.username]));
  }

  /** Attaches speaking-turn state (mode, current speaker, raised-hand queue) to a session for API responses. */
  async _withSpeakingState(session) {
    const queueIds = JSON.parse(session.speakerQueue || '[]');
    const idsNeeded = [...queueIds, ...(session.currentSpeakerId ? [session.currentSpeakerId] : [])];
    const usernames = await this._usernamesById(idsNeeded);
    return {
      speakingMode: session.speakingMode,
      speakerTimeSec: session.speakerTimeSec,
      currentSpeaker: session.currentSpeakerId
        ? { id: session.currentSpeakerId, username: usernames.get(session.currentSpeakerId) || 'Learner' }
        : null,
      currentSpeakerStartedAt: session.currentSpeakerStartedAt,
      queue: queueIds.map((id) => ({ id, username: usernames.get(id) || 'Learner' })),
    };
  }

  /** Pops the next raised hand (if any) into the speaker seat. Mutates and persists `session` in place. */
  async _promoteNext(session) {
    const queue = JSON.parse(session.speakerQueue || '[]');
    const nextId = queue.shift() || null;
    const updated = await prisma.callSession.update({
      where: { id: session.id },
      data: {
        currentSpeakerId: nextId,
        currentSpeakerStartedAt: nextId ? new Date() : null,
        speakerQueue: JSON.stringify(queue),
      },
    });
    return updated;
  }

  /** The currently active call in a channel (if any), with its live participant list and speaking-turn state. */
  async getActiveCall(userId, channelId) {
    await this._requireMember(userId, channelId);
    const session = await prisma.callSession.findFirst({
      where: { channelId, endedAt: null },
      orderBy: { startedAt: 'desc' },
    });
    if (!session) return null;
    const participants = await prisma.callParticipant.findMany({
      where: { callSessionId: session.id, leftAt: null },
      include: { user: { select: { id: true, username: true } } },
    });
    const speakingState = await this._withSpeakingState(session);
    return { id: session.id, channelId: session.channelId, startedAt: session.startedAt, participants, ...speakingState };
  }

  /** Live queue/speaker/participant state for a call already joined — polled during the call. */
  async getCallState(userId, callSessionId) {
    await this._requireActiveParticipant(userId, callSessionId);
    const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');
    const participants = await prisma.callParticipant.findMany({
      where: { callSessionId, leftAt: null },
      include: { user: { select: { id: true, username: true } } },
    });
    const speakingState = await this._withSpeakingState(session);
    return { participants, ...speakingState };
  }

  /** Starts a call if none is active, or joins the existing one. `settings` (speaking mode/timer)
   * only take effect when starting a brand-new call — a joiner inherits whatever's already running.
   * Returns the session plus the OTHER already-active participants — the joiner is the one who
   * initiates a WebRTC offer to each of them, avoiding offer/answer glare from both sides at once. */
  async joinCall(userId, channelId, settings) {
    await this._requireMember(userId, channelId);

    let session = await prisma.callSession.findFirst({ where: { channelId, endedAt: null } });
    if (!session) {
      const speakingMode = settings?.speakingMode === 'STRUCTURED' ? 'STRUCTURED' : 'OPEN';
      let speakerTimeSec = null;
      if (speakingMode === 'STRUCTURED') {
        speakerTimeSec = Number(settings?.speakerTimeSec) || 60;
        speakerTimeSec = Math.min(MAX_SPEAKER_TIME_SEC, Math.max(MIN_SPEAKER_TIME_SEC, speakerTimeSec));
      }
      session = await prisma.callSession.create({ data: { channelId, startedBy: userId, speakingMode, speakerTimeSec } });
    }

    const existingParticipants = await prisma.callParticipant.findMany({
      where: { callSessionId: session.id, leftAt: null, userId: { not: userId } },
      include: { user: { select: { id: true, username: true } } },
    });

    await prisma.callParticipant.upsert({
      where: { callSessionId_userId: { callSessionId: session.id, userId } },
      update: { leftAt: null, joinedAt: new Date() },
      create: { callSessionId: session.id, userId },
    });

    await prisma.callSignal.create({
      data: { callSessionId: session.id, fromUserId: userId, toUserId: null, type: 'JOIN', payload: '{}' },
    });

    const speakingState = await this._withSpeakingState(session);
    return { callSessionId: session.id, participants: existingParticipants, ...speakingState };
  }

  /** Raises your hand to speak (structured mode only) — promoted to speaker immediately if no one's talking. */
  async raiseHand(userId, callSessionId) {
    await this._requireActiveParticipant(userId, callSessionId);
    let session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');
    if (session.speakingMode !== 'STRUCTURED') throw new Error('This call is open floor — no queue to raise a hand in.');
    if (session.currentSpeakerId === userId) return this._withSpeakingState(session);

    const queue = JSON.parse(session.speakerQueue || '[]');
    if (!queue.includes(userId)) {
      queue.push(userId);
      session = await prisma.callSession.update({ where: { id: callSessionId }, data: { speakerQueue: JSON.stringify(queue) } });
    }
    if (!session.currentSpeakerId) session = await this._promoteNext(session);
    return this._withSpeakingState(session);
  }

  /** Lowers your hand, or yields the floor early if it's currently your turn. */
  async lowerHand(userId, callSessionId) {
    await this._requireActiveParticipant(userId, callSessionId);
    let session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');

    const queue = JSON.parse(session.speakerQueue || '[]').filter((id) => id !== userId);
    session = await prisma.callSession.update({ where: { id: callSessionId }, data: { speakerQueue: JSON.stringify(queue) } });
    if (session.currentSpeakerId === userId) session = await this._promoteNext(session);
    return this._withSpeakingState(session);
  }

  /** Ends the current speaker's turn and promotes the next in queue. Allowed for: the speaker
   * themself (yielding), a space owner/moderator (host skip), or anyone once the timer has
   * genuinely expired (covers a speaker who disconnected without yielding). */
  async advanceSpeaker(userId, callSessionId) {
    await this._requireActiveParticipant(userId, callSessionId);
    const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');
    if (!session.currentSpeakerId) return this._withSpeakingState(session);

    const isSpeaker = session.currentSpeakerId === userId;
    const timerExpired =
      session.speakerTimeSec && session.currentSpeakerStartedAt
        ? Date.now() - new Date(session.currentSpeakerStartedAt).getTime() >= session.speakerTimeSec * 1000
        : false;

    if (!isSpeaker && !timerExpired) {
      const { role } = await this._requireMember(userId, session.channelId);
      if (role !== 'OWNER' && role !== 'MODERATOR') throw new Error("It's not your turn yet.");
    }

    // Optimistic guard: only advance if the speaker seat hasn't already changed under us
    // (avoids a double-promotion race when two clients both notice the timer expired).
    const claimed = await prisma.callSession.updateMany({
      where: { id: callSessionId, currentSpeakerId: session.currentSpeakerId },
      data: { currentSpeakerId: null, currentSpeakerStartedAt: null },
    });
    if (claimed.count === 0) return this._withSpeakingState(await prisma.callSession.findUnique({ where: { id: callSessionId } }));

    const cleared = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    const promoted = await this._promoteNext(cleared);
    return this._withSpeakingState(promoted);
  }

  async leaveCall(userId, callSessionId) {
    const participant = await prisma.callParticipant.findUnique({
      where: { callSessionId_userId: { callSessionId, userId } },
    });
    if (!participant || participant.leftAt) return;

    // Drop them from the speaking queue / speaker seat so a departed participant never blocks it.
    const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (session) {
      const queue = JSON.parse(session.speakerQueue || '[]').filter((id) => id !== userId);
      let updated = await prisma.callSession.update({ where: { id: callSessionId }, data: { speakerQueue: JSON.stringify(queue) } });
      if (updated.currentSpeakerId === userId) await this._promoteNext(updated);
    }

    await prisma.callParticipant.update({ where: { id: participant.id }, data: { leftAt: new Date() } });
    await prisma.callSignal.create({
      data: { callSessionId, fromUserId: userId, toUserId: null, type: 'LEAVE', payload: '{}' },
    });

    const stillActive = await prisma.callParticipant.count({ where: { callSessionId, leftAt: null } });
    if (stillActive === 0) {
      await prisma.$transaction([
        prisma.callSession.update({ where: { id: callSessionId }, data: { endedAt: new Date() } }),
        prisma.callSignal.deleteMany({ where: { callSessionId } }),
      ]);
    }
  }

  async sendSignal(userId, callSessionId, { type, toUserId, payload }) {
    const participant = await prisma.callParticipant.findUnique({
      where: { callSessionId_userId: { callSessionId, userId } },
    });
    if (!participant || participant.leftAt) throw new Error("You're not in this call.");
    if (!['OFFER', 'ANSWER', 'ICE_CANDIDATE'].includes(type)) throw new Error('Invalid signal type.');

    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (Buffer.byteLength(payloadStr, 'utf8') > MAX_SIGNAL_PAYLOAD_BYTES) {
      throw new Error('Signal payload too large.');
    }

    return prisma.callSignal.create({
      data: { callSessionId, fromUserId: userId, toUserId: toUserId || null, type, payload: payloadStr },
    });
  }

  /** Signals meant for me (direct or broadcast) that I haven't seen yet, oldest first. */
  async pollSignals(userId, callSessionId, sinceIso) {
    const since = sinceIso ? new Date(sinceIso) : new Date(0);
    const signals = await prisma.callSignal.findMany({
      where: {
        callSessionId,
        fromUserId: { not: userId },
        OR: [{ toUserId: userId }, { toUserId: null }],
        createdAt: { gt: since },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return signals;
  }
}

module.exports = new CallService();
