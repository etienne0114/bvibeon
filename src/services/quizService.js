const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

/**
 * Quiz Service
 * Handles quiz creation, management, assessment, and adaptive generation
 */
class QuizService {
  /**
   * Create a new quiz with questions
   */
  async createQuiz(lessonId, quizData, questions) {
    try {
      const quiz = await prisma.quiz.create({
        data: {
          lessonId,
          title: quizData.title,
          description: quizData.description || '',
          passingScore: quizData.passingScore || 70,
          questions: {
            create: questions.map((q) => ({
              text: q.text || q.question, // Handle both names
              type: q.type || q.questionType || 'MULTIPLE_CHOICE',
              options: q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : null,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || '',
              points: q.points || 1,
            })),
          },
        },
        include: {
          questions: true,
        },
      });

      logger.info(`Quiz created: ${quiz.id} for lesson ${lessonId}`);
      return quiz;
    } catch (error) {
      logger.error('Error creating quiz:', error);
      throw error;
    }
  }

  /**
   * Get quiz details with questions
   */
  async getQuizById(quizId, includeAnswers = false) {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: true, // We can filter answers in the return map if needed
          lesson: {
            include: { course: true },
          },
        },
      });

      if (!quiz) throw new Error('Quiz not found');

      // Filter answers if not requested
      if (!includeAnswers) {
        quiz.questions = quiz.questions.map(q => {
          const { correctAnswer, ...rest } = q;
          return rest;
        });
      }

      return quiz;
    } catch (error) {
      logger.error('Error getting quiz:', error);
      throw error;
    }
  }

  /**
   * Start a quiz attempt
   */
  async startQuizAttempt(quizId, userId) {
    try {
      const attempt = await prisma.quizAttempt.create({
        data: {
          quizId,
          userId,
          score: 0,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      logger.info(`Quiz attempt started: ${attempt.id} for user ${userId}`);
      return attempt;
    } catch (error) {
      logger.error('Error starting quiz attempt:', error);
      throw error;
    }
  }

  /**
   * Submit quiz answers and calculate results
   */
  async submitQuizAnswers(attemptId, answers) {
    try {
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: {
            include: { questions: true },
          },
        },
      });

      if (!attempt) throw new Error('Quiz attempt not found');
      if (attempt.status === 'COMPLETED') throw new Error('Attempt already completed');

      let earnedPoints = 0;
      let totalPoints = 0;
      const results = [];

      for (const question of attempt.quiz.questions) {
        totalPoints += question.points || 1;
        const userAnswer = answers[question.id];
        const isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
        
        if (isCorrect) earnedPoints += question.points || 1;

        results.push({
          questionId: question.id,
          text: question.text,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation,
        });
      }

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = score >= (attempt.quiz.passingScore || 70);

      const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          status: 'COMPLETED',
          completedAt: new Date(),
          answers: JSON.stringify(answers),
        },
      });

      return {
        attempt: updatedAttempt,
        score,
        passed,
        results,
      };
    } catch (error) {
      logger.error('Error submitting quiz answers:', error);
      throw error;
    }
  }

  /**
   * Get user's quiz history
   */
  async getUserAttempts(userId, quizId = null) {
    try {
      const where = { userId };
      if (quizId) where.quizId = quizId;

      return await prisma.quizAttempt.findMany({
        where,
        include: {
          quiz: { select: { title: true, passingScore: true } },
        },
        orderBy: { startedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error getting user quiz attempts:', error);
      throw error;
    }
  }

  /**
   * Generate adaptive quiz based on performance
   * Note: This is an architectural logic skeleton from the original monolith
   */
  async generateAdaptiveQuiz(userId, topic, questionCount = 10) {
    try {
      // Find published quizzes matching topic
      const availableQuizzes = await prisma.quiz.findMany({
        where: {
          OR: [
            { title: { contains: topic, mode: 'insensitive' } },
            { description: { contains: topic, mode: 'insensitive' } },
          ],
        },
        include: { questions: true },
      });

      if (availableQuizzes.length === 0) throw new Error('No quizzes found for topic');

      // Randomly select questions from available quizzes
      const allQuestions = availableQuizzes.flatMap(q => q.questions);
      const selectedQuestions = allQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, questionCount);

      return {
        id: `adaptive_${Date.now()}`,
        title: `Dynamic Quiz: ${topic}`,
        questions: selectedQuestions.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        })),
      };
    } catch (error) {
      logger.error('Error generating adaptive quiz:', error);
      throw error;
    }
  }
}

module.exports = new QuizService();
