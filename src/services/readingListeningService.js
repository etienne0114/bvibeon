/**
 * Reading & Listening Service
 * Beginner reading starts from real, already-validated words sourced via
 * dictionaryService (same pool Vocabulary practice uses); Intermediate/
 * Advanced reading and all Listening content are short paragraphs
 * generated on demand via DeepSeek, cached in LearningPassage so repeats
 * are free and instant. Level unlocks progressively from real session
 * history instead of a stored "current level" field, so it can never
 * drift out of sync with what the user has actually done.
 */

const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const deepseekHelper = require('./ai/deepseek_helper');
const dictionaryService = require('./dictionaryService');

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const WORDS_PER_SESSION = 12;
const LEVEL_UP_SESSIONS = 5;
const LEVEL_UP_ACCURACY = 75;

const LANGUAGE_NAMES = { en: 'English', fr: 'French', rw: 'Kinyarwanda' };
const languageName = (lang) => LANGUAGE_NAMES[lang] || 'English';

// Used only if DeepSeek is unreachable — keeps the feature working offline
// instead of failing outright, same role buildFallbackQuiz plays for Quiz.
const FALLBACK_PARAGRAPHS = {
  en: {
    INTERMEDIATE: 'Every morning, Amara walks to the small market near her house. She buys fresh bread, a few vegetables, and sometimes a cup of coffee from her favorite stand. The market is busy and full of friendly voices, but Amara knows most of the sellers by name. On her way home, she often stops to greet her neighbors before starting her day at work.',
    ADVANCED: 'When Daniel first moved to the city, he found it overwhelming — the constant noise, the crowded streets, the sheer pace of everything. Yet within a few months, he began to notice a rhythm beneath the chaos: the same faces at the corner café, the predictable rush of the evening trains, the quiet hour just after sunrise. What had once felt like disorder slowly revealed itself as a kind of pattern, one he was gradually learning to read.',
  },
  fr: {
    INTERMEDIATE: "Chaque matin, Amara marche jusqu'au petit marché près de chez elle. Elle achète du pain frais, quelques légumes, et parfois un café à son stand préféré. Le marché est animé et plein de voix amicales, mais Amara connaît la plupart des vendeurs par leur nom.",
    ADVANCED: "Lorsque Daniel a déménagé en ville pour la première fois, il a trouvé cela accablant : le bruit constant, les rues bondées, le rythme effréné de tout. Pourtant, en quelques mois, il a commencé à remarquer un rythme sous ce chaos, une sorte de motif qu'il apprenait peu à peu à reconnaître.",
  },
  rw: {
    INTERMEDIATE: 'Buri gitondo, Amara agenda ku isoko rito riri hafi y\'inzu ye. Agura umutsima mushya, imboga nke, rimwe na rimwe agafata ikawa ku iduka ryiza. Isoko rirangwa n\'ubusabane bwinshi, kandi Amara azi abagurisha benshi mu mazina yabo.',
    ADVANCED: 'Igihe Daniel yimukiye mu mujyi bwa mbere, byari bimworoshye — urusaku rudahwema, imihanda yuzuye abantu, n\'umuvuduko w\'ibintu byose. Ariko mu mezi make, yatangiye kubona uburyo runaka bw\'ibintu munsi y\'urwo rujijo, aho yiga gahoro gahoro kubyumva.',
  },
};

const contentTypeForLevel = (level) => (level === 'BEGINNER' ? 'WORDS' : 'PARAGRAPH');

/**
 * The level unlocks purely from real session history — no stored "current
 * level" field to fall out of sync with what actually happened.
 */
async function getCurrentLevel(userId, skill, language) {
  const sessions = await prisma.skillSession.findMany({
    where: { userId, skill, passage: { language } },
    select: { accuracy: true, passage: { select: { level: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const byLevel = { BEGINNER: { count: 0, total: 0 }, INTERMEDIATE: { count: 0, total: 0 }, ADVANCED: { count: 0, total: 0 } };
  for (const s of sessions) {
    const lvl = s.passage.level;
    if (!byLevel[lvl]) continue;
    byLevel[lvl].count += 1;
    byLevel[lvl].total += s.accuracy;
  }

  const unlocked = (lvl) => {
    const st = byLevel[lvl];
    return st.count >= LEVEL_UP_SESSIONS && st.total / st.count >= LEVEL_UP_ACCURACY;
  };

  if (unlocked('INTERMEDIATE')) return 'ADVANCED';
  if (unlocked('BEGINNER')) return 'INTERMEDIATE';
  return 'BEGINNER';
}

async function generateWordsPassage(language) {
  // Reuses the SAME validated word pool Vocabulary practice draws from —
  // no reason to ask an LLM to invent a word list when a real,
  // quality-gated one already exists.
  const words = await dictionaryService.getRandomVocabularyBatch(WORDS_PER_SESSION, language, null);
  const list = words.map((w) => w.word).filter(Boolean);
  return prisma.learningPassage.create({
    data: {
      language,
      level: 'BEGINNER',
      contentType: 'WORDS',
      content: JSON.stringify(list),
      topic: 'Everyday words',
      source: 'dictionary',
    },
  });
}

async function generateParagraphPassage(language, level) {
  const wordTarget = level === 'INTERMEDIATE' ? 60 : 110;
  const prompt = `Write ONE short ${level.toLowerCase()}-level reading passage in ${languageName(language)} for a language learner.
Pick a single everyday topic (travel, food, family, work, nature, technology, health, or culture).
Requirements:
- About ${wordTarget} words, natural and grammatically correct ${languageName(language)}.
- Clear, well-formed sentences appropriate for a ${level.toLowerCase()} learner.
- Return ONLY valid JSON, no markdown, no extra text, in this exact shape:
{"topic": "short topic name", "text": "the passage"}`;

  let topic = 'General';
  let text = '';
  try {
    const raw = await deepseekHelper.callDeepSeek(prompt, { maxTokens: 500, temperature: 0.8 });
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.text && parsed.text.trim().split(/\s+/).length >= 15) {
        topic = parsed.topic || topic;
        text = parsed.text.trim();
      }
    }
  } catch (e) {
    logger.warn(`Passage generation failed, using fallback: ${e.message}`);
  }

  let source = 'ai_generated';
  if (!text) {
    text = FALLBACK_PARAGRAPHS[language]?.[level] || FALLBACK_PARAGRAPHS.en[level];
    source = 'seed';
  }

  return prisma.learningPassage.create({
    data: { language, level, contentType: 'PARAGRAPH', content: text, topic, source },
  });
}

/**
 * Fetch (or generate) the next passage for a skill session, avoiding the
 * user's own recent history for that skill so it doesn't immediately repeat.
 */
async function getPassage(userId, skill, language, requestedLevel) {
  const level = LEVELS.includes(requestedLevel) ? requestedLevel : await getCurrentLevel(userId, skill, language);
  const contentType = contentTypeForLevel(level);

  const recent = await prisma.skillSession.findMany({
    where: { userId, skill },
    select: { passageId: true },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });
  const excludeIds = recent.map((r) => r.passageId);

  const existing = await prisma.learningPassage.findMany({
    where: { language, level, contentType, id: { notIn: excludeIds } },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  let passage;
  if (existing.length > 0) {
    passage = existing[Math.floor(Math.random() * existing.length)];
  } else if (contentType === 'WORDS') {
    passage = await generateWordsPassage(language);
  } else {
    passage = await generateParagraphPassage(language, level);
  }

  return {
    passageId: passage.id,
    language: passage.language,
    level: passage.level,
    contentType: passage.contentType,
    topic: passage.topic,
    words: passage.contentType === 'WORDS' ? JSON.parse(passage.content) : undefined,
    text: passage.contentType === 'PARAGRAPH' ? passage.content : undefined,
  };
}

async function submitSession(userId, { passageId, skill, accuracy, mistakes }) {
  if (!passageId || !skill) throw new Error('passageId and skill are required');
  const passage = await prisma.learningPassage.findUnique({ where: { id: passageId } });
  if (!passage) throw new Error('Passage not found');

  const session = await prisma.skillSession.create({
    data: {
      userId,
      passageId,
      skill,
      accuracy: Math.max(0, Math.min(100, Math.round(accuracy) || 0)),
      mistakes: mistakes && mistakes.length ? JSON.stringify(mistakes) : null,
    },
  });

  const level = await getCurrentLevel(userId, skill, passage.language);
  return { sessionId: session.id, accuracy: session.accuracy, level };
}

/**
 * Same bounded distinct-days streak calculation used for the dashboard,
 * scoped to one skill via SkillSession instead of LessonProgress.
 */
async function calculateSkillStreak(userId, skill) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT DISTINCT DATE("createdAt") AS day
      FROM "SkillSession"
      WHERE "userId" = ${userId} AND "skill" = ${skill}
        AND "createdAt" >= NOW() - INTERVAL '366 days'
      ORDER BY day DESC
      LIMIT 366
    `;
    if (rows.length === 0) return 0;
    const days = new Set(rows.map((r) => new Date(r.day).toISOString().slice(0, 10)));
    const cursor = new Date();
    let streak = 0;
    if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  } catch (error) {
    logger.error('Calculate skill streak error:', error);
    return 0;
  }
}

async function getStats(userId, skill, language) {
  const sessions = await prisma.skillSession.findMany({
    where: { userId, skill, passage: { language } },
    select: { accuracy: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const totalSessions = sessions.length;
  const avgAccuracy = totalSessions ? Math.round(sessions.reduce((s, x) => s + x.accuracy, 0) / totalSessions) : 0;
  const [level, streak] = await Promise.all([getCurrentLevel(userId, skill, language), calculateSkillStreak(userId, skill)]);

  return { totalSessions, avgAccuracy, level, streak };
}

module.exports = {
  LEVELS,
  getCurrentLevel,
  getPassage,
  submitSession,
  getStats,
};
