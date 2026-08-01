const crypto = require('crypto');
const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

const MAX_MEDIA_BYTES = 400 * 1024; // ~400KB — voice notes / images, base64-in-Postgres (no object storage wired up yet)
const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I

function generateInviteCode() {
  let code = '';
  for (let i = 0; i < 8; i += 1) code += INVITE_CODE_CHARS[crypto.randomInt(INVITE_CODE_CHARS.length)];
  return code;
}

/**
 * Spaces & Channels — built natively in Vibeon Learn. A Space is public
 * (listed, freely joinable) or private (invite-link only). Live audio/video
 * is deliberately out of scope here pending a WebRTC provider decision —
 * this is the async foundation: text/voice-note/image messages, and a
 * DEBATE channel type where participation requires an approved request.
 */
class SpaceService {
  async createSpace(userId, { name, description, visibility }) {
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('Give your space a name.');
    if (cleanName.length > 80) throw new Error('Keep the name under 80 characters.');
    const vis = visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC';

    const space = await prisma.space.create({
      data: {
        name: cleanName,
        description: (description || '').trim() || null,
        visibility: vis,
        ownerId: userId,
        memberships: { create: { userId, role: 'OWNER' } },
        channels: { create: { name: 'general', type: 'TEXT', order: 1 } },
      },
      include: { channels: true },
    });
    return space;
  }

  /** Public directory (anyone) merged with the caller's own memberships (private + public they've joined). */
  async listSpacesForUser(userId) {
    const [publicSpaces, myMemberships] = await Promise.all([
      prisma.space.findMany({
        where: { visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { memberships: true, channels: true } } },
      }),
      prisma.spaceMembership.findMany({
        where: { userId },
        include: { space: { include: { _count: { select: { memberships: true, channels: true } } } } },
      }),
    ]);

    const myMembershipBySpaceId = new Map(myMemberships.map((m) => [m.spaceId, m]));
    const byId = new Map();
    for (const space of publicSpaces) byId.set(space.id, space);
    for (const m of myMemberships) byId.set(m.space.id, m.space);

    return Array.from(byId.values())
      .map((space) => ({ ...space, myRole: myMembershipBySpaceId.get(space.id)?.role || null }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getSpace(userId, spaceId) {
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        channels: { orderBy: { order: 'asc' } },
        _count: { select: { memberships: true } },
      },
    });
    if (!space) return null;
    const membership = await prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId, userId } } });
    if (space.visibility === 'PRIVATE' && !membership) {
      // Private spaces reveal nothing beyond "exists" to non-members.
      return { id: space.id, name: space.name, visibility: 'PRIVATE', notAMember: true };
    }
    return { ...space, myRole: membership?.role || null };
  }

  async joinPublicSpace(userId, spaceId) {
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) throw new Error('Space not found.');
    if (space.visibility !== 'PUBLIC') throw new Error('This space is private — you need an invite link to join.');
    return prisma.spaceMembership.upsert({
      where: { spaceId_userId: { spaceId, userId } },
      update: {},
      create: { spaceId, userId, role: 'MEMBER' },
    });
  }

  async createInvite(userId, spaceId) {
    await this._requireModerator(userId, spaceId);
    const code = generateInviteCode();
    return prisma.spaceInvite.create({ data: { spaceId, code, createdBy: userId } });
  }

  async joinViaInvite(userId, code) {
    const invite = await prisma.spaceInvite.findUnique({ where: { code } });
    if (!invite) throw new Error('Invite link is invalid.');
    await prisma.spaceInvite.update({ where: { id: invite.id }, data: { useCount: { increment: 1 } } });
    const membership = await prisma.spaceMembership.upsert({
      where: { spaceId_userId: { spaceId: invite.spaceId, userId } },
      update: {},
      create: { spaceId: invite.spaceId, userId, role: 'MEMBER' },
    });
    return { spaceId: invite.spaceId, membership };
  }

  async createChannel(userId, spaceId, { name, description, type }) {
    await this._requireModerator(userId, spaceId);
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('Give the channel a name.');
    const count = await prisma.channel.count({ where: { spaceId } });
    return prisma.channel.create({
      data: {
        spaceId,
        name: cleanName,
        description: (description || '').trim() || null,
        type: type === 'DEBATE' ? 'DEBATE' : 'TEXT',
        order: count + 1,
      },
    });
  }

  async listMessages(userId, channelId, limit = 50) {
    const channel = await this._requireMember(userId, channelId);
    const messages = await prisma.channelMessage.findMany({
      where: { channelId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        type: true,
        text: true,
        mimeType: true,
        createdAt: true,
        user: { select: { id: true, username: true } },
      },
    });
    return { channel, messages };
  }

  async postMessage(userId, channelId, { type, text, mediaBase64, mimeType }) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new Error('Channel not found.');
    const membership = await prisma.spaceMembership.findUnique({
      where: { spaceId_userId: { spaceId: channel.spaceId, userId } },
    });
    if (!membership) throw new Error('Join this space before posting.');

    if (channel.type === 'DEBATE' && membership.role === 'MEMBER') {
      const request = await prisma.debateRequest.findUnique({ where: { channelId_userId: { channelId, userId } } });
      if (!request || request.status !== 'APPROVED') {
        throw new Error('Request to join this debate before posting — a moderator needs to approve you first.');
      }
    }

    const msgType = type === 'VOICE' || type === 'IMAGE' ? type : 'TEXT';
    if (msgType === 'TEXT') {
      const cleanText = (text || '').trim();
      if (!cleanText) throw new Error('Write something before sending.');
      if (cleanText.length > 2000) throw new Error('Keep messages under 2000 characters.');
      return prisma.channelMessage.create({
        data: { channelId, userId, type: 'TEXT', text: cleanText },
        include: { user: { select: { id: true, username: true } } },
      });
    }

    if (!mediaBase64) throw new Error('No media attached.');
    if (Buffer.byteLength(mediaBase64, 'base64') > MAX_MEDIA_BYTES) {
      throw new Error('That file is too large — keep clips/images small.');
    }
    return prisma.channelMessage.create({
      data: { channelId, userId, type: msgType, mediaData: mediaBase64, mimeType: mimeType || null },
      include: { user: { select: { id: true, username: true } } },
    });
  }

  async getMessageMedia(messageId) {
    return prisma.channelMessage.findUnique({ where: { id: messageId } });
  }

  async requestToJoinDebate(userId, channelId) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.type !== 'DEBATE') throw new Error('This is not a debate channel.');
    await this._requireMember(userId, channelId);
    return prisma.debateRequest.upsert({
      where: { channelId_userId: { channelId, userId } },
      update: {},
      create: { channelId, userId },
    });
  }

  async listDebateRequests(userId, channelId) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new Error('Channel not found.');
    await this._requireModerator(userId, channel.spaceId);
    return prisma.debateRequest.findMany({
      where: { channelId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, username: true } } },
    });
  }

  async resolveDebateRequest(userId, requestId, approve) {
    const request = await prisma.debateRequest.findUnique({ where: { id: requestId }, include: { channel: true } });
    if (!request) throw new Error('Request not found.');
    await this._requireModerator(userId, request.channel.spaceId);
    return prisma.debateRequest.update({
      where: { id: requestId },
      data: { status: approve ? 'APPROVED' : 'DECLINED' },
    });
  }

  async getMyDebateStatus(userId, channelId) {
    const request = await prisma.debateRequest.findUnique({ where: { channelId_userId: { channelId, userId } } });
    return request?.status || null;
  }

  // --- internal guards ---
  async _requireMember(userId, channelId) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new Error('Channel not found.');
    const membership = await prisma.spaceMembership.findUnique({
      where: { spaceId_userId: { spaceId: channel.spaceId, userId } },
    });
    if (!membership) throw new Error('Join this space to view its channels.');
    return channel;
  }

  async _requireModerator(userId, spaceId) {
    const membership = await prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId, userId } } });
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'MODERATOR')) {
      throw new Error('Only the space owner or a moderator can do that.');
    }
    return membership;
  }
}

module.exports = new SpaceService();
