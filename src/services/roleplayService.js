const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

// Initial scenarios to seed into the database
const INITIAL_SCENARIOS = [
  {
    id: 'job_interview',
    title: 'Job interview',
    description: 'Practice answering common and technical interview questions for your dream role.',
    category: 'Professional',
    difficulty: 3,
    tags: JSON.stringify(['career', 'professional', 'interview']),
  },
  {
    id: 'restaurant_order',
    title: 'Ordering at a Restaurant',
    description: 'Practice ordering food, asking about the menu, and handling payment in a restaurant setting.',
    category: 'Travel',
    difficulty: 1,
    tags: JSON.stringify(['travel', 'dining', 'daily']),
  },
  {
    id: 'meeting_new_people',
    title: 'Meeting New People',
    description: 'Practice introducing yourself, making small talk, and starting new friendships.',
    category: 'Social',
    difficulty: 1,
    tags: JSON.stringify(['social', 'casual', 'introduction']),
  },
  {
    id: 'business_negotiation',
    title: 'Business Negotiation',
    description: 'Practice negotiating a deal, discussing terms, and reaching an agreement in a professional context.',
    category: 'Professional',
    difficulty: 4,
    tags: JSON.stringify(['business', 'negotiation', 'professional']),
  },
  {
    id: 'hotel_checkin',
    title: 'Hotel Check-in',
    description: 'Practice checking into a hotel, asking about amenities, and resolving booking issues.',
    category: 'Travel',
    difficulty: 2,
    tags: JSON.stringify(['travel', 'hotel', 'check-in']),
  },
  {
    id: 'doctor_visit',
    title: 'Visiting the Doctor',
    description: 'Practice explaining symptoms, asking questions about treatment, and understanding medical advice.',
    category: 'Service',
    difficulty: 3,
    tags: JSON.stringify(['health', 'medical', 'service']),
  },
];

class RolePlayService {
  /**
   * Seed initial scenarios if they don't exist
   */
  async seedScenarios() {
    try {
      for (const scenario of INITIAL_SCENARIOS) {
        await prisma.roleplayScenario.upsert({
          where: { id: scenario.id },
          update: {},
          create: scenario,
        });
      }
      logger.info('Roleplay scenarios seeded successfully');
    } catch (error) {
      logger.error('Failed to seed roleplay scenarios:', error);
    }
  }

  /**
   * Get all roleplay scenarios
   */
  async getScenarios({ category, filter, limit, userId }) {
    try {
      const where = {};
      if (category) where.category = category;

      let orderBy = { difficulty: 'asc' };
      if (filter === 'popular') {
        // In a real app, we'd count sessions, for now just variety
        orderBy = { id: 'desc' };
      }

      const scenarios = await prisma.roleplayScenario.findMany({
        where,
        orderBy,
        take: limit ? parseInt(limit) : undefined,
      });

      return scenarios.map(s => ({
        ...s,
        tags: typeof s.tags === 'string' ? JSON.parse(s.tags) : s.tags,
      }));
    } catch (error) {
      logger.error('Get scenarios error:', error);
      return [];
    }
  }

  /**
   * Get a specific roleplay scenario
   */
  async getScenario(scenarioId) {
    try {
      const scenario = await prisma.roleplayScenario.findUnique({
        where: { id: scenarioId },
      });
      if (scenario && typeof scenario.tags === 'string') {
        scenario.tags = JSON.parse(scenario.tags);
      }
      return scenario;
    } catch (error) {
      logger.error(`Get scenario ${scenarioId} error:`, error);
      return null;
    }
  }

  /**
   * Start a roleplay session
   */
  async startSession({ scenarioId, userId, language }) {
    try {
      const session = await prisma.roleplaySession.create({
        data: {
          scenarioId,
          userId,
          status: 'ACTIVE',
          language: language || 'en',
          metadata: JSON.stringify({ startedAt: new Date().toISOString() }),
        },
      });

      return {
        ...session,
        messages: [],
      };
    } catch (error) {
      logger.error('Start roleplay session error:', error);
      throw error;
    }
  }

  /**
   * Add message to session
   */
  async addMessage({ sessionId, role, content, translation = null, metadata = null }) {
    try {
      return await prisma.roleplayMessage.create({
        data: {
          sessionId,
          role,
          content,
          translation,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (error) {
      logger.error('Add roleplay message error:', error);
      throw error;
    }
  }

  /**
   * Get session with messages
   */
  async getSession(sessionId) {
    try {
      const session = await prisma.roleplaySession.findUnique({
        where: { id: sessionId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
          scenario: true,
        },
      });

      if (session && session.metadata) {
        session.metadata = JSON.parse(session.metadata);
      }

      return session;
    } catch (error) {
      logger.error(`Get session ${sessionId} error:`, error);
      return null;
    }
  }

  /**
   * Complete a roleplay session and generate feedback
   */
  async completeSession({ sessionId, userId, feedbackData = null }) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) throw new Error('Session not found');

      // Calculate simple score based on messages if feedback not provided
      let score = feedbackData?.score || 0;
      if (!score && session.messages.length > 0) {
        // Minimal logic: more messages = better engagement, up to a point
        score = Math.min(60 + (session.messages.length * 5), 100);
      }

      const completedSession = await prisma.roleplaySession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          score,
          feedback: feedbackData?.feedback || 'Great job practicing! Keep it up to improve your fluency.',
        },
      });

      return {
        success: true,
        sessionId,
        score,
        completedAt: completedSession.completedAt,
      };
    } catch (error) {
      logger.error('Complete roleplay session error:', error);
      throw error;
    }
  }

  /**
   * Get user progress across all roleplays
   */
  async getProgress({ userId }) {
    try {
      const sessions = await prisma.roleplaySession.findMany({
        where: { userId, status: 'COMPLETED' },
        select: { scenarioId: true, score: true, completedAt: true },
      });

      const scenariosCompleted = [...new Set(sessions.map(s => s.scenarioId))];
      const avgScore = sessions.length > 0 
        ? sessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / sessions.length 
        : 0;

      return {
        userId,
        completedSessions: sessions.length,
        scenariosCompleted,
        avgScore: parseFloat(avgScore.toFixed(1)),
        lastActivity: sessions.length > 0 ? sessions[0].completedAt : null,
      };
    } catch (error) {
      logger.error('Get roleplay progress error:', error);
      return null;
    }
  }
}

module.exports = new RolePlayService();
