const prisma = require('../utils/prismaClient');

const MAX_SIGNAL_PAYLOAD_BYTES = 8 * 1024; // SDP/ICE payloads are small text; this is generous headroom
const MIN_SPEAKER_TIME_SEC = 15;
const MAX_SPEAKER_TIME_SEC = 300;
const MAX_TOPIC_LENGTH = 120;
const HOST_ROLES = ['OWNER', 'MODERATOR'];
// Mesh WebRTC cost grows with the square of participant count — this cap keeps
// it from self-destructing rather than pretending it scales indefinitely.
const MAX_CALL_PARTICIPANTS = 12;

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

  /** Tags each participant with their space role — lets the client know who the
   * organizer (owner/moderator) is, e.g. to feature them by default in the call layout. */
  async _attachRoles(spaceId, participants) {
    if (!participants.length) return participants;
    const memberships = await prisma.spaceMembership.findMany({
      where: { spaceId, userId: { in: participants.map((p) => p.userId) } },
      select: { userId: true, role: true },
    });
    const roleByUserId = new Map(memberships.map((m) => [m.userId, m.role]));
    return participants.map((p) => ({ ...p, role: roleByUserId.get(p.userId) || 'MEMBER' }));
  }

  /** Whoever started a call is its host, in addition to any space owner/moderator — a plain
   * member starting a call still needs to be able to admit people and change its settings. */
  _isHost(userId, role, session) {
    return HOST_ROLES.includes(role) || session.startedBy === userId;
  }

  /** Attaches speaking-turn state and live call settings to a session for API responses.
   * `viewerIsHost` — only the host gets the pending join-request list, since that's a
   * moderation queue, not something every participant needs to see. `channel` — optional;
   * when given, surfaces the debate's formal phases (if any) alongside which one is active. */
  async _withSpeakingState(session, viewerIsHost, channel) {
    const queueIds = JSON.parse(session.speakerQueue || '[]');
    const idsNeeded = [...queueIds, ...(session.currentSpeakerId ? [session.currentSpeakerId] : [])];
    const usernames = await this._usernamesById(idsNeeded);

    let joinRequests = [];
    if (viewerIsHost) {
      const pending = await prisma.callJoinRequest.findMany({
        where: { callSessionId: session.id, status: 'PENDING' },
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'asc' },
      });
      joinRequests = pending.map((r) => ({ userId: r.user.id, username: r.user.username }));
    }

    return {
      speakingMode: session.speakingMode,
      speakerTimeSec: session.speakerTimeSec,
      currentSpeaker: session.currentSpeakerId
        ? { id: session.currentSpeakerId, username: usernames.get(session.currentSpeakerId) || 'Learner' }
        : null,
      currentSpeakerStartedAt: session.currentSpeakerStartedAt,
      queue: queueIds.map((id) => ({ id, username: usernames.get(id) || 'Learner' })),
      isHost: Boolean(viewerIsHost),
      requireApproval: session.requireApproval,
      autoMuteOnJoin: session.autoMuteOnJoin,
      topic: session.topic,
      startedBy: session.startedBy,
      startedAt: session.startedAt,
      joinRequests,
      phases: channel?.debatePhases ? JSON.parse(channel.debatePhases) : null,
      currentPhaseIndex: session.currentPhaseIndex ?? null,
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
    const { role, channel } = await this._requireMember(userId, channelId);
    const session = await prisma.callSession.findFirst({
      where: { channelId, endedAt: null },
      orderBy: { startedAt: 'desc' },
    });
    if (!session) return null;
    let participants = await prisma.callParticipant.findMany({
      where: { callSessionId: session.id, leftAt: null },
      include: { user: { select: { id: true, username: true } } },
    });
    participants = await this._attachRoles(channel.spaceId, participants);
    const speakingState = await this._withSpeakingState(session, this._isHost(userId, role, session), channel);
    return { id: session.id, channelId: session.channelId, startedAt: session.startedAt, participants, ...speakingState };
  }

  /** Live queue/speaker/participant state for a call already joined — polled during the call. */
  async getCallState(userId, callSessionId) {
    await this._requireActiveParticipant(userId, callSessionId);
    const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');
    const { role, channel } = await this._requireMember(userId, session.channelId);
    let participants = await prisma.callParticipant.findMany({
      where: { callSessionId, leftAt: null },
      include: { user: { select: { id: true, username: true } } },
    });
    participants = await this._attachRoles(channel.spaceId, participants);
    const speakingState = await this._withSpeakingState(session, this._isHost(userId, role, session), channel);
    return { participants, ...speakingState };
  }

  /** Status of my own pending request to join an approval-gated call — polled while waiting. */
  async getMyJoinRequestStatus(userId, callSessionId) {
    const participant = await prisma.callParticipant.findUnique({ where: { callSessionId_userId: { callSessionId, userId } } });
    if (participant) return { status: 'APPROVED' };
    const request = await prisma.callJoinRequest.findUnique({ where: { callSessionId_userId: { callSessionId, userId } } });
    return { status: request?.status || null };
  }

  /** Starts a call if none is active, or joins the existing one. `settings` (speaking mode/timer/topic/
   * approval requirement) only take effect when starting a brand-new call — a joiner inherits whatever's
   * already running. Returns the session plus the OTHER already-active participants — the joiner is the
   * one who initiates a WebRTC offer to each of them, avoiding offer/answer glare from both sides at once.
   *
   * If the call requires host approval, a first-time joiner (not the host, never previously admitted)
   * gets queued as a CallJoinRequest instead — the response comes back `{ pending: true }` and the caller
   * should poll `getMyJoinRequestStatus` until a host admits them. */
  async joinCall(userId, channelId, settings) {
    const { role, channel } = await this._requireMember(userId, channelId);

    let session = await prisma.callSession.findFirst({ where: { channelId, endedAt: null } });
    if (!session) {
      // A debate is moderated by design — only its host decides when the call actually
      // starts; everyone else can only join one already running.
      if (channel.type === 'DEBATE' && !HOST_ROLES.includes(role)) {
        throw new Error('Only the host can start a call in a debate — ask them to start it, then join.');
      }

      // A debate with formal phases starts straight into phase 1, structured, on that
      // phase's timer — no need to hand-configure structured turns separately.
      const phases = channel.debatePhases ? JSON.parse(channel.debatePhases) : null;
      const speakingMode = phases || settings?.speakingMode === 'STRUCTURED' ? 'STRUCTURED' : 'OPEN';
      let speakerTimeSec = null;
      if (speakingMode === 'STRUCTURED') {
        speakerTimeSec = phases ? phases[0].perSideSeconds : Number(settings?.speakerTimeSec) || 60;
        speakerTimeSec = Math.min(MAX_SPEAKER_TIME_SEC, Math.max(MIN_SPEAKER_TIME_SEC, speakerTimeSec));
      }
      const topic = settings?.topic ? String(settings.topic).slice(0, MAX_TOPIC_LENGTH) : null;
      session = await prisma.callSession.create({
        data: {
          channelId,
          startedBy: userId,
          speakingMode,
          speakerTimeSec,
          topic,
          requireApproval: Boolean(settings?.requireApproval),
          autoMuteOnJoin: Boolean(settings?.autoMuteOnJoin),
          currentPhaseIndex: phases ? 0 : null,
        },
      });
    }

    if (session.requireApproval && !this._isHost(userId, role, session)) {
      const alreadyVetted = await prisma.callParticipant.findUnique({ where: { callSessionId_userId: { callSessionId: session.id, userId } } });
      const approvedRequest = alreadyVetted
        ? null
        : await prisma.callJoinRequest.findUnique({ where: { callSessionId_userId: { callSessionId: session.id, userId } } });
      const isVetted = alreadyVetted || approvedRequest?.status === 'APPROVED';

      if (!isVetted) {
        await prisma.callJoinRequest.upsert({
          where: { callSessionId_userId: { callSessionId: session.id, userId } },
          update: { status: 'PENDING', createdAt: new Date() },
          create: { callSessionId: session.id, userId, status: 'PENDING' },
        });
        return { pending: true, callSessionId: session.id, topic: session.topic, speakingMode: session.speakingMode };
      }
    }

    const existingParticipants = await prisma.callParticipant.findMany({
      where: { callSessionId: session.id, leftAt: null, userId: { not: userId } },
      include: { user: { select: { id: true, username: true } } },
    });

    const wasActive = existingParticipants.some((p) => p.userId === userId);
    if (!wasActive && existingParticipants.length >= MAX_CALL_PARTICIPANTS) {
      throw new Error(`This call is full (max ${MAX_CALL_PARTICIPANTS} participants).`);
    }

    await prisma.callParticipant.upsert({
      where: { callSessionId_userId: { callSessionId: session.id, userId } },
      update: { leftAt: null, joinedAt: new Date() },
      create: { callSessionId: session.id, userId },
    });

    await prisma.callSignal.create({
      data: { callSessionId: session.id, fromUserId: userId, toUserId: null, type: 'JOIN', payload: '{}' },
    });

    const speakingState = await this._withSpeakingState(session, this._isHost(userId, role, session), channel);
    return { callSessionId: session.id, participants: await this._attachRoles(channel.spaceId, existingParticipants), ...speakingState };
  }

  /** Admits or declines someone waiting at the door — the call's host only. */
  async resolveJoinRequest(hostId, callSessionId, requesterId, decision) {
    const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');
    const { role } = await this._requireMember(hostId, session.channelId);
    if (!this._isHost(hostId, role, session)) throw new Error('Only the host can admit or decline join requests.');
    if (!['APPROVE', 'DENY'].includes(decision)) throw new Error('Invalid decision.');

    const request = await prisma.callJoinRequest.findUnique({ where: { callSessionId_userId: { callSessionId, userId: requesterId } } });
    if (!request) throw new Error('That join request no longer exists.');

    if (decision === 'DENY') {
      await prisma.callJoinRequest.update({ where: { id: request.id }, data: { status: 'DENIED' } });
      return { requesterId, status: 'DENIED' };
    }

    const activeCount = await prisma.callParticipant.count({ where: { callSessionId, leftAt: null } });
    if (activeCount >= MAX_CALL_PARTICIPANTS) {
      throw new Error(`This call is full (max ${MAX_CALL_PARTICIPANTS} participants) — can't admit anyone else right now.`);
    }

    await prisma.callJoinRequest.update({ where: { id: request.id }, data: { status: 'APPROVED' } });
    await prisma.callParticipant.upsert({
      where: { callSessionId_userId: { callSessionId, userId: requesterId } },
      update: { leftAt: null, joinedAt: new Date() },
      create: { callSessionId, userId: requesterId },
    });
    await prisma.callSignal.create({
      data: { callSessionId, fromUserId: hostId, toUserId: null, type: 'JOIN', payload: '{}' },
    });
    return { requesterId, status: 'APPROVED' };
  }

  /** Live in-call settings, changeable mid-call by the host — owner/moderator only. Switching
   * speaking mode resets the queue/speaker seat since it doesn't carry meaning across modes. */
  async updateCallSettings(hostId, callSessionId, patch) {
    const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');
    const { role, channel } = await this._requireMember(hostId, session.channelId);
    if (!this._isHost(hostId, role, session)) throw new Error('Only the host can change call settings.');

    const data = {};
    if (patch.topic !== undefined) data.topic = patch.topic ? String(patch.topic).slice(0, MAX_TOPIC_LENGTH) : null;
    if (patch.requireApproval !== undefined) data.requireApproval = Boolean(patch.requireApproval);
    if (patch.autoMuteOnJoin !== undefined) data.autoMuteOnJoin = Boolean(patch.autoMuteOnJoin);

    if (patch.speakingMode !== undefined) {
      const nextMode = patch.speakingMode === 'STRUCTURED' ? 'STRUCTURED' : 'OPEN';
      if (nextMode !== session.speakingMode) {
        data.speakingMode = nextMode;
        data.currentSpeakerId = null;
        data.currentSpeakerStartedAt = null;
        data.speakerQueue = '[]';
      }
      if (nextMode === 'STRUCTURED') {
        let speakerTimeSec = Number(patch.speakerTimeSec ?? session.speakerTimeSec) || 60;
        data.speakerTimeSec = Math.min(MAX_SPEAKER_TIME_SEC, Math.max(MIN_SPEAKER_TIME_SEC, speakerTimeSec));
      }
    } else if (patch.speakerTimeSec !== undefined && session.speakingMode === 'STRUCTURED') {
      data.speakerTimeSec = Math.min(MAX_SPEAKER_TIME_SEC, Math.max(MIN_SPEAKER_TIME_SEC, Number(patch.speakerTimeSec) || 60));
    }

    const updated = await prisma.callSession.update({ where: { id: callSessionId }, data });
    return this._withSpeakingState(updated, this._isHost(hostId, role, updated), channel);
  }

  /** Advances a debate through its formal phases (opening statements → rebuttal → closing,
   * etc.) — host only. Each phase carries its own per-side speaking time, reusing the
   * existing structured-turns engine rather than a parallel timer system; advancing always
   * clears the queue/speaker seat since it's a fresh round. */
  async advancePhase(hostId, callSessionId) {
    const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');
    const { role, channel } = await this._requireMember(hostId, session.channelId);
    if (!this._isHost(hostId, role, session)) throw new Error('Only the host can advance the debate.');

    const phases = channel.debatePhases ? JSON.parse(channel.debatePhases) : null;
    if (!phases || !phases.length) throw new Error('This debate has no formal phases set.');
    const currentIndex = session.currentPhaseIndex ?? -1;
    if (currentIndex >= phases.length - 1) throw new Error('Already on the final phase.');

    const nextIndex = currentIndex + 1;
    const nextPhase = phases[nextIndex];
    const updated = await prisma.callSession.update({
      where: { id: callSessionId },
      data: {
        currentPhaseIndex: nextIndex,
        speakingMode: 'STRUCTURED',
        speakerTimeSec: nextPhase.perSideSeconds,
        currentSpeakerId: null,
        currentSpeakerStartedAt: null,
        speakerQueue: '[]',
      },
    });
    return this._withSpeakingState(updated, this._isHost(hostId, role, updated), channel);
  }

  /** Removes someone else from the call — the call's host only. They're sent a targeted
   * KICKED signal so their own client tears down its side of the connection immediately. */
  async removeParticipant(hostId, callSessionId, targetUserId) {
    if (hostId === targetUserId) throw new Error("Use leave instead of removing yourself.");
    const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
    if (!session) throw new Error('Call not found.');
    const { role, channel } = await this._requireMember(hostId, session.channelId);
    if (!this._isHost(hostId, role, session)) throw new Error('Only the host can remove participants.');

    const participant = await prisma.callParticipant.findUnique({ where: { callSessionId_userId: { callSessionId, userId: targetUserId } } });
    if (!participant || participant.leftAt) throw new Error('That person is not in the call.');

    const queue = JSON.parse(session.speakerQueue || '[]').filter((id) => id !== targetUserId);
    let updatedSession = await prisma.callSession.update({ where: { id: callSessionId }, data: { speakerQueue: JSON.stringify(queue) } });
    if (updatedSession.currentSpeakerId === targetUserId) updatedSession = await this._promoteNext(updatedSession);

    await prisma.callParticipant.update({ where: { id: participant.id }, data: { leftAt: new Date() } });
    await prisma.callSignal.create({
      data: { callSessionId, fromUserId: hostId, toUserId: targetUserId, type: 'KICKED', payload: '{}' },
    });
    // Broadcast as if the removed user announced their own departure, so everyone else's
    // existing LEAVE handling tears down its peer connection to them — same as a real leave.
    await prisma.callSignal.create({
      data: { callSessionId, fromUserId: targetUserId, toUserId: null, type: 'LEAVE', payload: '{}' },
    });

    const stillActive = await prisma.callParticipant.count({ where: { callSessionId, leftAt: null } });
    if (stillActive === 0) {
      await prisma.$transaction([
        prisma.callSession.update({ where: { id: callSessionId }, data: { endedAt: new Date() } }),
        prisma.callSignal.deleteMany({ where: { callSessionId } }),
      ]);
    }
    return this._withSpeakingState(updatedSession, this._isHost(hostId, role, updatedSession), channel);
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
      if (!this._isHost(userId, role, session)) throw new Error("It's not your turn yet.");
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
    if (!['OFFER', 'ANSWER', 'ICE_CANDIDATE', 'MEDIA_STATE', 'FORCE_MUTE', 'SPEAKING', 'REACTION', 'CAPTION'].includes(type)) {
      throw new Error('Invalid signal type.');
    }

    if (type === 'FORCE_MUTE') {
      const session = await prisma.callSession.findUnique({ where: { id: callSessionId } });
      const { role } = await this._requireMember(userId, session.channelId);
      if (!this._isHost(userId, role, session)) throw new Error('Only the host can mute someone else.');
      if (!toUserId) throw new Error('FORCE_MUTE needs a target.');
    }

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
