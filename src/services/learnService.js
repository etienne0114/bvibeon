const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const progressService = require('./progressService');
const courseService = require('./courseService');

const PRACTICE_MODULES = [
  {
    id: 'pronunciation-lab',
    title: 'Pronunciation lab',
    description: 'Record, compare, and improve speaking fluency',
    icon: '🎤',
    focus: 'Speaking & clarity',
    level: 'intermediate',
    durationMinutes: 12,
    requiredCourses: 0,
    scenarioId: 'pronunciation_default',
  },
  {
    id: 'listening-drills',
    title: 'Listening drills',
    description: 'Follow audio cues and validate answers',
    icon: '🎧',
    focus: 'Listening comprehension',
    level: 'beginner',
    durationMinutes: 8,
    requiredCourses: 0,
    scenarioId: 'listening_quick',
  },
  {
    id: 'roleplay-challenges',
    title: 'Roleplay challenges',
    description: 'Simulate conversations within curated scenarios',
    icon: '🎭',
    focus: 'Real conversation',
    level: 'intermediate',
    durationMinutes: 18,
    requiredCourses: 1,
    scenarioId: 'roleplay_default',
  },
  {
    id: 'vocabulary-quests',
    title: 'Vocabulary quests',
    description: 'Encounter new words, track mastery, and review daily',
    icon: '🧠',
    focus: 'Vocabulary & recall',
    level: 'all',
    durationMinutes: 10,
    requiredCourses: 0,
    scenarioId: 'vocab_streak',
  },
];

/**
 * Learn Service
 * High-level service that orchestrates learning features, dashboard data, and session tracking
 */
class LearnService {
  /**
   * Get learning dashboard data for a user
   */
  async getLearningDashboard(userId) {
    try {
      const [stats, courses, activity, goals] = await Promise.all([
        progressService.getLearningStats(userId),
        prisma.courseEnrollment.findMany({
          where: { userId },
          include: { course: { select: { title: true, imageUrl: true, category: true, level: true } } },
          orderBy: { enrolledAt: 'desc' },
          take: 5,
        }),
        this.getRecentActivity(userId),
        progressService.getGoals(userId),
      ]);

      // Format for frontend expectation
      return {
        summary: {
          enrolledCourses: stats.courses.enrolled,
          completedCourses: stats.courses.completed,
          activeCourses: stats.courses.enrolled - stats.courses.completed,
          streakDays: stats.overall.streakDays,
          totalTimeMinutes: stats.overall.totalTimeMinutes,
        },
        recentCourses: courses.map(e => ({
          id: e.course.id,
          title: e.course.title,
          progress: e.progress,
          imageUrl: e.course.imageUrl,
          category: e.course.category,
        })),
        recentActivity: activity,
        learningGoals: goals,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Dashboard service error:', error);
      throw error;
    }
  }

  async searchCourses(params) {
    return await courseService.getCourses(params);
  }

  async generateLearningPath(userId, goal, level) {
    logger.info(`Generating path for user ${userId} with goal: ${goal}`);
    // Proxy to course service which handles path logic
    return await courseService.getCourses({ level, limit: 5 });
  }

  async getLearningAnalytics(userId) {
    try {
      const [stats, enrollments] = await Promise.all([
        progressService.getLearningStats(userId),
        prisma.courseEnrollment.findMany({
          where: { userId },
          select: { progress: true }
        })
      ]);

      const avgProgress = enrollments.length > 0 
        ? enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length 
        : 0;

      return {
        points: stats.overall.completedLessons * 10,
        accuracy: 85, // Placeholder for real quiz accuracy
        consistency: 92,
        averageProgress: avgProgress,
        completedCourses: stats.courses.completed,
        history: [
          { day: 'Mon', value: 30 },
          { day: 'Tue', value: 45 },
          { day: 'Wed', value: 20 },
          { day: 'Thu', value: 60 },
          { day: 'Fri', value: 40 },
          { day: 'Sat', value: 70 },
          { day: 'Sun', value: 50 },
        ],
      };
    } catch (error) {
      logger.error('Analytics service error:', error);
      throw error;
    }
  }

  async getLearningMotivation(userId) {
    const stats = await progressService.getLearningStats(userId);
    const quotes = [
      "The limits of my language mean the limits of my world.",
      "Learning is a treasure that will follow its owner everywhere.",
      "A different language is a different vision of life."
    ];
    return {
      quote: quotes[Math.floor(Math.random() * quotes.length)],
      streak: stats.overall.streakDays,
      nextMilestone: "Complete 10 more lessons for a New Achievement!",
    };
  }

  async getPracticeModules(userId) {
    try {
      const stats = await progressService.getLearningStats(userId);
      const modules = PRACTICE_MODULES.map((module) => {
        const unlocked = stats.courses.enrolled >= module.requiredCourses;
        const completion = Math.min(100, Math.max(0, stats.overall.completionRate || 0));
        return {
          ...module,
          unlocked,
          completionRate: unlocked ? completion : 0,
          cadence: module.durationMinutes / 5,
          friendlyDuration: `${module.durationMinutes} min`,
        };
      });
      return { modules, stats, availableSessions: 3, generatedAt: new Date().toISOString() };
    } catch (error) {
      logger.error('Practice modules error:', error);
      throw error;
    }
  }


  /**
   * Start a learning session
   */
  async startLearningSession(userId, type, language, scenarioId = null) {
    try {
      const session = await prisma.learningSession.create({
        data: {
          userId,
          type: type || 'CONVERSATION',
          language: language || 'en',
          scenarioId,
          status: 'ACTIVE',
        },
      });

      logger.info(`Learning session started: ${session.id} for user ${userId}`);
      return session;
    } catch (error) {
      logger.error('Start learning session error:', error);
      throw error;
    }
  }

  async ensureScenario(module) {
    if (!module?.scenarioId) return null;
    let scenario = await prisma.rolePlayScenario.findUnique({ where: { id: module.scenarioId } });
    if (scenario) return scenario.id;
    scenario = await prisma.rolePlayScenario.create({
      data: {
        id: module.scenarioId,
        title: module.title,
        description: module.description,
        category: 'PRACTICE',
        difficulty: Math.max(1, Math.min(5, Math.floor(module.durationMinutes / 5))),
        instructions: `Focus: ${module.focus}`,
        tags: JSON.stringify(['practice', module.focus]),
      },
    });
    return scenario.id;
  }

  async startPracticeSession(userId, moduleId) {
    try {
      const module = PRACTICE_MODULES.find((entry) => entry.id === moduleId);
      if (!module) {
        throw new Error('Practice module not found');
      }
      const scenarioId = await this.ensureScenario(module);
      const session = await this.startLearningSession(userId, 'PRACTICE', 'en', scenarioId);
      return { moduleId, sessionId: session.id, ...module, scenarioId };
    } catch (error) {
      logger.error('Start practice session error:', error);
      throw error;
    }
  }

  /**
   * Add interaction to a learning session
   */
  async addInteraction(sessionId, interactionData) {
    try {
      const { userId, role, content, audioUrl, grammarErrors, nativeVersion } = interactionData;

      return await prisma.learningInteraction.create({
        data: {
          sessionId,
          userId,
          role,
          content,
          audioUrl,
          grammarErrors: grammarErrors ? JSON.stringify(grammarErrors) : null,
          nativeVersion,
        },
      });
    } catch (error) {
      logger.error('Add interaction error:', error);
      throw error;
    }
  }

  /**
   * Complete a learning session
   */
  async completeLearningSession(sessionId, score, feedback) {
    try {
      return await prisma.learningSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          score,
          feedback,
        },
      });
    } catch (error) {
      logger.error('Complete learning session error:', error);
      throw error;
    }
  }

  /**
   * Get recent learning activity
   */
  async getRecentActivity(userId, limit = 10) {
    try {
      const activities = await prisma.lessonProgress.findMany({
        where: { userId },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              course: { select: { title: true, imageUrl: true } },
            },
          },
        },
        orderBy: { lastAccessedAt: 'desc' },
        take: limit,
      });

      return activities.map(a => ({
        id: a.id,
        lessonTitle: a.lesson.title,
        courseTitle: a.lesson.course.title,
        status: a.status,
        percentage: a.completionPercentage,
        updatedAt: a.lastAccessedAt,
      }));
    } catch (error) {
      logger.error('Get recent activity error:', error);
      return [];
    }
  }

  /**
   * Get user learning path recommendations
   * (Architectural logic skeleton)
   */
  async getPathRecommendations(userId) {
    // Logic to suggest new courses or lessons based on history
    const stats = await progressService.getLearningStats(userId);
    // Simple logic: if beginner and no courses, suggest beginner courses
    if (stats.courses.enrolled === 0) {
      return await courseService.getCourses({ level: 'BEGINNER', limit: 3 });
    }
    return [];
  }
}

module.exports = new LearnService();
