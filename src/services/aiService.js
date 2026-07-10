const deepseekHelper = require('./ai/deepseek_helper');
const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

async function chatWithTutor({ userId, message, sessionId = null }) {
  try {
    let session;
    if (sessionId) {
      session = await prisma.learningSession.findUnique({
        where: { id: sessionId },
        include: { interactions: { orderBy: { createdAt: 'asc' }, take: 10 } }
      });
    }

    if (!session) {
      session = await prisma.learningSession.create({
        data: {
          userId,
          type: 'TUTOR',
          status: 'ACTIVE',
        },
        include: { interactions: true }
      });
    }

    // Build context from history
    const history = (session.interactions || []).map(i => ({
      role: i.role === 'ASSISTANT' ? 'assistant' : 'user',
      content: i.content
    }));

    const messages = [
      { role: 'system', content: 'You are Vibeon Tutor, a helpful and encouraging language learning assistant. Help the user with their language goals, explain grammar, and provide practice examples.' },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await deepseekHelper.callDeepSeekWithHistory(messages);

    // Persist interactions
    await prisma.learningInteraction.createMany({
      data: [
        { sessionId: session.id, userId, role: 'USER', content: message },
        { sessionId: session.id, userId, role: 'ASSISTANT', content: response }
      ]
    });

    return {
      sessionId: session.id,
      message,
      response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('AI Tutor error:', error);
    throw new Error('Tutor is currently offline. Please try again later.');
  }
}

module.exports = {
  chatWithTutor,
};
