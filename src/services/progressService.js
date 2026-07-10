const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

/**
 * Progress Service
 * Handles tracking, reporting, and analyzing user learning progress
 */
class ProgressService {
  /**
   * Track and update lesson progress
   */
  async trackLessonProgress(userId, lessonId, progressData) {
    try {
      const { status, completionPercentage, timeSpentMinutes } = progressData;

      const progress = await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {
          status: status || 'IN_PROGRESS',
          completionPercentage: completionPercentage || 0,
          timeSpentMinutes: { increment: timeSpentMinutes || 0 },
          attempts: { increment: 1 },
          lastAccessedAt: new Date(),
        },
        create: {
          userId,
          lessonId,
          status: status || 'IN_PROGRESS',
          completionPercentage: completionPercentage || 0,
          timeSpentMinutes: timeSpentMinutes || 0,
          attempts: 1,
          lastAccessedAt: new Date(),
        },
        include: { lesson: { select: { courseId: true } } },
      });

      // Update course enrollment progress
      if (progress.lesson.courseId) {
        await this.updateCourseProgress(userId, progress.lesson.courseId);
      }

      return progress;
    } catch (error) {
      logger.error('Track lesson progress error:', error);
      throw error;
    }
  }

  /**
   * Update overall course progress
   */
  async updateCourseProgress(userId, courseId) {
    try {
      const [totalLessons, completedLessons] = await Promise.all([
        prisma.lesson.count({ where: { courseId, status: 'PUBLISHED' } }),
        prisma.lessonProgress.count({
          where: { userId, lesson: { courseId }, status: 'COMPLETED' },
        }),
      ]);

      const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const isCompleted = progressPercent >= 100;

      return await prisma.courseEnrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          progress: progressPercent,
          isCompleted,
        },
      });
    } catch (error) {
      logger.error('Update course progress error:', error);
      throw error;
    }
  }

  /**
   * Get user learning statistics
   */
  async getLearningStats(userId) {
    try {
      const [
        totalLessons,
        completedLessons,
        totalQuizAttempts,
        totalTime,
        enrolledCourses,
        completedCourses,
      ] = await Promise.all([
        prisma.lessonProgress.count({ where: { userId } }),
        prisma.lessonProgress.count({ where: { userId, status: 'COMPLETED' } }),
        prisma.quizAttempt.count({ where: { userId } }),
        prisma.lessonProgress.aggregate({
          where: { userId },
          _sum: { timeSpentMinutes: true },
        }),
        prisma.courseEnrollment.count({ where: { userId } }),
        prisma.courseEnrollment.count({ where: { userId, isCompleted: true } }),
      ]);

      const streak = await this.calculateStreak(userId);

      return {
        overall: {
          totalLessons,
          completedLessons,
          completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
          totalTimeMinutes: totalTime._sum.timeSpentMinutes || 0,
          streakDays: streak,
        },
        courses: {
          enrolled: enrolledCourses,
          completed: completedCourses,
        },
        quizzes: {
          totalAttempts: totalQuizAttempts,
        },
      };
    } catch (error) {
      logger.error('Get learning stats error:', error);
      throw error;
    }
  }

  /**
   * Calculate current learning streak
   */
  async calculateStreak(userId) {
    try {
      const activities = await prisma.lessonProgress.findMany({
        where: { userId },
        select: { lastAccessedAt: true },
        orderBy: { lastAccessedAt: 'desc' },
      });

      if (activities.length === 0) return 0;

      let streak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      // Unique days set
      const activityDays = new Set(
        activities.map(a => {
          const d = new Date(a.lastAccessedAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      while (activityDays.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Check if streak is still valid (activity today or yesterday)
      if (streak === 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        if (activityDays.has(yesterday.getTime())) {
          checkDate = yesterday;
          while (activityDays.has(checkDate.getTime())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
        }
      }

      return streak;
    } catch (error) {
      logger.error('Calculate streak error:', error);
      return 0;
    }
  }

  /**
   * Achievement management
   */
  async unlockAchievement(userId, type, title, description, xp = 50) {
    try {
      const existing = await prisma.achievement.findFirst({
        where: { userId, type },
      });

      if (existing) return existing;

      const achievement = await prisma.achievement.create({
        data: {
          userId,
          type,
          title,
          description,
          xpReward: xp,
        },
      });

      logger.info(`Achievement unlocked: ${title} for user ${userId}`);
      return achievement;
    } catch (error) {
      logger.error('Unlock achievement error:', error);
      throw error;
    }
  }

  /**
   * Learning Goals
   */
  async updateGoals(userId, goals, timeframe = 'monthly') {
    try {
      return await prisma.learningGoal.upsert({
        where: { userId }, // Note: assuming 1 goal record per user for simplicity
        update: {
          goals: JSON.stringify(goals),
          timeframe,
        },
        create: {
          userId,
          goals: JSON.stringify(goals),
          timeframe,
        },
      });
    } catch (error) {
      logger.error('Update goals error:', error);
      throw error;
    }
  }

  async getGoals(userId) {
    try {
      const goal = await prisma.learningGoal.findFirst({ where: { userId } });
      if (!goal) return { goals: [], timeframe: 'monthly' };
      return {
        ...goal,
        goals: JSON.parse(goal.goals),
      };
    } catch (error) {
      logger.error('Get goals error:', error);
      return { goals: [], timeframe: 'monthly' };
    }
  }
}

module.exports = new ProgressService();
