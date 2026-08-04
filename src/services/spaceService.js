const crypto = require('crypto');
const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

const MAX_MEDIA_BYTES = 400 * 1024; // ~400KB — voice notes / images, base64-in-Postgres (no object storage wired up yet)
const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
const RANK = { OWNER: 3, MODERATOR: 2, MEMBER: 1 };
const MAX_QUESTION_LENGTH = 200;
const MAX_POLICIES_LENGTH = 2000;
const MAX_PHASES = 6;
const MAX_PHASE_NAME_LENGTH = 60;
const MIN_PHASE_SECONDS = 15;
const MAX_PHASE_SECONDS = 600;
const VOTE_SIDES = ['FOR', 'AGAINST', 'NEUTRAL'];
const DEBATE_SIDES = ['FOR', 'AGAINST'];
const MAX_REACTION_EMOJI_LENGTH = 8; // generous for multi-codepoint emoji, still cheap abuse guard

/** Parses/validates the optional formal-phases structure a debate creator can set
 * (e.g. opening statements → rebuttal → closing, each with its own per-side timer).
 * Returns a JSON string to store, or null for an open-format debate. */
function serializePhases(phases) {
  if (!Array.isArray(phases) || phases.length === 0) return null;
  const clean = phases.slice(0, MAX_PHASES).map((p) => {
    const name = String(p?.name || '').trim().slice(0, MAX_PHASE_NAME_LENGTH);
    if (!name) throw new Error('Every debate phase needs a name.');
    let perSideSeconds = Number(p?.perSideSeconds) || 60;
    perSideSeconds = Math.min(MAX_PHASE_SECONDS, Math.max(MIN_PHASE_SECONDS, perSideSeconds));
    return { name, perSideSeconds };
  });
  return JSON.stringify(clean);
}

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

  async updateSpace(userId, spaceId, { name, description, visibility }) {
    await this._requireModerator(userId, spaceId);
    const data = {};
    if (name !== undefined) {
      const cleanName = (name || '').trim();
      if (!cleanName) throw new Error('Give your space a name.');
      if (cleanName.length > 80) throw new Error('Keep the name under 80 characters.');
      data.name = cleanName;
    }
    if (description !== undefined) data.description = (description || '').trim() || null;
    if (visibility !== undefined) data.visibility = visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC';
    return prisma.space.update({ where: { id: spaceId }, data });
  }

  /** Owner-only, and cascades manually since FKs are RESTRICT (no ON DELETE CASCADE). */
  async deleteSpace(userId, spaceId) {
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) throw new Error('Space not found.');
    if (space.ownerId !== userId) throw new Error('Only the space owner can delete it.');

    const channels = await prisma.channel.findMany({ where: { spaceId }, select: { id: true } });
    const channelIds = channels.map((c) => c.id);
    await prisma.$transaction([
      prisma.debateRequest.deleteMany({ where: { channelId: { in: channelIds } } }),
      prisma.channelMessage.deleteMany({ where: { channelId: { in: channelIds } } }),
      prisma.channel.deleteMany({ where: { spaceId } }),
      prisma.spaceInvite.deleteMany({ where: { spaceId } }),
      prisma.spaceMembership.deleteMany({ where: { spaceId } }),
      prisma.space.delete({ where: { id: spaceId } }),
    ]);
  }

  async listMembers(userId, spaceId) {
    await this._requireMemberOfSpace(userId, spaceId);
    return prisma.spaceMembership.findMany({
      where: { spaceId },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      include: { user: { select: { id: true, username: true } } },
    });
  }

  /** Owner-only: set a member's role to MODERATOR or MEMBER (not OWNER — see transferOwnership). */
  async updateMemberRole(userId, spaceId, targetUserId, newRole) {
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) throw new Error('Space not found.');
    if (space.ownerId !== userId) throw new Error('Only the space owner can change roles.');
    if (targetUserId === userId) throw new Error("You can't change your own role.");
    if (newRole !== 'MODERATOR' && newRole !== 'MEMBER') throw new Error('Invalid role.');

    const target = await prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId, userId: targetUserId } } });
    if (!target) throw new Error('That person is not a member of this space.');
    return prisma.spaceMembership.update({ where: { id: target.id }, data: { role: newRole } });
  }

  /** Rank-checked: a moderator can remove a member, never a peer moderator or the owner. */
  async removeMember(userId, spaceId, targetUserId) {
    if (targetUserId === userId) throw new Error('Use "Leave space" to remove yourself.');
    const actor = await this._requireModerator(userId, spaceId);
    const target = await prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId, userId: targetUserId } } });
    if (!target) throw new Error('That person is not a member of this space.');
    if (RANK[target.role] >= RANK[actor.role]) {
      throw new Error('You can only remove members ranked below you.');
    }
    await prisma.spaceMembership.delete({ where: { id: target.id } });
  }

  async leaveSpace(userId, spaceId) {
    const membership = await prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId, userId } } });
    if (!membership) throw new Error("You're not a member of this space.");
    if (membership.role === 'OWNER') {
      throw new Error('Transfer ownership or delete the space before leaving — an owner can\'t just leave.');
    }
    await prisma.spaceMembership.delete({ where: { id: membership.id } });
  }

  /** Owner-only: hand the space to an existing member; the old owner becomes a moderator. */
  async transferOwnership(userId, spaceId, targetUserId) {
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) throw new Error('Space not found.');
    if (space.ownerId !== userId) throw new Error('Only the space owner can transfer ownership.');
    if (targetUserId === userId) throw new Error('You already own this space.');
    const target = await prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId, userId: targetUserId } } });
    if (!target) throw new Error('That person is not a member of this space.');

    await prisma.$transaction([
      prisma.space.update({ where: { id: spaceId }, data: { ownerId: targetUserId } }),
      prisma.spaceMembership.update({ where: { id: target.id }, data: { role: 'OWNER' } }),
      prisma.spaceMembership.update({
        where: { spaceId_userId: { spaceId, userId } },
        data: { role: 'MODERATOR' },
      }),
    ]);
  }

  async createChannel(userId, spaceId, { name, description, type, debateQuestion, debatePolicies, debatePhases }) {
    await this._requireModerator(userId, spaceId);
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('Give the channel a name.');
    const isDebate = type === 'DEBATE';
    const count = await prisma.channel.count({ where: { spaceId } });
    return prisma.channel.create({
      data: {
        spaceId,
        name: cleanName,
        description: (description || '').trim() || null,
        type: isDebate ? 'DEBATE' : 'TEXT',
        order: count + 1,
        // The motion is deliberately optional — a debate can just be a guided open
        // discussion. Policies/phases only mean anything for a DEBATE channel.
        debateQuestion: isDebate && debateQuestion ? String(debateQuestion).trim().slice(0, MAX_QUESTION_LENGTH) || null : null,
        debatePolicies: isDebate && debatePolicies ? String(debatePolicies).trim().slice(0, MAX_POLICIES_LENGTH) || null : null,
        debatePhases: isDebate ? serializePhases(debatePhases) : null,
      },
    });
  }

  async updateChannel(userId, channelId, { name, description, debateQuestion, debatePolicies, debatePhases }) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new Error('Channel not found.');
    await this._requireModerator(userId, channel.spaceId);
    const data = {};
    if (name !== undefined) {
      const cleanName = (name || '').trim();
      if (!cleanName) throw new Error('Give the channel a name.');
      data.name = cleanName;
    }
    if (description !== undefined) data.description = (description || '').trim() || null;
    if (channel.type === 'DEBATE') {
      if (debateQuestion !== undefined) data.debateQuestion = debateQuestion ? String(debateQuestion).trim().slice(0, MAX_QUESTION_LENGTH) || null : null;
      if (debatePolicies !== undefined) data.debatePolicies = debatePolicies ? String(debatePolicies).trim().slice(0, MAX_POLICIES_LENGTH) || null : null;
      if (debatePhases !== undefined) data.debatePhases = serializePhases(debatePhases);
    }
    return prisma.channel.update({ where: { id: channelId }, data });
  }

  /** Keeps at least one channel per space so a space is never left unusable. */
  async deleteChannel(userId, channelId) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new Error('Channel not found.');
    await this._requireModerator(userId, channel.spaceId);
    const channelCount = await prisma.channel.count({ where: { spaceId: channel.spaceId } });
    if (channelCount <= 1) throw new Error('A space needs at least one channel.');

    await prisma.$transaction([
      prisma.debateRequest.deleteMany({ where: { channelId } }),
      prisma.channelMessage.deleteMany({ where: { channelId } }),
      prisma.channel.delete({ where: { id: channelId } }),
    ]);
  }

  /** Only top-level messages — replies live in their own thread, fetched via listReplies. */
  /** Folds raw {emoji,userId} reaction rows into display-ready pills: one per
   * distinct emoji, with a count and whether the viewer is among them. */
  _aggregateReactions(reactions, viewerId) {
    const byEmoji = new Map();
    for (const r of reactions) {
      const entry = byEmoji.get(r.emoji) || { emoji: r.emoji, count: 0, reactedByMe: false };
      entry.count += 1;
      if (r.userId === viewerId) entry.reactedByMe = true;
      byEmoji.set(r.emoji, entry);
    }
    return [...byEmoji.values()];
  }

  async listMessages(userId, channelId, limit = 50) {
    const channel = await this._requireMember(userId, channelId);
    const messages = await prisma.channelMessage.findMany({
      where: { channelId, parentMessageId: null },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        type: true,
        text: true,
        mimeType: true,
        createdAt: true,
        user: { select: { id: true, username: true } },
        _count: { select: { replies: true } },
        reactions: { select: { emoji: true, userId: true } },
      },
    });
    return {
      channel,
      messages: messages.map((m) => ({
        ...m,
        replyCount: m._count.replies,
        _count: undefined,
        reactions: this._aggregateReactions(m.reactions, userId),
      })),
    };
  }

  /** The root message plus its full reply thread, oldest first. */
  async listReplies(userId, messageId) {
    const root = await prisma.channelMessage.findUnique({
      where: { id: messageId },
      include: { channel: true, user: { select: { id: true, username: true } } },
    });
    if (!root) throw new Error('Message not found.');
    await this._requireMember(userId, root.channelId);

    const replies = await prisma.channelMessage.findMany({
      where: { parentMessageId: messageId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        text: true,
        mimeType: true,
        createdAt: true,
        user: { select: { id: true, username: true } },
        reactions: { select: { emoji: true, userId: true } },
      },
    });
    return { root, replies: replies.map((r) => ({ ...r, reactions: this._aggregateReactions(r.reactions, userId) })) };
  }

  /** Toggles the caller's own reaction on a message — on if absent, off if already there. */
  async toggleMessageReaction(userId, messageId, emoji) {
    const cleanEmoji = String(emoji || '').trim().slice(0, MAX_REACTION_EMOJI_LENGTH);
    if (!cleanEmoji) throw new Error('No emoji given.');
    const message = await prisma.channelMessage.findUnique({ where: { id: messageId }, include: { channel: true } });
    if (!message) throw new Error('Message not found.');
    await this._requireMember(userId, message.channelId);

    const existing = await prisma.messageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji: cleanEmoji } },
    });
    if (existing) {
      await prisma.messageReaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.messageReaction.create({ data: { messageId, userId, emoji: cleanEmoji } });
    }
    const reactions = await prisma.messageReaction.findMany({ where: { messageId }, select: { emoji: true, userId: true } });
    return this._aggregateReactions(reactions, userId);
  }

  async postMessage(userId, channelId, { type, text, mediaBase64, mimeType, parentMessageId }) {
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
      // The host (owner/moderator) posts the topics/motions that structure the debate;
      // approved participants engage by replying within those threads, not by starting
      // new top-level ones — keeps the discussion organized around what's being debated.
      if (!parentMessageId) {
        throw new Error('Debate participants can only reply to existing messages — the host posts new topics.');
      }
    }

    let parentId = null;
    if (parentMessageId) {
      const parent = await prisma.channelMessage.findUnique({ where: { id: parentMessageId } });
      if (!parent || parent.channelId !== channelId) throw new Error('Original message not found.');
      if (parent.parentMessageId) throw new Error("Replies can't be nested — reply on the original message.");
      parentId = parentMessageId;
    }

    const msgType = type === 'VOICE' || type === 'IMAGE' ? type : 'TEXT';
    if (msgType === 'TEXT') {
      const cleanText = (text || '').trim();
      if (!cleanText) throw new Error('Write something before sending.');
      if (cleanText.length > 2000) throw new Error('Keep messages under 2000 characters.');
      return prisma.channelMessage.create({
        data: { channelId, userId, type: 'TEXT', text: cleanText, parentMessageId: parentId },
        include: { user: { select: { id: true, username: true } } },
      });
    }

    if (!mediaBase64) throw new Error('No media attached.');
    if (Buffer.byteLength(mediaBase64, 'base64') > MAX_MEDIA_BYTES) {
      throw new Error('That file is too large — keep clips/images small.');
    }
    return prisma.channelMessage.create({
      data: { channelId, userId, type: msgType, mediaData: mediaBase64, mimeType: mimeType || null, parentMessageId: parentId },
      include: { user: { select: { id: true, username: true } } },
    });
  }

  async getMessageMedia(messageId) {
    return prisma.channelMessage.findUnique({ where: { id: messageId } });
  }

  /** Own message always deletable; otherwise the actor must outrank the author (owner deletes anyone's, moderator deletes members' only). */
  async deleteMessage(userId, messageId) {
    const message = await prisma.channelMessage.findUnique({
      where: { id: messageId },
      include: { channel: true },
    });
    if (!message) throw new Error('Message not found.');
    if (message.userId === userId) {
      await prisma.channelMessage.delete({ where: { id: messageId } });
      return;
    }
    const [actor, author] = await Promise.all([
      prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId: message.channel.spaceId, userId } } }),
      prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId: message.channel.spaceId, userId: message.userId } } }),
    ]);
    if (!actor || (actor.role !== 'OWNER' && actor.role !== 'MODERATOR')) {
      throw new Error('Only the space owner or a moderator can remove someone else\'s message.');
    }
    if (author && RANK[author.role] >= RANK[actor.role]) {
      throw new Error('You can only remove messages from members ranked below you.');
    }
    await prisma.channelMessage.delete({ where: { id: messageId } });
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

  async resolveDebateRequest(userId, requestId, approve, side) {
    const request = await prisma.debateRequest.findUnique({ where: { id: requestId }, include: { channel: true } });
    if (!request) throw new Error('Request not found.');
    await this._requireModerator(userId, request.channel.spaceId);
    if (side !== undefined && side !== null && !DEBATE_SIDES.includes(side)) throw new Error('Invalid side.');
    return prisma.debateRequest.update({
      where: { id: requestId },
      data: { status: approve ? 'APPROVED' : 'DECLINED', side: approve ? side || null : null },
    });
  }

  /** Moderator visibility into who can currently post in a debate — the
   * pending queue alone doesn't show this, so there was no way to see (or
   * revoke) someone already approved. */
  async listApprovedDebateParticipants(userId, channelId) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) throw new Error('Channel not found.');
    await this._requireModerator(userId, channel.spaceId);
    return prisma.debateRequest.findMany({
      where: { channelId, status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, username: true } } },
    });
  }

  /** Puts an approved participant back to DECLINED — they can re-request if they want back in. */
  async revokeDebateApproval(userId, requestId) {
    const request = await prisma.debateRequest.findUnique({ where: { id: requestId }, include: { channel: true } });
    if (!request) throw new Error('Request not found.');
    await this._requireModerator(userId, request.channel.spaceId);
    if (request.status !== 'APPROVED') throw new Error('This person is not currently approved.');
    return prisma.debateRequest.update({ where: { id: requestId }, data: { status: 'DECLINED' } });
  }

  async getMyDebateStatus(userId, channelId) {
    const request = await prisma.debateRequest.findUnique({ where: { channelId_userId: { channelId, userId } } });
    return request?.status || null;
  }

  /** Anyone in the space can vote FOR/AGAINST/NEUTRAL on a debate's motion, and change
   * their mind anytime — an Oxford-style audience read, not a one-shot ballot. */
  async castDebateVote(userId, channelId, side) {
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.type !== 'DEBATE') throw new Error('This is not a debate channel.');
    if (!VOTE_SIDES.includes(side)) throw new Error('Invalid side.');
    await this._requireMember(userId, channelId);
    await prisma.debateVote.upsert({
      where: { channelId_userId: { channelId, userId } },
      update: { side },
      create: { channelId, userId, side },
    });
    return this.getDebateVoteTally(userId, channelId);
  }

  async getDebateVoteTally(userId, channelId) {
    await this._requireMember(userId, channelId);
    const [votes, mine] = await Promise.all([
      prisma.debateVote.groupBy({ by: ['side'], where: { channelId }, _count: true }),
      prisma.debateVote.findUnique({ where: { channelId_userId: { channelId, userId } } }),
    ]);
    const counts = { FOR: 0, AGAINST: 0, NEUTRAL: 0 };
    for (const v of votes) counts[v.side] = v._count;
    return { counts, total: counts.FOR + counts.AGAINST + counts.NEUTRAL, myVote: mine?.side || null };
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

  async _requireMemberOfSpace(userId, spaceId) {
    const membership = await prisma.spaceMembership.findUnique({ where: { spaceId_userId: { spaceId, userId } } });
    if (!membership) throw new Error('Join this space first.');
    return membership;
  }
}

module.exports = new SpaceService();
