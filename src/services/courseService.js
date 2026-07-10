const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const deepseekHelper = require('../services/ai/deepseek_helper');

/**
 * Course Service
 * Handles course lifecycle, discovery, analytics, and AI-powered enhancements
 */
class CourseService {
  /**
   * Create a new course with optional AI outline generation
   */
  async createCourse(userId, courseData) {
    try {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          level: courseData.level || 'BEGINNER',
          category: courseData.category || 'LANGUAGE',
          estimatedDuration: courseData.estimatedDuration || 0,
          price: courseData.price || 0,
          status: courseData.status || 'DRAFT',
          imageUrl: courseData.imageUrl,
          tags: courseData.tags ? (typeof courseData.tags === 'string' ? courseData.tags : JSON.stringify(courseData.tags)) : '[]',
          instructorId: userId,
          metadata: courseData.metadata || {},
        },
      });

      logger.info(`Course created: ${course.id} by user ${userId}`);
      return course;
    } catch (error) {
      logger.error('Create course error:', error);
      throw error;
    }
  }

  /**
   * Get courses with advanced filtering
   */
  async getCourses(filters) {
    const { category, level, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const skip = (page - 1) * limit;

    try {
      const where = {
        status: 'PUBLISHED',
        ...(category && { category }),
        ...(level && { level }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          include: {
            instructor: { select: { id: true, username: true } },
            _count: { select: { lessons: true, enrollments: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.course.count({ where }),
      ]);

      return {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get courses error:', error);
      throw error;
    }
  }

  /**
   * Enroll a user in a course
   */
  async enrollUser(userId, courseId) {
    try {
      return await prisma.courseEnrollment.create({
        data: {
          userId,
          courseId,
          progress: 0,
        },
      });
    } catch (error) {
      logger.error('Enroll user error:', error);
      throw error;
    }
  }

  /**
   * Get course analytics
   */
  async getCourseAnalytics(courseId) {
    try {
      const [enrollments, completions] = await Promise.all([
        prisma.courseEnrollment.count({ where: { courseId } }),
        prisma.courseEnrollment.count({ where: { courseId, isCompleted: true } }),
      ]);

      return {
        courseId,
        totalEnrollments: enrollments,
        totalCompletions: completions,
        completionRate: enrollments > 0 ? (completions / enrollments) * 100 : 0,
      };
    } catch (error) {
      logger.error('Get course analytics error:', error);
      throw error;
    }
  }

  /**
   * AI Course Topic Optimization
   * Suggests better titles and descriptions based on target level
   */
  async optimizeWithAI(title, description, level) {
    try {
      const prompt = `Optimize the following language course details for a ${level} level. 
      Original Title: ${title}
      Original Description: ${description}
      Return as JSON: { "title": "...", "description": "...", "suggestedTags": ["..."] }`;

      const response = await deepseekHelper.generateResponse([{ role: 'user', content: prompt }]);
      // Extract JSON (basic implementation)
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      logger.warn('AI Optimization failed:', error.message);
      return { title, description };
    }
  }
}

module.exports = new CourseService();
