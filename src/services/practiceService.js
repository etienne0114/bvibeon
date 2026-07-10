/**
 * Practice Service
 * Powers vocabulary (SM-2 spaced repetition), AI roleplay, AI quiz, technology learning,
 * and achievements using the local Prisma DB + DeepSeek via OpenRouter.
 */

const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const deepseekHelper = require('./ai/deepseek_helper');
const aiTutorService = require('./ai/aiTutorService');
const dictionaryService = require('./dictionaryService');
const pronunciationAssessmentService = require('./pronunciationAssessmentService');

// ─────────────────────────────────────────────────────────────────────────────
// SM-2 Spaced Repetition
// ─────────────────────────────────────────────────────────────────────────────
const SM2_INTERVALS = [1, 3, 7, 14, 30, 60, 120]; // days per mastery level

function nextReviewDate(masteryLevel) {
  const days = SM2_INTERVALS[Math.min(masteryLevel, SM2_INTERVALS.length - 1)] || 1;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed helpers
// ─────────────────────────────────────────────────────────────────────────────
const ROLEPLAY_SEED = [
  { id: 'rp-restaurant',    title: 'At the Restaurant',        description: 'Practice ordering food, asking for recommendations and the bill.',            category: 'TOURISM',      difficulty: 1, tags: '["tourism","food","service"]' },
  { id: 'rp-hotel',         title: 'Hotel Check-in',           description: 'Check in, ask about facilities, and resolve room issues.',                    category: 'TOURISM',      difficulty: 1, tags: '["tourism","accommodation"]' },
  { id: 'rp-market',        title: 'Kigali Market Bargain',    description: 'Negotiate prices at a local market and ask for directions.',                  category: 'TOURISM',      difficulty: 2, tags: '["kigali","shopping","negotiation"]' },
  { id: 'rp-airport',       title: 'Airport Arrival',          description: 'Navigate immigration, customs, and find your transfer.',                      category: 'TOURISM',      difficulty: 1, tags: '["travel","transport"]' },
  { id: 'rp-doctor',        title: 'Doctor Visit',             description: 'Describe symptoms and understand medical advice.',                             category: 'HEALTH',       difficulty: 2, tags: '["health","emergency"]' },
  { id: 'rp-job-interview', title: 'Job Interview',            description: 'Introduce yourself, discuss experience and salary expectations.',             category: 'PROFESSIONAL', difficulty: 3, tags: '["work","formal"]' },
  { id: 'rp-bank',          title: 'Banking Services',         description: 'Open an account, transfer money, and ask about exchange rates.',              category: 'PROFESSIONAL', difficulty: 2, tags: '["finance","formal"]' },
  { id: 'rp-directions',    title: 'Asking for Directions',    description: 'Find your way around using public transport and landmarks.',                  category: 'TOURISM',      difficulty: 1, tags: '["navigation","tourism"]' },
  { id: 'rp-smalltalk',     title: 'Making Small Talk',        description: 'Chat about weather, hobbies, and weekend plans with a local.',               category: 'SOCIAL',       difficulty: 1, tags: '["social","daily"]' },
  { id: 'rp-classroom',     title: 'Classroom Discussion',     description: 'Join a class debate and ask/answer academic questions.',                      category: 'ACADEMIC',     difficulty: 3, tags: '["education","formal"]' },
];

const TECH_SEED = [
  { id: 'tech-ai',       title: 'Artificial Intelligence',  description: 'Explore ML, neural networks, and practical AI applications.',  category: 'AI_BASICS',   difficulty: 2, tags: '["AI","ML","deep learning"]' },
  { id: 'tech-web',      title: 'Web Development',          description: 'HTML, CSS, JavaScript and modern frameworks.',                  category: 'PROGRAMMING', difficulty: 1, tags: '["web","frontend","backend"]' },
  { id: 'tech-data',     title: 'Data Science',             description: 'Data analysis, visualisation, and storytelling with data.',     category: 'PROGRAMMING', difficulty: 2, tags: '["data","python","statistics"]' },
  { id: 'tech-iot',      title: 'Internet of Things',       description: 'Smart devices, sensors, and connected systems.',               category: 'IOT',         difficulty: 2, tags: '["hardware","sensors","connectivity"]' },
  { id: 'tech-cyber',    title: 'Cybersecurity',            description: 'Protect systems, understand threats, and ethical hacking.',    category: 'SECURITY',    difficulty: 3, tags: '["security","hacking","privacy"]' },
  { id: 'tech-mobile',   title: 'Mobile Development',       description: 'Build Android/iOS apps with React Native or Flutter.',         category: 'PROGRAMMING', difficulty: 2, tags: '["mobile","app","cross-platform"]' },
  { id: 'tech-cloud',    title: 'Cloud Computing',          description: 'AWS, GCP, Azure — services, pricing, and architecture.',       category: 'CLOUD',       difficulty: 2, tags: '["cloud","devops","infrastructure"]' },
  { id: 'tech-blockchain', title: 'Blockchain & Web3',      description: 'Distributed ledgers, smart contracts, and DeFi concepts.',     category: 'BLOCKCHAIN',  difficulty: 3, tags: '["blockchain","crypto","smart contracts"]' },
];

const VOCAB_SEED = [
  { word: 'muraho',      language: 'rw', definition: 'Hello / Greetings', partOfSpeech: 'interjection', difficulty: 1, tags: 'greeting,kinyarwanda' },
  { word: 'murakoze',    language: 'rw', definition: 'Thank you',          partOfSpeech: 'interjection', difficulty: 1, tags: 'gratitude,kinyarwanda' },
  { word: 'amakuru',     language: 'rw', definition: 'How are you / News', partOfSpeech: 'noun',         difficulty: 1, tags: 'greeting,kinyarwanda' },
  { word: 'serendipity', language: 'en', definition: 'The occurrence of fortunate events by chance', partOfSpeech: 'noun', difficulty: 3, tags: 'advanced,english' },
  { word: 'ephemeral',   language: 'en', definition: 'Lasting for a very short time',                 partOfSpeech: 'adjective', difficulty: 3, tags: 'advanced,english' },
  { word: 'resilience',  language: 'en', definition: 'The ability to recover quickly from difficulties', partOfSpeech: 'noun', difficulty: 2, tags: 'common,english' },
  { word: 'tugende',     language: 'rw', definition: 'Let\'s go',          partOfSpeech: 'verb phrase',  difficulty: 1, tags: 'common,kinyarwanda' },
  { word: 'ubuzima',     language: 'rw', definition: 'Health / Life',      partOfSpeech: 'noun',         difficulty: 2, tags: 'health,kinyarwanda' },
  { word: 'eloquent',    language: 'en', definition: 'Fluent and persuasive in speaking or writing', partOfSpeech: 'adjective', difficulty: 2, tags: 'communication,english' },
  { word: 'pragmatic',   language: 'en', definition: 'Dealing with things practically rather than theoretically', partOfSpeech: 'adjective', difficulty: 2, tags: 'common,english' },
];

async function ensureSeedData() {
  // Seed roleplay scenarios
  for (const s of ROLEPLAY_SEED) {
    await prisma.rolePlayScenario.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  // Seed technology topics
  for (const t of TECH_SEED) {
    await prisma.technologyTopic.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }
  // Seed vocabulary items
  for (const v of VOCAB_SEED) {
    await prisma.vocabularyItem.upsert({
      where: { word_language: { word: v.word, language: v.language } },
      update: {},
      create: v,
    }).catch(() => {}); // ignore unique constraint if schema differs
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VOCABULARY
// ─────────────────────────────────────────────────────────────────────────────

async function getDailyVocabulary(userId, language = 'en') {
  await ensureSeedData();

  // Pick a word the user hasn't mastered yet, preferring overdue reviews
  const now = new Date();
  let progress = await prisma.vocabularyProgress.findFirst({
    where: {
      userId,
      vocabularyItem: { language },
      OR: [{ nextReviewAt: { lte: now } }, { nextReviewAt: null }],
      masteryLevel: { lt: 5 },
    },
    include: { vocabularyItem: true },
    orderBy: { nextReviewAt: 'asc' },
  });

  // If nothing due, pick a random word from dictionary service (REAL data)
  if (!progress) {
    const freshBatch = await dictionaryService.getRandomVocabularyBatch(1, language, userId);
    if (freshBatch.length > 0) {
      const item = freshBatch[0];
      // Upsert into VocabularyItem
      const dbItem = await prisma.vocabularyItem.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id,
          word: item.word,
          language: item.language,
          definition: item.definition,
          partOfSpeech: item.partOfSpeech,
          difficulty: item.difficulty || 1,
        }
      }).catch(async () => {
         return await prisma.vocabularyItem.findFirst({ where: { word: item.word, language: item.language } });
      });

      if (dbItem) {
        progress = { vocabularyItem: dbItem, masteryLevel: 0, streak: 0, nextReviewAt: null };
      }
    }
  }

  if (!progress) return null;

  const item = progress.vocabularyItem;
  const def = await dictionaryService.getWordDefinition(item.word, item.language);

  return {
    vocabularyItemId: item.id,
    word: item.word,
    definition: def?.meanings?.[0]?.definitions?.[0]?.definition || item.definition || '',
    partOfSpeech: def?.meanings?.[0]?.partOfSpeech || item.partOfSpeech || 'noun',
    difficulty: item.difficulty || 1,
    language: item.language,
    phonetic: def?.phonetic || '',
    audio: def?.audio || '',
    examples: dictionaryService.extractExamples(def || {}),
    synonyms: dictionaryService.extractSynonyms(def || {}),
    masteryLevel: progress.masteryLevel || 0,
    streak: progress.streak || 0,
    nextReviewAt: progress.nextReviewAt || null,
  };
}

async function getSpacedRepetitionQueue(userId, language = 'en', limit = 12) {
  await ensureSeedData();
  const now = new Date();

  const due = await prisma.vocabularyProgress.findMany({
    where: {
      userId,
      vocabularyItem: { language },
      OR: [{ nextReviewAt: { lte: now } }, { nextReviewAt: null }],
      masteryLevel: { lt: 6 },
    },
    include: { vocabularyItem: true },
    orderBy: [{ nextReviewAt: 'asc' }],
    take: limit,
  });

  if (due.length < limit) {
    const remaining = limit - due.length;
    const freshWords = await dictionaryService.getRandomVocabularyBatch(remaining, language, userId);
    
    for (const fw of freshWords) {
      due.push({
        vocabularyItem: {
          id: fw.id,
          word: fw.word,
          language: fw.language,
          definition: fw.definition,
          partOfSpeech: fw.partOfSpeech,
          difficulty: fw.difficulty || 1,
        },
        masteryLevel: 0,
        streak: 0,
        vocabularyItemId: fw.id,
        isNew: true
      });
    }
  }

  const results = [];
  for (const p of due) {
    const lookup = await dictionaryService.getWordDefinition(p.vocabularyItem.word, p.vocabularyItem.language);
    results.push({
      vocabularyItemId: p.vocabularyItemId || p.vocabularyItem.id,
      word: p.vocabularyItem.word,
      definition: lookup?.meanings?.[0]?.definitions?.[0]?.definition || p.vocabularyItem.definition || '',
      partOfSpeech: lookup?.meanings?.[0]?.partOfSpeech || p.vocabularyItem.partOfSpeech || 'noun',
      phonetic: lookup?.phonetic || '',
      difficulty: p.vocabularyItem.difficulty || 1,
      language: p.vocabularyItem.language,
      masteryLevel: p.masteryLevel || 0,
      streak: p.streak || 0,
      isNew: p.isNew || false,
    });
  }

  return results;
}

async function markVocabularyResult(userId, vocabularyItemId, correct) {
  // Ensure the item exists
  const item = await prisma.vocabularyItem.findUnique({ where: { id: vocabularyItemId } });
  if (!item) throw new Error('Vocabulary item not found');

  const existing = await prisma.vocabularyProgress.findUnique({
    where: { userId_vocabularyItemId: { userId, vocabularyItemId } },
  });

  let masteryLevel = existing?.masteryLevel ?? 0;
  let streak = existing?.streak ?? 0;
  let correctCount = existing?.correctCount ?? 0;
  let incorrectCount = existing?.incorrectCount ?? 0;

  if (correct) {
    streak += 1;
    correctCount += 1;
    if (streak >= 2) masteryLevel = Math.min(6, masteryLevel + 1);
  } else {
    streak = 0;
    incorrectCount += 1;
    masteryLevel = Math.max(0, masteryLevel - 1);
  }

  const nextReviewAt = nextReviewDate(masteryLevel);

  const progress = await prisma.vocabularyProgress.upsert({
    where: { userId_vocabularyItemId: { userId, vocabularyItemId } },
    update: { masteryLevel, streak, correctCount, incorrectCount, nextReviewAt, lastEncountered: new Date(), status: masteryLevel >= 5 ? 'MASTERED' : masteryLevel > 0 ? 'LEARNING' : 'NEW' },
    create: { userId, vocabularyItemId, masteryLevel, streak, correctCount, incorrectCount, nextReviewAt, lastEncountered: new Date(), status: 'LEARNING' },
  });

  // Auto-grant achievements
  await checkAndGrantAchievements(userId);

  return { masteryLevel: progress.masteryLevel, streak: progress.streak, nextReviewAt: progress.nextReviewAt };
}

async function getVocabularyStats(userId) {
  const all = await prisma.vocabularyProgress.findMany({
    where: { userId },
    select: { masteryLevel: true, correctCount: true, incorrectCount: true, streak: true, status: true },
  });

  const total = all.length;
  const mastered = all.filter(p => p.status === 'MASTERED').length;
  const learning = all.filter(p => p.status === 'LEARNING').length;
  const totalCorrect = all.reduce((s, p) => s + p.correctCount, 0);
  const totalAnswers = all.reduce((s, p) => s + p.correctCount + p.incorrectCount, 0);
  const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
  const currentStreak = all.reduce((max, p) => Math.max(max, p.streak), 0);

  return { totalWords: total, mastered, learning, accuracy, currentStreak };
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLEPLAY
// ─────────────────────────────────────────────────────────────────────────────

async function getRoleplayScenarios(category = null) {
  await ensureSeedData();
  const where = category ? { category } : {};
  const scenarios = await prisma.rolePlayScenario.findMany({ where, orderBy: { difficulty: 'asc' } });
  return scenarios.map(s => ({ ...s, tags: safeJson(s.tags, []) }));
}

async function startRoleplaySession(userId, scenarioId, language = 'en') {
  const scenario = await prisma.rolePlayScenario.findUnique({ where: { id: scenarioId } });
  if (!scenario) throw new Error('Scenario not found');

  const session = await prisma.learningSession.create({
    data: { userId, scenarioId, type: 'ROLEPLAY', language, status: 'ACTIVE' },
  });

  // Build roleplay-specific context
  const characterRole = scenario.category || 'a character';
  const roleplayContext = `You are roleplaying as ${characterRole}. The scenario is: "${scenario.title}". ${scenario.description}
  Instructions: ${scenario.instructions || 'Engage naturally in this roleplay scenario.'}`;

  // Generate opening AI message via aiTutorService
  const greetingData = await aiTutorService.generateGreeting({
    userId,
    userName: null, // Will use 'friend' or fetch from DB if needed
    locale: language,
  });

  await prisma.learningInteraction.create({
    data: { sessionId: session.id, userId, role: 'ASSISTANT', content: greetingData.text },
  });

  return { 
    sessionId: session.id, 
    scenario: { ...scenario, tags: safeJson(scenario.tags, []) }, 
    greeting: greetingData.text 
  };
}

async function sendRoleplayMessage(userId, sessionId, userMessage, language = 'en', audioBuffer = null) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: {
      scenario: true,
      interactions: { orderBy: { createdAt: 'asc' }, take: 20 },
    },
  });
  if (!session) throw new Error('Session not found');
  if (session.userId !== userId) throw new Error('Unauthorized');

  let processedMessage = userMessage;
  let pronunciationScore = null;

  // If audio is provided, assess pronunciation and use transcribed text
  if (audioBuffer) {
    const assessment = await pronunciationAssessmentService.assessPronunciation(
      userId, 
      userMessage, // Expected text if user followed a prompt, or just use as reference
      language, 
      audioBuffer
    );
    processedMessage = assessment.transcribedText;
    pronunciationScore = assessment.overallScore;
  }

  const characterRole = session.scenario.category || 'a character';
  const roleplayContext = `You are roleplaying as ${characterRole}. The scenario is: "${session.scenario.title}". ${session.scenario.description}`;

  const aiResult = await aiTutorService.getResponse(
    processedMessage,
    language,
    userId,
    null,
    null,
    true, // analyzeGrammar
    roleplayContext
  );

  // Persist both turns
  await prisma.learningInteraction.createMany({
    data: [
      { sessionId, userId, role: 'USER', content: processedMessage },
      { sessionId, userId, role: 'ASSISTANT', content: aiResult.text },
    ],
  });

  return { 
    reply: aiResult.text, 
    grammarErrors: aiResult.grammarErrors,
    nativeSpeakerVersion: aiResult.nativeSpeakerVersion,
    pronunciationScore,
    transcribedText: audioBuffer ? processedMessage : null
  };
}

async function completeRoleplaySession(userId, sessionId) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { interactions: { orderBy: { createdAt: 'asc' } } },
  });
  if (!session || session.userId !== userId) throw new Error('Session not found');

  const transcript = session.interactions.map(i => `${i.role}: ${i.content}`).join('\n');
  const feedbackPrompt = `Give brief encouraging feedback (3 bullet points) on this language learning roleplay:\n\n${transcript.slice(0, 1500)}\n\nFocus on: vocabulary, fluency, task completion. Be positive and specific.`;

  let feedback = 'Great practice session! Keep building your conversation skills.';
  try {
    feedback = await deepseekHelper.callDeepSeek(feedbackPrompt);
  } catch { /* non-critical */ }

  await prisma.learningSession.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED', completedAt: new Date(), feedback },
  });

  await checkAndGrantAchievements(userId);
  return { feedback, completedAt: new Date() };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ
// ─────────────────────────────────────────────────────────────────────────────

async function generateQuiz(userId, topic, language = 'en', count = 5) {
  const prompt = `Generate exactly ${count} multiple-choice questions about "${topic}" for a language learner (${language}).
Return ONLY a valid JSON array, no markdown, no extra text:
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A",
    "explanation": "..."
  }
]
Make questions educational, clear, and at intermediate level.`;

  let questions = [];
  try {
    const raw = await deepseekHelper.callDeepSeek(prompt);
    // Extract JSON array from response
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) questions = JSON.parse(match[0]);
  } catch (e) {
    logger.warn('Quiz JSON parse failed, using fallback:', e.message);
    questions = buildFallbackQuiz(topic, count);
  }

  if (!questions.length) questions = buildFallbackQuiz(topic, count);

  // Store quiz linked to a dummy lesson (or standalone)
  // Find or create a standalone lesson
  let lesson = await prisma.lesson.findFirst({ where: { title: 'AI Practice Quiz Lesson' } });
  if (!lesson) {
    let course = await prisma.course.findFirst({ where: { title: 'AI Practice Quizzes' } });
    if (!course) {
      course = await prisma.course.create({
        data: { title: 'AI Practice Quizzes', description: 'Auto-generated adaptive quizzes', level: 'ALL', estimatedDuration: 30 },
      });
    }
    lesson = await prisma.lesson.create({
      data: { courseId: course.id, title: 'AI Practice Quiz Lesson', description: 'Adaptive quiz', order: 1, duration: 15, type: 'QUIZ' },
    });
  }

  const quiz = await prisma.quiz.create({
    data: {
      lessonId: lesson.id,
      title: `Quiz: ${topic}`,
      description: `AI-generated quiz on ${topic}`,
      passingScore: 70,
      questions: {
        create: questions.map((q, i) => ({
          text: q.question,
          type: 'MULTIPLE_CHOICE',
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: 1,
        })),
      },
    },
    include: { questions: true },
  });

  return {
    quizId: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: safeJson(q.options, []),
      points: q.points,
    })),
  };
}

async function submitQuizAnswer(userId, quizId, answers) {
  // answers: [{ questionId, selectedAnswer }]
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) throw new Error('Quiz not found');

  let score = 0;
  const results = quiz.questions.map(q => {
    const userAnswer = answers.find(a => a.questionId === q.id);
    const correct = userAnswer?.selectedAnswer === q.correctAnswer;
    if (correct) score += q.points;
    return {
      questionId: q.id,
      question: q.text,
      selectedAnswer: userAnswer?.selectedAnswer || '',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      correct,
      options: safeJson(q.options, []),
    };
  });

  const maxScore = quiz.questions.reduce((s, q) => s + q.points, 0);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = percentage >= quiz.passingScore;

  await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score: percentage,
      status: 'COMPLETED',
      answers: results,
      completedAt: new Date(),
    },
  });

  await checkAndGrantAchievements(userId);

  return { score, maxScore, percentage, passed, passingScore: quiz.passingScore, results };
}

async function getQuizHistory(userId, limit = 10) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: { quiz: { select: { title: true } } },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
  return attempts.map(a => ({
    id: a.id,
    quizTitle: a.quiz.title,
    score: a.score,
    passed: a.score >= 70,
    completedAt: a.completedAt || a.startedAt,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// TECHNOLOGY
// ─────────────────────────────────────────────────────────────────────────────

async function getTechnologyTopics(category = null) {
  await ensureSeedData();
  const where = category ? { category } : {};
  const topics = await prisma.technologyTopic.findMany({ where, orderBy: { difficulty: 'asc' } });
  return topics.map(t => ({ ...t, tags: safeJson(t.tags, []) }));
}

async function startTechnologySession(userId, topicId, language = 'en') {
  const topic = await prisma.technologyTopic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error('Technology topic not found');

  const session = await prisma.learningSession.create({
    data: { userId, type: 'CONVERSATION', language, status: 'ACTIVE' },
  });

  const techContext = `You are an expert technology educator teaching "${topic.title}". ${topic.description}`;

  const greetingData = await aiTutorService.generateGreeting({
    userId,
    userName: null,
    locale: language,
  });

  await prisma.learningInteraction.create({
    data: { sessionId: session.id, userId, role: 'ASSISTANT', content: greetingData.text },
  });

  return { 
    sessionId: session.id, 
    topic: { ...topic, tags: safeJson(topic.tags, []) }, 
    intro: greetingData.text 
  };
}

async function sendTechnologyMessage(userId, sessionId, userMessage, language = 'en', audioBuffer = null) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { interactions: { orderBy: { createdAt: 'asc' }, take: 20 }, topic: true },
  });
  if (!session || session.userId !== userId) throw new Error('Session not found');

  let processedMessage = userMessage;
  let pronunciationScore = null;

  if (audioBuffer) {
    const assessment = await pronunciationAssessmentService.assessPronunciation(
      userId,
      userMessage,
      session.language || 'en',
      audioBuffer
    );
    processedMessage = assessment.transcribedText;
    pronunciationScore = assessment.overallScore;
  }

  const techContext = `You are a technology educator. The topic is "${session.topic?.title || 'Technology'}". ${session.topic?.description || ''}`;

  const aiResult = await aiTutorService.getResponse(
    processedMessage,
    session.language || 'en',
    userId,
    null,
    null,
    true,
    techContext
  );

  await prisma.learningInteraction.createMany({
    data: [
      { sessionId, userId, role: 'USER', content: processedMessage },
      { sessionId, userId, role: 'ASSISTANT', content: aiResult.text },
    ],
  });

  return { 
    reply: aiResult.text, 
    grammarErrors: aiResult.grammarErrors,
    nativeSpeakerVersion: aiResult.nativeSpeakerVersion,
    pronunciationScore,
    transcribedText: audioBuffer ? processedMessage : null
  };
}

async function completeTechnologySession(userId, sessionId) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { interactions: { orderBy: { createdAt: 'asc' } } },
  });
  if (!session || session.userId !== userId) throw new Error('Session not found');

  const transcript = session.interactions.map(i => `${i.role}: ${i.content}`).join('\n');
  const feedbackPrompt = `Summarize this technology learning session and provide 3 key takeaways for the learner in ${session.language || 'en'}:\n\n${transcript.slice(0, 1500)}`;

  let feedback = 'Great tech session! Keep exploring.';
  try {
    feedback = await deepseekHelper.callDeepSeek(feedbackPrompt);
  } catch { /* non-critical */ }

  await prisma.learningSession.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED', completedAt: new Date(), feedback },
  });

  await checkAndGrantAchievements(userId);
  return { feedback, completedAt: new Date() };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────

const ACHIEVEMENT_RULES = [
  { type: 'FIRST_WORD',       title: '🌱 First Word',         description: 'Learned your first vocabulary word',         xpReward: 10,  check: async (userId) => (await prisma.vocabularyProgress.count({ where: { userId } })) >= 1 },
  { type: 'VOCAB_10',         title: '📚 Word Collector',      description: 'Learned 10 vocabulary words',                xpReward: 25,  check: async (userId) => (await prisma.vocabularyProgress.count({ where: { userId } })) >= 10 },
  { type: 'VOCAB_50',         title: '🧠 Vocabulary Vault',    description: 'Mastered 50 vocabulary words',               xpReward: 100, check: async (userId) => (await prisma.vocabularyProgress.count({ where: { userId, status: 'MASTERED' } })) >= 50 },
  { type: 'FIRST_ROLEPLAY',   title: '🎭 Conversation Starter','description': 'Completed your first roleplay session',   xpReward: 30,  check: async (userId) => (await prisma.learningSession.count({ where: { userId, type: 'ROLEPLAY', status: 'COMPLETED' } })) >= 1 },
  { type: 'ROLEPLAY_5',       title: '🗣️ Fluent Conversationalist', description: 'Completed 5 roleplay sessions',        xpReward: 75,  check: async (userId) => (await prisma.learningSession.count({ where: { userId, type: 'ROLEPLAY', status: 'COMPLETED' } })) >= 5 },
  { type: 'FIRST_QUIZ',       title: '✅ Quiz Taker',           description: 'Completed your first quiz',                 xpReward: 20,  check: async (userId) => (await prisma.quizAttempt.count({ where: { userId } })) >= 1 },
  { type: 'QUIZ_PERFECT',     title: '🏆 Perfect Score',       description: 'Scored 100% on a quiz',                     xpReward: 50,  check: async (userId) => (await prisma.quizAttempt.count({ where: { userId, score: 100 } })) >= 1 },
  { type: 'TECH_SESSION',     title: '💻 Tech Explorer',       description: 'Started a technology learning session',      xpReward: 20,  check: async (userId) => (await prisma.learningSession.count({ where: { userId, type: 'CONVERSATION', status: 'ACTIVE' } })) >= 1 },
  { type: 'COURSE_ENROLLED',  title: '📖 Course Enrolled',     description: 'Enrolled in your first course',              xpReward: 15,  check: async (userId) => (await prisma.courseEnrollment.count({ where: { userId } })) >= 1 },
];

async function checkAndGrantAchievements(userId) {
  for (const rule of ACHIEVEMENT_RULES) {
    try {
      const alreadyHas = await prisma.achievement.findFirst({ where: { userId, type: rule.type } });
      if (alreadyHas) continue;
      const earned = await rule.check(userId);
      if (earned) {
        await prisma.achievement.create({
          data: { userId, title: rule.title, description: rule.description, type: rule.type, xpReward: rule.xpReward, unlockedAt: new Date() },
        });
        logger.info(`Achievement unlocked for ${userId}: ${rule.type}`);
      }
    } catch { /* non-blocking */ }
  }
}

async function getAchievements(userId) {
  await checkAndGrantAchievements(userId);
  const unlocked = await prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
  });
  // Build full list with locked status
  const all = ACHIEVEMENT_RULES.map(rule => {
    const found = unlocked.find(a => a.type === rule.type);
    return {
      type: rule.type,
      title: rule.title,
      description: rule.description,
      xpReward: rule.xpReward,
      unlocked: !!found,
      unlockedAt: found?.unlockedAt || null,
    };
  });
  const totalXP = unlocked.reduce((s, a) => s + (a.xpReward || 0), 0);
  return { achievements: all, totalXP, unlockedCount: unlocked.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildRoleplaySystem(scenario, language) {
  return `You are a language learning roleplay partner helping someone practice ${language}.
Scenario: ${scenario.title}
Description: ${scenario.description}
Instructions: ${scenario.instructions || 'Act as a natural conversation partner in this scenario.'}
Rules:
- Stay in character throughout the scenario
- Use natural, conversational ${language}
- If the user makes grammar mistakes, gently weave the correct form into your reply without being preachy
- Keep each reply to 2-4 sentences
- Progress the scenario naturally toward a conclusion
- Speak directly as your character, NOT as an AI`;
}

function buildTechSystem(topic, language) {
  return `You are an expert technology educator teaching "${topic.title}".
Topic: ${topic.description}
Category: ${topic.category}
Difficulty: ${topic.difficulty}/5
Language: ${language}
Rules:
- Explain concepts clearly with practical examples
- Connect to real African tech applications when possible (Rwanda drones, M-Pesa, etc.)
- Keep replies concise (3-5 sentences) and always end with a question or exercise
- Use analogies to make complex ideas accessible
- Encourage curiosity and hands-on experimentation`;
}

async function quickGrammarCheck(text, language) {
  if (language !== 'en') return null;
  const prompt = `Check this sentence for grammar errors (1 sentence max): "${text.slice(0, 200)}"
If correct, reply "✓ Looks good!". If there's an error, reply with just: "Tip: [corrected version]". No explanations.`;
  try {
    const result = await deepseekHelper.callDeepSeek(prompt);
    return result?.trim()?.startsWith('✓') ? null : result?.trim();
  } catch { return null; }
}

function buildFallbackQuiz(topic, count) {
  return Array.from({ length: count }, (_, i) => ({
    question: `What is an important aspect of ${topic}? (Question ${i + 1})`,
    options: ['A) Basic concept', 'B) Advanced feature', 'C) Common mistake', 'D) Best practice'],
    correctAnswer: 'D',
    explanation: `Best practices in ${topic} are fundamental to success.`,
  }));
}

function safeJson(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

module.exports = {
  getDailyVocabulary,
  getSpacedRepetitionQueue,
  markVocabularyResult,
  getVocabularyStats,
  getRoleplayScenarios,
  startRoleplaySession,
  sendRoleplayMessage,
  completeRoleplaySession,
  generateQuiz,
  submitQuizAnswer,
  getQuizHistory,
  getTechnologyTopics,
  startTechnologySession,
  sendTechnologyMessage,
  completeTechnologySession,
  getAchievements,
  checkAndGrantAchievements,
};
