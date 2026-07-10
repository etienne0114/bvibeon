const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const crypto = require('crypto');
const translatorIntegrationService = require('./translator/translatorIntegrationService');

/**
 * Pronunciation Assessment Service
 * Analyzes user speech, calculates accuracy, and provides detailed feedback
 */
class PronunciationAssessmentService {
  constructor() {
    this.supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];
  }

  /**
   * Assess pronunciation of a given text
   * @param {string} userId - User ID
   * @param {string} expectedText - The text the user was supposed to say
   * @param {string} language - Target language code
   * @param {Buffer} audioBuffer - User's recorded audio
   */
  async assessPronunciation(userId, expectedText, language, audioBuffer) {
    try {
      logger.info(`Starting pronunciation assessment for user ${userId}`, { language, expectedText: expectedText.substring(0, 50) });

      // 1. Transcribe audio using STT service
      const audioBase64 = audioBuffer.toString('base64');
      const transcriptionResult = await translatorIntegrationService.transcribeAudioFromBase64(audioBase64, language, false);

      if (!transcriptionResult?.success || !transcriptionResult?.data?.text) {
        throw new Error('STT service failed to transcribe audio. Please speak clearly.');
      }

      const transcribedText = transcriptionResult.data.text.trim();
      const confidence = transcriptionResult.data.confidence || 0;

      // 2. Perform comparison and scoring
      const words = expectedText.split(/\s+/).filter(w => w.length > 0);
      const transcribedWords = transcribedText.split(/\s+/).filter(w => w.length > 0);

      const wordScores = await this._matchAndScoreWords(words, transcribedWords);
      const overallScore = this._calculateOverallScore(wordScores);
      
      const pronunciationScore = this._calculateSimilarity(expectedText.toLowerCase(), transcribedText.toLowerCase()) * 100;
      const fluencyScore = this._calculateFluency(transcribedWords);
      const clarityScore = confidence * 100;

      // 3. Persist results
      const speechSession = await prisma.speechSession.create({
        data: {
          userId,
          targetLanguage: language,
          audioUrl: `local-buffer-${Date.now()}`, // In real app, upload to S3/Cloudinary first
          transcription: transcribedText,
          confidence: confidence,
          duration: Math.round(audioBuffer.length / 16000), // Approximate duration
          assessment: {
            create: {
              overallScore,
              pronunciationScore,
              fluencyScore,
              clarityScore,
              wordScores: JSON.stringify(wordScores),
              feedback: this._generateFeedbackMsg(overallScore),
              improvementAreas: JSON.stringify(wordScores.filter(w => w.score < 60).map(w => w.word)),
              strongPoints: JSON.stringify(wordScores.filter(w => w.score >= 80).map(w => w.word)),
            }
          }
        },
        include: { assessment: true }
      });

      return {
        speechSessionId: speechSession.id,
        transcribedText,
        overallScore,
        pronunciationScore,
        fluencyScore,
        clarityScore,
        wordScores,
        feedback: speechSession.assessment.feedback,
      };
    } catch (error) {
      logger.error('Assessment error:', error);
      throw error;
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(userId, language = null) {
    try {
      const assessments = await prisma.speechAssessment.findMany({
        where: {
          speechSession: {
            userId,
            ...(language && { targetLanguage: language }),
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      if (assessments.length === 0) return { averageScore: 0, totalAssessments: 0 };

      const total = assessments.reduce((acc, curr) => acc + curr.overallScore, 0);
      return {
        averageScore: total / assessments.length,
        totalAssessments: assessments.length,
        recentScores: assessments.map(a => ({ score: a.overallScore, date: a.createdAt })),
      };
    } catch (e) {
      logger.error('Get stats error:', e);
      return { averageScore: 0, totalAssessments: 0 };
    }
  }

  // Internal Logic Helpers
  async _matchAndScoreWords(expected, transcribed) {
    return expected.map((word, i) => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      // Simple index-based match for now; could upgrade to fuzzy set alignment
      const transcribedWord = transcribed[i] || '';
      const similarity = this._calculateSimilarity(cleanWord, transcribedWord.toLowerCase());
      
      return {
        word,
        score: Math.round(similarity * 100),
        transcribed: transcribedWord,
        issues: similarity < 0.6 ? ['Unclear pronunciation'] : [],
      };
    });
  }

  _calculateOverallScore(wordScores) {
    if (wordScores.length === 0) return 0;
    const total = wordScores.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(total / wordScores.length);
  }

  _calculateSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1.0;
    
    // Levenshtein-based similarity
    const len1 = s1.length, len2 = s2.length;
    const matrix = Array(len1 + 1).fill(0).map(() => Array(len2 + 1).fill(0));
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      }
    }
    const dist = matrix[len1][len2];
    return 1 - (dist / Math.max(len1, len2));
  }

  _calculateFluency(words) {
    // Basic fluency indicator: more words = better fluency, up to a limit
    const score = Math.min(60 + (words.length * 4), 100);
    return score;
  }

  _generateFeedbackMsg(score) {
    if (score >= 90) return 'Excellent! Your pronunciation is near-native.';
    if (score >= 75) return 'Great work! You are clearly understandable.';
    if (score >= 50) return 'Good start! Practice the highlighted words to improve clarity.';
    return 'Keep practicing! Try listening to the native audio and repeat slowly.';
  }
}

module.exports = new PronunciationAssessmentService();
