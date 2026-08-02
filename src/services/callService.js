const prisma = require('../utils/prismaClient');

const MAX_SIGNAL_PAYLOAD_BYTES = 8 * 1024; // SDP/ICE payloads are small text; this is generous headroom

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
    return channel;
  }

  /** The currently active call in a channel (if any), with its live participant list. */
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
    return { id: session.id, channelId: session.channelId, startedAt: session.startedAt, participants };
  }

  /** Starts a call if none is active, or joins the existing one. Returns
   * the session plus the OTHER already-active participants — the joiner
   * is the one who initiates a WebRTC offer to each of them, avoiding
   * offer/answer glare from both sides initiating at once. */
  async joinCall(userId, channelId) {
    await this._requireMember(userId, channelId);

    let session = await prisma.callSession.findFirst({ where: { channelId, endedAt: null } });
    if (!session) {
      session = await prisma.callSession.create({ data: { channelId, startedBy: userId } });
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

    return { callSessionId: session.id, participants: existingParticipants };
  }

  async leaveCall(userId, callSessionId) {
    const participant = await prisma.callParticipant.findUnique({
      where: { callSessionId_userId: { callSessionId, userId } },
    });
    if (!participant || participant.leftAt) return;

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
