const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

/**
 * Progress Service
 * Handles tracking, reporting, and analyzing user learning progress
 */
class ProgressService {
  /**
   * Enroll a user into a course (idempotent)
   */
  async enrollInCourse(userId, courseId) {
    if (!courseId) {
      throw new Error('courseId is required');
    }
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: 'PUBLISHED' },
      select: { id: true, title: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }
    const enrollment = await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
      include: { course: { select: { title: true, level: true, category: true } } },
    });
    this.unlockAchievement(
      userId,
      'FIRST_ENROLLMENT',
      'First step taken',
      `Enrolled in ${course.title} — the journey begins!`,
      25,
    ).catch(() => undefined);
    return enrollment;
  }

  /**
   * Track and update lesson progress
   */
  async trackLessonProgress(userId, { lessonId, status, completionPercentage, timeSpentMinutes }) {
    try {
      const progress = await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {
          status: status || 'IN_PROGRESS',
          completionPercentage: completionPercentage ?? (status === 'COMPLETED' ? 100 : 0),
          timeSpentMinutes: { increment: timeSpentMinutes || 0 },
          attempts: { increment: 1 },
          lastAccessedAt: new Date(),
        },
        create: {
          userId,
          lessonId,
          status: status || 'IN_PROGRESS',
          completionPercentage: completionPercentage ?? (status === 'COMPLETED' ? 100 : 0),
          timeSpentMinutes: timeSpentMinutes || 0,
          attempts: 1,
          lastAccessedAt: new Date(),
        },
        include: { lesson: { select: { courseId: true } } },
      });

      let enrollment = null;
      if (progress.lesson.courseId) {
        enrollment = await this.updateCourseProgress(userId, progress.lesson.courseId);
      }

      if (status === 'COMPLETED') {
        this.unlockAchievement(
          userId,
          'FIRST_LESSON',
          'Lesson one, done',
          'Completed your first lesson.',
          50,
        ).catch(() => undefined);
      }
      if (enrollment?.isCompleted) {
        this.unlockAchievement(
          userId,
          'COURSE_COMPLETION',
          'Course champion',
          'Completed a full course. Komera!',
          200,
        ).catch(() => undefined);
      }

      return { ...progress, courseProgress: enrollment?.progress ?? null };
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
          where: { userId, status: 'COMPLETED', lesson: { courseId } },
        }),
      ]);

      const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const isCompleted = progressPercent >= 100;

      return await prisma.courseEnrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { progress: progressPercent, isCompleted },
        create: { userId, courseId, progress: progressPercent, isCompleted },
      });
    } catch (error) {
      logger.error('Update course progress error:', error);
      throw error;
    }
  }

  /**
   * Full progress listing for the current user
   */
  async getUserProgress(userId) {
    const [enrollments, recentLessons] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where: { userId },
        include: { course: { select: { id: true, title: true, level: true, category: true, imageUrl: true } } },
        orderBy: { enrolledAt: 'desc' },
      }),
      prisma.lessonProgress.findMany({
        where: { userId },
        include: { lesson: { select: { id: true, title: true, courseId: true } } },
        orderBy: { lastAccessedAt: 'desc' },
        take: 20,
      }),
    ]);
    return { enrollments, recentLessons };
  }

  /**
   * All headline stats in ONE database round-trip, plus daily activity in a
   * second — the dashboard used to issue ~14 queries which serialize behind
   * the connection pool.
   */
  async getStatsAndActivity(userId) {
    const [statsRows, activityRows] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          (SELECT COUNT(*) FROM "LessonProgress" WHERE "userId" = ${userId})::int AS total_lessons,
          (SELECT COUNT(*) FROM "LessonProgress" WHERE "userId" = ${userId} AND status = 'COMPLETED')::int AS completed_lessons,
          (SELECT COALESCE(SUM("timeSpentMinutes"), 0) FROM "LessonProgress" WHERE "userId" = ${userId})::int AS total_time,
          (SELECT COUNT(*) FROM "QuizAttempt" WHERE "userId" = ${userId})::int AS quiz_attempts,
          (SELECT COUNT(*) FROM "CourseEnrollment" WHERE "userId" = ${userId})::int AS enrolled,
          (SELECT COUNT(*) FROM "CourseEnrollment" WHERE "userId" = ${userId} AND "isCompleted" = true)::int AS completed_courses
      `,
      prisma.$queryRaw`
        SELECT DATE("lastAccessedAt") AS day,
               COALESCE(SUM("timeSpentMinutes"), 0)::int AS minutes,
               COUNT(*)::int AS lessons
        FROM "LessonProgress"
        WHERE "userId" = ${userId}
          AND "lastAccessedAt" >= NOW() - INTERVAL '366 days'
        GROUP BY 1
      `,
    ]);
    const raw = statsRows[0] || {};
    const byDay = new Map(
      activityRows.map((r) => [new Date(r.day).toISOString().slice(0, 10), { minutes: r.minutes, lessons: r.lessons }]),
    );

    // streak: consecutive days ending today or yesterday
    let streak = 0;
    {
      const cursor = new Date();
      if (!byDay.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
      while (byDay.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    // last 7 days, zero-filled
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      weeklyActivity.push({ date: key, ...(byDay.get(key) || { minutes: 0, lessons: 0 }) });
    }

    const totalLessons = raw.total_lessons || 0;
    const completedLessons = raw.completed_lessons || 0;
    return {
      overall: {
        totalLessons,
        completedLessons,
        completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        totalTimeMinutes: raw.total_time || 0,
        streakDays: streak,
      },
      courses: { enrolled: raw.enrolled || 0, completed: raw.completed_courses || 0 },
      quizzes: { totalAttempts: raw.quiz_attempts || 0 },
      weeklyActivity,
    };
  }

  /**
   * Get user learning statistics
   */
  async getLearningStats(userId) {
    const { weeklyActivity, ...stats } = await this.getStatsAndActivity(userId);
    return stats;
  }

  /**
   * Current learning streak. Uses a bounded distinct-days query instead of
   * loading every progress row — O(365) regardless of account age.
   */
  async calculateStreak(userId) {
    try {
      const rows = await prisma.$queryRaw`
        SELECT DISTINCT DATE("lastAccessedAt") AS day
        FROM "LessonProgress"
        WHERE "userId" = ${userId}
          AND "lastAccessedAt" >= NOW() - INTERVAL '366 days'
        ORDER BY day DESC
        LIMIT 366
      `;
      if (rows.length === 0) return 0;

      const days = new Set(rows.map((r) => new Date(r.day).toISOString().slice(0, 10)));
      const cursor = new Date();
      let streak = 0;
      // A streak counts if it includes today or ended yesterday
      if (!days.has(cursor.toISOString().slice(0, 10))) {
        cursor.setDate(cursor.getDate() - 1);
      }
      while (days.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      return streak;
    } catch (error) {
      logger.error('Calculate streak error:', error);
      return 0;
    }
  }

  /**
   * Minutes and lessons per day for the past 7 days (single grouped query)
   */
  async getWeeklyActivity(userId) {
    try {
      const rows = await prisma.$queryRaw`
        SELECT DATE("lastAccessedAt") AS day,
               COALESCE(SUM("timeSpentMinutes"), 0)::int AS minutes,
               COUNT(*)::int AS lessons
        FROM "LessonProgress"
        WHERE "userId" = ${userId}
          AND "lastAccessedAt" >= NOW() - INTERVAL '7 days'
        GROUP BY 1
      `;
      const byDay = new Map(
        rows.map((r) => [new Date(r.day).toISOString().slice(0, 10), { minutes: r.minutes, lessons: r.lessons }]),
      );
      const result = [];
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const entry = byDay.get(key) || { minutes: 0, lessons: 0 };
        result.push({ date: key, ...entry });
      }
      return result;
    } catch (error) {
      logger.error('Weekly activity error:', error);
      return [];
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

  async getRecentAchievements(userId, take = 4) {
    return prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      take,
    });
  }

  /**
   * Learning Goals (one record per user; userId is not unique so upsert by lookup)
   */
  async updateGoals(userId, goals, timeframe = 'monthly') {
    try {
      const existing = await prisma.learningGoal.findFirst({ where: { userId } });
      if (existing) {
        return await prisma.learningGoal.update({
          where: { id: existing.id },
          data: { goals: JSON.stringify(goals), timeframe },
        });
      }
      return await prisma.learningGoal.create({
        data: { userId, goals: JSON.stringify(goals), timeframe },
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
