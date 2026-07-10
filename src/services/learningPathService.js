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
      return await prisma.pathEnrollment.create({
        data: {
          userId,
          pathId,
          progress: 0,
          status: 'ACTIVE',
        },
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
}

module.exports = new LearningPathService();
