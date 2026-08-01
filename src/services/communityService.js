const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const progressService = require('./progressService');

const MAX_SENTENCE_LENGTH = 400;

/**
 * Community Service — "Sentence Swap"
 * A scoped peer-correction loop: submit one sentence a day, correct one
 * from someone else. Deliberately not an open public feed (see
 * missingFeatures.md §3.7) — every submission is either pending or
 * corrected, visible only to its author and whoever corrects it.
 */
class CommunityService {
  async submitSentence(userId, language, text) {
    const trimmed = (text || '').trim();
    if (!trimmed) {
      throw new Error('Write a sentence before submitting.');
    }
    if (trimmed.length > MAX_SENTENCE_LENGTH) {
      throw new Error(`Keep it to ${MAX_SENTENCE_LENGTH} characters or fewer.`);
    }
    if (!language) {
      throw new Error('language is required');
    }

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const alreadySubmittedToday = await prisma.sentenceSubmission.findFirst({
      where: { userId, createdAt: { gte: startOfToday } },
    });
    if (alreadySubmittedToday) {
      throw new Error("You've already submitted a sentence today — come back tomorrow.");
    }

    const submission = await prisma.sentenceSubmission.create({
      data: { userId, language, text: trimmed },
    });

    progressService
      .unlockAchievement(userId, 'FIRST_SENTENCE_SUBMITTED', '✍️ First submission', 'Submitted your first sentence for correction.', 15)
      .catch((err) => logger.error('Unlock FIRST_SENTENCE_SUBMITTED error:', err));

    return submission;
  }

  /**
   * One pending sentence from someone else, oldest first (FIFO — the
   * closest thing to fairness without a matching algorithm). Never the
   * requester's own submission.
   */
  async getSentenceToCorrect(userId, language) {
    return prisma.sentenceSubmission.findFirst({
      where: { language, status: 'PENDING', userId: { not: userId } },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { username: true } } },
    });
  }

  async submitCorrection(userId, submissionId, correctedText, note) {
    const trimmedCorrection = (correctedText || '').trim();
    if (!trimmedCorrection) {
      throw new Error('Write a corrected version before submitting.');
    }

    const submission = await prisma.sentenceSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) {
      throw new Error('Sentence not found.');
    }
    if (submission.userId === userId) {
      throw new Error("You can't correct your own sentence.");
    }
    if (submission.status !== 'PENDING') {
      throw new Error('This sentence has already been corrected.');
    }

    const correction = await prisma.sentenceCorrection.create({
      data: {
        submissionId,
        correctorId: userId,
        correctedText: trimmedCorrection,
        note: note?.trim() || null,
      },
    });
    await prisma.sentenceSubmission.update({ where: { id: submissionId }, data: { status: 'CORRECTED' } });

    progressService
      .unlockAchievement(userId, 'FIRST_CORRECTION_GIVEN', '🤝 Helping hand', 'Corrected another learner\'s sentence.', 20)
      .catch((err) => logger.error('Unlock FIRST_CORRECTION_GIVEN error:', err));

    return correction;
  }

  /**
   * The learner's own submission history, each with its correction (if
   * one exists yet) — the "did anyone help me?" view.
   */
  async getMySubmissions(userId, limit = 20) {
    return prisma.sentenceSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { correction: { include: { corrector: { select: { username: true } } } } },
    });
  }

  async getStats(userId) {
    const [submitted, corrected, pendingReceived] = await Promise.all([
      prisma.sentenceSubmission.count({ where: { userId } }),
      prisma.sentenceCorrection.count({ where: { correctorId: userId } }),
      prisma.sentenceSubmission.count({ where: { userId, status: 'PENDING' } }),
    ]);
    return { submitted, corrected, pendingReceived };
  }
}

module.exports = new CommunityService();
