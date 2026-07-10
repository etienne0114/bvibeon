const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

/**
 * Certificate Service
 * Handles generation and verification of learning certificates
 */
class CertificateService {
  /**
   * Generate a certificate for course completion
   */
  async generateCourseCertificate(userId, courseId) {
    try {
      // 1. Check if course is actually completed
      const enrollment = await prisma.courseEnrollment.findFirst({
        where: { userId, courseId, progress: { gte: 100 } },
        include: { course: true }
      });

      if (!enrollment) {
        throw new Error('Course completion not found. Cannot generate certificate.');
      }

      // 2. Check if already exists
      const existing = await prisma.certificate.findFirst({
        where: { userId, courseId, type: 'COMPLETION' }
      });

      if (existing) return existing;

      // 3. Generate and Save
      const verifyCode = this.generateVerifyCode();
      const certificate = await prisma.certificate.create({
        data: {
          userId,
          courseId,
          title: `Completion Certificate: ${enrollment.course.title}`,
          description: `This certificate is awarded to the user for the successful completion of the course ${enrollment.course.title}.`,
          type: 'COMPLETION',
          status: 'ACTIVE',
          issuerName: 'VibeOn Learning Platform',
          verifyCode,
          metadata: {
            courseTitle: enrollment.course.title,
            finalScore: enrollment.progress,
            achievements: ['Course Master', 'Knowledge Expert']
          }
        }
      });

      logger.info(`Certificate generated: ${certificate.id} for user ${userId}`);
      return certificate;
    } catch (error) {
      logger.error('Generate course certificate error:', error);
      throw error;
    }
  }

  /**
   * Generate a skill assessment certificate
   */
  async generateSkillCertificate(userId, skillName, level, score) {
    try {
      const verifyCode = this.generateVerifyCode();
      const certificate = await prisma.certificate.create({
        data: {
          userId,
          title: `${skillName} Proficiency Certificate`,
          description: `Awarded for demonstrating proficiency in ${skillName} at ${level} level.`,
          type: 'SKILL_ASSESSMENT',
          status: 'ACTIVE',
          verifyCode,
          metadata: { skillName, level, score }
        }
      });

      logger.info(`Skill certificate generated: ${certificate.id} for user ${userId}`);
      return certificate;
    } catch (error) {
      logger.error('Generate skill certificate error:', error);
      throw error;
    }
  }

  /**
   * Verify a certificate by ID or Verification Code
   */
  async verifyCertificate(codeOrId) {
    try {
      const certificate = await prisma.certificate.findFirst({
        where: {
          OR: [
            { id: codeOrId },
            { verifyCode: codeOrId }
          ]
        },
        include: { user: { select: { username: true } }, course: { select: { title: true } } }
      });

      if (!certificate) return { valid: false, message: 'Certificate not found.' };
      if (certificate.status !== 'ACTIVE') return { valid: false, message: 'Certificate is no longer active.' };

      return {
        valid: true,
        certificate: {
          id: certificate.id,
          recipient: certificate.user.username,
          title: certificate.title,
          course: certificate.course?.title,
          issueDate: certificate.issueDate,
          issuer: certificate.issuerName,
          metadata: certificate.metadata
        }
      };
    } catch (error) {
      logger.error('Verify certificate error:', error);
      return { valid: false, message: 'Verification process failed.' };
    }
  }

  /**
   * Get user's certificates
   */
  async getUserCertificates(userId) {
    try {
      return await prisma.certificate.findMany({
        where: { userId, status: 'ACTIVE' },
        orderBy: { issueDate: 'desc' }
      });
    } catch (error) {
      logger.error('Get user certificates error:', error);
      return [];
    }
  }

  /**
   * Helper: Generate a unique verification code
   */
  generateVerifyCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars 0, O, 1, I
    let code = '';
    for (let i = 0; i < 12; i++) {
       code += chars.charAt(Math.floor(Math.random() * chars.length));
       if (i === 3 || i === 7) code += '-';
    }
    return code;
  }
}

module.exports = new CertificateService();
