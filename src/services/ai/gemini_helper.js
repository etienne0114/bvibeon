/**
 * AI Helper - Routes to DeepSeek via OpenRouter
 * 
 * This file maintains backward compatibility with existing code
 * that imports from gemini_helper.js, but now uses DeepSeek.
 * 
 * Set OPENROUTER_API_KEY or DEEPSEEK_API_KEY in your .env file
 */

const logger = require('../../utils/logger');

// Import DeepSeek helper
const deepseekHelper = require('./deepseek_helper');

// Re-export DeepSeek functions with Gemini names for backward compatibility
const {
  callDeepSeek: callGemini,
  callDeepSeekWithHistory: callGeminiWithHistory,
  validateDeepSeekConnection: validateGeminiConnection,
  DEFAULT_MODEL,
} = deepseekHelper;

// Log which AI service is being used
logger.info('[AI] 🚀 Using DeepSeek via OpenRouter as the AI backend');

module.exports = {
  callGemini,
  callGeminiWithHistory,
  validateGeminiConnection,
  DEFAULT_MODEL,
  // Also export DeepSeek-specific names
  callDeepSeek: callGemini,
  callDeepSeekWithHistory: callGeminiWithHistory,
};
