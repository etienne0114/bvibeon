const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

/**
 * Learning Path Service
 * Manages structured sequences of courses/lessons and user progression through them
 */
class LearningPathService {
  /**
   * Create a new learning path with steps
   */
  async createPath(userId, pathData, steps = []) {
    try {
      const learningPath = await prisma.learningPath.create({
        data: {
          title: pathData.title,
          description: pathData.description,
          difficulty: pathData.difficulty || 'BEGINNER',
          creatorId: userId,
          status: pathData.status || 'DRAFT',
          tags: pathData.tags ? (typeof pathData.tags === 'string' ? pathData.tags : JSON.stringify(pathData.tags)) : '[]',
          prerequisites: pathData.prerequisites ? (typeof pathData.prerequisites === 'string' ? pathData.prerequisites : JSON.stringify(pathData.prerequisites)) : '[]',
          estimatedDuration: pathData.estimatedDuration || 0,
          metadata: pathData.metadata || {},
          steps: {
            create: steps.map((step, i) => ({
              title: step.title,
              description: step.description,
              courseId: step.courseId,
              order: i + 1,
              isRequired: step.isRequired !== false,
              estimatedTime: step.estimatedTime || 30,
            })),
          },
        },
        include: { steps: true },
      });

      logger.info(`Learning path created: ${learningPath.id} by user ${userId}`);
      return learningPath;
    } catch (error) {
      logger.error('Create learning path error:', error);
      throw error;
    }
  }

  /**
   * Get learning path with its steps and course details
   */
  async getPath(pathId) {
    try {
      return await prisma.learningPath.findUnique({
        where: { id: pathId },
        include: {
          steps: {
            include: { course: true },
            orderBy: { order: 'asc' },
          },
          creator: { select: { id: true, username: true } },
        },
      });
    } catch (error) {
      logger.error('Get learning path error:', error);
      throw error;
    }
  }

  /**
   * Enroll user in a learning path
   */
  async enrollUser(userId, pathId) {
    try {
      const path = await prisma.learningPath.findUnique({ where: { id: pathId }, select: { id: true } });
      if (!path) throw new Error('Learning path not found');
      return await prisma.pathEnrollment.upsert({
        where: { userId_pathId: { userId, pathId } },
        update: {},
        create: { userId, pathId, progress: 0, status: 'ACTIVE' },
      });
    } catch (error) {
      logger.error('Enroll in path error:', error);
      throw error;
    }
  }

  /**
   * Update progress in a learning path
   * Calculations can be complex, for now we allow direct updates
   */
  async updateProgress(userId, pathId, progress) {
    try {
      return await prisma.pathEnrollment.update({
        where: { userId_pathId: { userId, pathId } },
        data: {
          progress: Math.min(100, progress),
          status: progress >= 100 ? 'COMPLETED' : 'ACTIVE',
        },
      });
    } catch (error) {
      logger.error('Update path progress error:', error);
      throw error;
    }
  }

  /**
   * List available learning paths
   */
  async listPaths(filters = {}) {
    const { difficulty, status = 'PUBLISHED', limit = 10 } = filters;
    try {
      return await prisma.learningPath.findMany({
        where: {
          status,
          ...(difficulty && { difficulty }),
        },
        include: { _count: { select: { steps: true, enrollments: true } } },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('List paths error:', error);
      throw error;
    }
  }

  /**
   * Published paths plus, for a signed-in learner, whether they're
   * enrolled and their current progress — so the catalog screen never
   * needs a second round trip per card.
   */
  async listPathsForUser(userId, filters = {}) {
    const paths = await this.listPaths(filters);
    if (!userId || paths.length === 0) return paths.map((p) => ({ ...p, enrollment: null }));

    const enrollments = await prisma.pathEnrollment.findMany({
      where: { userId, pathId: { in: paths.map((p) => p.id) } },
    });
    const byPathId = new Map(enrollments.map((e) => [e.pathId, e]));
    return paths.map((p) => ({ ...p, enrollment: byPathId.get(p.id) || null }));
  }

  /**
   * Path detail with each step annotated by the learner's real progress in
   * that step's course — steps carry no progress of their own, so this
   * reads the same CourseEnrollment data the Courses tab already shows,
   * keeping the two views from ever disagreeing.
   */
  async getPathWithProgress(userId, pathId) {
    const path = await this.getPath(pathId);
    if (!path) return null;

    const courseIds = path.steps.map((s) => s.courseId).filter(Boolean);
    const [enrollment, courseEnrollments] = await Promise.all([
      userId ? prisma.pathEnrollment.findUnique({ where: { userId_pathId: { userId, pathId } } }) : null,
      userId && courseIds.length
        ? prisma.courseEnrollment.findMany({ where: { userId, courseId: { in: courseIds } } })
        : [],
    ]);
    const progressByCourseId = new Map(courseEnrollments.map((e) => [e.courseId, e]));

    const steps = path.steps.map((step) => {
      const courseProgress = step.courseId ? progressByCourseId.get(step.courseId) : null;
      return {
        ...step,
        courseEnrolled: Boolean(courseProgress),
        courseProgress: courseProgress?.progress ?? 0,
        courseCompleted: courseProgress?.isCompleted ?? false,
      };
    });

    // Auto-heal the enrollment's overall progress from the steps' real
    // course progress, the same "recompute on read" pattern used for
    // course/streak progress elsewhere — no separate cron needed.
    if (enrollment && steps.length > 0) {
      const requiredSteps = steps.filter((s) => s.isRequired);
      const denom = requiredSteps.length || steps.length;
      const completedCount = (requiredSteps.length ? requiredSteps : steps).filter((s) => s.courseCompleted).length;
      const computedProgress = Math.round((completedCount / denom) * 100);
      if (computedProgress !== enrollment.progress) {
        await this.updateProgress(userId, pathId, computedProgress).catch((err) =>
          logger.error('Auto-update path progress error:', err),
        );
        enrollment.progress = computedProgress;
        enrollment.status = computedProgress >= 100 ? 'COMPLETED' : 'ACTIVE';
      }
    }

    return { ...path, steps, enrollment };
  }
}

module.exports = new LearningPathService();
