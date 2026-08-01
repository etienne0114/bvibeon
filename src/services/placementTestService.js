const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

// Reuses the exact question banks already written for the tense courses'
// "Compared" capstone reviews instead of maintaining a separate test bank —
// same content, same explanations, already proofread. A fixed 4-question
// slice per tense (12 total) keeps the test short while still covering
// present/past/future.
const CAPSTONE_TITLES = ['Present Tenses Compared', 'Past Tenses Compared', 'Future Tenses Compared'];
const QUESTIONS_PER_CAPSTONE = 4;

const LEVEL_THRESHOLDS = [
  { min: 10, level: 'ADVANCED' },
  { min: 7, level: 'INTERMEDIATE' },
  { min: 4, level: 'ELEMENTARY' },
  { min: 0, level: 'BEGINNER' },
];

function scoreToLevel(score) {
  return LEVEL_THRESHOLDS.find((t) => score >= t.min).level;
}

class PlacementTestService {
  /**
   * Deterministic, ordered list of 12 canonical questions (present → past →
   * future, 4 each). Same order every call so a client's answer array
   * always lines up with this list without needing per-question IDs.
   */
  async _getCanonicalQuestions() {
    const lessons = await prisma.lesson.findMany({
      where: { title: { in: CAPSTONE_TITLES } },
      select: { title: true, content: true },
    });
    const byTitle = new Map(lessons.map((l) => [l.title, l]));

    const all = [];
    for (const title of CAPSTONE_TITLES) {
      const lesson = byTitle.get(title);
      if (!lesson) continue;
      const practiceSection = (lesson.content?.sections || []).find((s) => s.type === 'practice');
      const questions = (practiceSection?.questions || []).slice(0, QUESTIONS_PER_CAPSTONE);
      all.push(...questions);
    }
    return all;
  }

  /**
   * The test as shown to the learner — answers/explanations stripped so
   * they can't be read from the network tab before submitting.
   */
  async getQuestions() {
    const questions = await this._getCanonicalQuestions();
    if (questions.length === 0) {
      throw new Error('Placement test is not available right now.');
    }
    return questions.map((q, i) => ({
      index: i,
      type: q.type === 'fill' ? 'fill' : 'mc',
      question: q.question,
      options: q.type === 'fill' ? undefined : q.options,
    }));
  }

  /**
   * Grades against the same canonical list server-side — a client can never
   * submit its own score. Updates the user's proficiencyLevel to the result.
   */
  async submit(userId, answers) {
    const questions = await this._getCanonicalQuestions();
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      throw new Error(`Expected ${questions.length} answers.`);
    }

    let correctCount = 0;
    const breakdown = questions.map((q, i) => {
      const response = answers[i];
      let correct;
      if (q.type === 'fill') {
        const normalize = (s) => String(s || '').trim().toLowerCase();
        const acceptable = [q.answer, ...(q.acceptableAnswers || [])].map(normalize);
        correct = acceptable.includes(normalize(response));
      } else {
        correct = Number(response) === q.correctIndex;
      }
      if (correct) correctCount += 1;
      return { index: i, correct, explanation: q.explanation };
    });

    const recommendedLevel = scoreToLevel(correctCount);

    await prisma.user
      .update({ where: { id: userId }, data: { proficiencyLevel: recommendedLevel } })
      .catch((err) => logger.error('Persist placement-test level error:', err));

    return {
      score: correctCount,
      total: questions.length,
      recommendedLevel,
      breakdown,
    };
  }
}

module.exports = new PlacementTestService();
