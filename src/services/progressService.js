const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const certificateService = require('./certificateService');
const emailService = require('./emailService');

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
        // Awaited (not fire-and-forget): on Vercel's serverless runtime the
        // function can freeze immediately after the HTTP response is sent,
        // so an un-awaited promise here is not guaranteed to ever finish.
        await certificateService
          .generateCourseCertificate(userId, progress.lesson.courseId)
          .catch((err) => logger.error('Auto-issue certificate error:', err));
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakFreezes: true, streakFreezeDates: true, streakFreezeMilestone: true },
    });
    const [statsResult, activityResult] = await Promise.allSettled([
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
    // A blip in either query degrades to zeroed stats / empty activity rather
    // than failing the whole dashboard — the user still sees their app.
    if (statsResult.status === 'rejected') {
      logger.error('Stats query failed, using zeroed defaults:', statsResult.reason);
    }
    if (activityResult.status === 'rejected') {
      logger.error('Activity query failed, using empty defaults:', activityResult.reason);
    }
    const statsRows = statsResult.status === 'fulfilled' ? statsResult.value : [];
    const activityRows = activityResult.status === 'fulfilled' ? activityResult.value : [];
    const raw = statsRows[0] || {};
    const byDay = new Map(
      activityRows.map((r) => [new Date(r.day).toISOString().slice(0, 10), { minutes: r.minutes, lessons: r.lessons }]),
    );

    // streak: consecutive days ending today or yesterday. A single missed
    // day is auto-covered by a streak freeze if the learner has one
    // available, instead of resetting the count to zero — Duolingo's #1
    // retention mechanic, previously entirely absent here.
    let streak = 0;
    let freezesAvailable = user?.streakFreezes ?? 1;
    const freezeDatesUsed = new Set(Array.isArray(user?.streakFreezeDates) ? user.streakFreezeDates : []);
    let freezeJustUsed = false;
    {
      const cursor = new Date();
      const todayKey = cursor.toISOString().slice(0, 10);
      if (!byDay.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
      while (true) {
        const key = cursor.toISOString().slice(0, 10);
        if (byDay.has(key)) {
          streak += 1;
        } else if (freezeDatesUsed.has(key)) {
          streak += 1;
        } else if (freezesAvailable > 0 && key !== todayKey) {
          freezesAvailable -= 1;
          freezeDatesUsed.add(key);
          freezeJustUsed = true;
          streak += 1;
        } else {
          break;
        }
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    // Grant a fresh freeze every 7-day milestone the streak reaches, capped
    // at holding 2 at once — rewards consistency instead of only protecting
    // against lapses.
    let milestone = user?.streakFreezeMilestone ?? 0;
    let freezeJustGranted = false;
    if (streak > 0 && streak % 7 === 0 && streak > milestone && freezesAvailable < 2) {
      freezesAvailable += 1;
      milestone = streak;
      freezeJustGranted = true;
    } else if (streak > milestone) {
      milestone = streak;
    }

    if (user && (freezeJustUsed || freezeJustGranted || milestone !== user.streakFreezeMilestone)) {
      await prisma.user
        .update({
          where: { id: userId },
          data: {
            streakFreezes: freezesAvailable,
            streakFreezeDates: Array.from(freezeDatesUsed),
            streakFreezeMilestone: milestone,
          },
        })
        .catch((err) => logger.error('Persist streak freeze state error:', err));
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
        streakFreezes: freezesAvailable,
        streakFreezeJustUsed: freezeJustUsed,
        streakFreezeJustGranted: freezeJustGranted,
      },
      courses: { enrolled: raw.enrolled || 0, completed: raw.completed_courses || 0 },
      quizzes: { totalAttempts: raw.quiz_attempts || 0 },
      weeklyActivity,
      hadError: statsResult.status === 'rejected' || activityResult.status === 'rejected',
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
    try {
      return await prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
        take,
      });
    } catch (error) {
      logger.error('Get recent achievements error:', error);
      return [];
    }
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

  /**
   * Find learners whose last lesson activity landed 3-4 days ago (a daily
   * cron catches each lapsed learner in exactly one run) and who haven't
   * been re-engagement-emailed in the last 7 days, then send the nudge.
   * Returns a summary instead of throwing per-recipient — one bad email
   * address must not abort the whole sweep.
   */
  async sendReEngagementEmails() {
    const candidates = await prisma.$queryRaw`
      SELECT u.id, u.email, u.username, u."firstName"
      FROM "User" u
      JOIN "LessonProgress" lp ON lp."userId" = u.id
      WHERE u."lastReEngagementEmailAt" IS NULL OR u."lastReEngagementEmailAt" < NOW() - INTERVAL '7 days'
      GROUP BY u.id
      HAVING MAX(lp."lastAccessedAt") < NOW() - INTERVAL '3 days'
         AND MAX(lp."lastAccessedAt") >= NOW() - INTERVAL '4 days'
    `;

    let sent = 0;
    let failed = 0;
    for (const candidate of candidates) {
      try {
        await emailService.sendReEngagementEmail({
          to: candidate.email,
          username: candidate.firstName || candidate.username,
          daysInactive: 3,
          streakDays: 0,
        });
        await prisma.user.update({ where: { id: candidate.id }, data: { lastReEngagementEmailAt: new Date() } });
        sent += 1;
      } catch (error) {
        failed += 1;
        logger.error(`Re-engagement email failed for user ${candidate.id}:`, error);
      }
    }
    logger.info(`Re-engagement sweep: ${sent} sent, ${failed} failed, ${candidates.length} candidates.`);
    return { candidates: candidates.length, sent, failed };
  }
}

module.exports = new ProgressService();
