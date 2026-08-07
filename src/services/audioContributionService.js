const prisma = require('../utils/prismaClient');

const MAX_AUDIO_BYTES = 300 * 1024; // ~300KB raw — a few seconds of compressed opus/webm, plenty for one word
const MAX_DAILY_CONTRIBUTIONS = 20;
const HIDE_AFTER_REPORTS = 3;

/**
 * Community Audio — real recorded pronunciation for core vocabulary,
 * contributed by learners themselves rather than sourced/licensed
 * native-speaker audio (nobody involved in building this app can produce
 * that). Never labeled "native speaker" anywhere — that's unverifiable.
 * No object storage is wired up, so short clips are stored as base64
 * directly in Postgres, size-capped at submit time.
 */
class AudioContributionService {
  async submitAudio(userId, { word, language, audioBase64, mimeType, vocabularyItemId }) {
    const cleanWord = (word || '').trim();
    if (!cleanWord || !language || !audioBase64) {
      throw new Error('word, language, and audio are required');
    }

    const byteLength = Buffer.byteLength(audioBase64, 'base64');
    if (byteLength > MAX_AUDIO_BYTES) {
      throw new Error('Recording is too long — keep it to a few seconds.');
    }

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const todayCount = await prisma.audioContribution.count({
      where: { contributorId: userId, createdAt: { gte: startOfToday } },
    });
    if (todayCount >= MAX_DAILY_CONTRIBUTIONS) {
      throw new Error("You've reached today's recording limit — come back tomorrow.");
    }

    return prisma.audioContribution.create({
      data: {
        contributorId: userId,
        word: cleanWord,
        language,
        vocabularyItemId: vocabularyItemId || null,
        audioData: audioBase64,
        mimeType: mimeType || 'audio/webm',
      },
    });
  }

  async listAudioForWord(word, language, limit = 5) {
    const contributions = await prisma.audioContribution.findMany({
      where: { word: (word || '').trim(), language, reportCount: { lt: HIDE_AFTER_REPORTS } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, createdAt: true, contributor: { select: { username: true } } },
    });
    return contributions;
  }

  async getAudioFile(id) {
    const contribution = await prisma.audioContribution.findUnique({ where: { id } });
    if (!contribution || contribution.reportCount >= HIDE_AFTER_REPORTS) return null;
    return contribution;
  }

  // One report per user, not per click — without this, a single account could call this
  // endpoint HIDE_AFTER_REPORTS times and unilaterally hide anyone else's recording.
  async reportAudio(userId, id) {
    const contribution = await prisma.audioContribution.findUnique({ where: { id } });
    if (!contribution) throw new Error('Recording not found.');
    const reporters = Array.isArray(contribution.reportedByUserIds) ? contribution.reportedByUserIds : [];
    if (reporters.includes(userId)) return contribution;
    return prisma.audioContribution.update({
      where: { id },
      data: { reportCount: { increment: 1 }, reportedByUserIds: [...reporters, userId] },
    });
  }

  async getMyAudio(userId, limit = 30) {
    return prisma.audioContribution.findMany({
      where: { contributorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, word: true, language: true, createdAt: true, reportCount: true },
    });
  }
}

module.exports = new AudioContributionService();
