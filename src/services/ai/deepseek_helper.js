/**
 * DeepSeek AI Helper using OpenRouter API
 * 
 * OpenRouter provides access to DeepSeek and other AI models
 * through a unified OpenAI-compatible API.
 */

const logger = require('../../utils/logger');

// OpenRouter API configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// DeepSeek models available on OpenRouter
const DEFAULT_MODEL = 'deepseek/deepseek-chat';
const FALLBACK_MODELS = [
  'deepseek/deepseek-chat',           // DeepSeek V3 Chat - Fast and capable
  'deepseek/deepseek-r1',             // DeepSeek R1 - Reasoning model
  'deepseek/deepseek-r1-distill-llama-70b', // Distilled version
  'deepseek/deepseek-coder',          // For code tasks
];

let validatedModel = null; // Cache the working model

/**
 * Get OpenRouter API key from environment
 * Supports both OPENROUTER_API_KEY and DEEPSEEK_API_KEY
 */
function getApiKey() {
  return process.env.OPENROUTER_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.GEMINI_API_KEY; // Fallback for easy migration
}

/**
 * Validate DeepSeek connection via OpenRouter
 * @returns {Promise<string>} Working model name
 */
async function validateDeepSeekConnection() {
  if (validatedModel) {
    return validatedModel;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenRouter/DeepSeek API key not configured. Please set OPENROUTER_API_KEY or DEEPSEEK_API_KEY in your .env file');
  }

  logger.info('[DeepSeek] Testing connection via OpenRouter...');

  for (const modelName of FALLBACK_MODELS) {
    try {
      logger.info(`[DeepSeek] Testing model: ${modelName}`);

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'https://vibeon.com',
          'X-Title': 'Vibeon Learning Platform',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (text && text.length > 0) {
        logger.info(`[DeepSeek] ✅ SUCCESS! Using model: ${modelName}`);
        validatedModel = modelName;
        return modelName;
      }
    } catch (error) {
      logger.warn(`[DeepSeek] Model ${modelName} failed: ${error.message?.substring(0, 100)}`);
    }
  }

  throw new Error('No working DeepSeek model found. Please verify your API key at https://openrouter.ai/keys');
}

/**
 * Call DeepSeek API via OpenRouter
 * @param {string} prompt - The prompt to send
 * @param {object} options - Additional options
 * @returns {Promise<string>} - The generated response
 */
async function callDeepSeek(prompt, options = {}) {
  const maxRetries = options.maxRetries ?? 2;
  const timeout = options.timeout ?? 120000; // 120 seconds default timeout
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('OpenRouter/DeepSeek API key not configured. Please set OPENROUTER_API_KEY or DEEPSEEK_API_KEY in your .env file');
      }

      const modelName = options.model || await validateDeepSeekConnection();
      if (attempt === 0) {
        logger.info(`[DeepSeek] Using model: ${modelName}`);
      } else {
        logger.info(`[DeepSeek] Retry attempt ${attempt}/${maxRetries} for model: ${modelName}`);
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'https://vibeon.com',
            'X-Title': 'Vibeon Learning Platform',
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 2048,
            top_p: options.topP || 0.8,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();

        if (!text) {
          throw new Error('Empty response from DeepSeek');
        }

        logger.info(`[DeepSeek] ✅ Response generated successfully (${text.length} chars)`);
        return text;
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // Check if it's a timeout or abort error
        if (fetchError.name === 'AbortError' || fetchError.code === 'ETIMEDOUT') {
          lastError = new Error(`Request timeout after ${timeout}ms`);
          lastError.code = 'ETIMEDOUT';

          // Only retry on timeout if we have retries left
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
            logger.warn(`[DeepSeek] Timeout occurred, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        throw fetchError;
      }

    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const isRetryable =
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('timeout') ||
        error.message?.includes('fetch failed') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('ENOTFOUND');

      if (isRetryable && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff
        logger.warn(`[DeepSeek] Retryable error (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message?.substring(0, 100)}`);
        logger.warn(`[DeepSeek] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Not retryable or out of retries - handle specific error types
      logger.error('[DeepSeek] Error calling API:', error);
      logger.error('[DeepSeek] Error details:', {
        message: error.message,
        code: error.code,
        apiKey: getApiKey() ? 'Present' : 'Missing',
        model: options.model || DEFAULT_MODEL,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1,
      });

      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('API key is invalid. Please verify your key at https://openrouter.ai/keys');
      }

      if (error.message?.includes('402') || error.message?.includes('Payment')) {
        throw new Error('Insufficient credits. Please add credits at https://openrouter.ai/credits');
      }

      throw error;
    }
  }

  // If we exhausted all retries
  throw lastError || new Error('Failed to get response after all retries');
}

/**
 * Call DeepSeek with conversation history
 * @param {Array} messages - Array of {role, content} messages
 * @param {object} options - Additional options
 * @returns {Promise<string>} - The generated response
 */
async function callDeepSeekWithHistory(messages, options = {}) {
  const maxRetries = options.maxRetries ?? 2;
  const timeout = options.timeout ?? 120000; // 120 seconds default timeout
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('OpenRouter/DeepSeek API key not configured. Please set OPENROUTER_API_KEY or DEEPSEEK_API_KEY in your .env file');
      }

      const modelName = options.model || await validateDeepSeekConnection();
      if (attempt === 0) {
        logger.info(`[DeepSeek] Using model for chat: ${modelName}`);
      } else {
        logger.info(`[DeepSeek] Retry attempt ${attempt}/${maxRetries} for model: ${modelName}`);
      }

      // Convert messages to OpenAI format (which OpenRouter uses)
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content,
      }));

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'https://vibeon.com',
            'X-Title': 'Vibeon Learning Platform',
          },
          body: JSON.stringify({
            model: modelName,
            messages: formattedMessages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 2048,
            top_p: options.topP || 0.8,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();

        if (!text) {
          throw new Error('Empty response from DeepSeek');
        }

        logger.info(`[DeepSeek] ✅ Chat response generated (${text.length} chars)`);
        return text;
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // Check if it's a timeout or abort error
        if (fetchError.name === 'AbortError' || fetchError.code === 'ETIMEDOUT') {
          lastError = new Error(`Request timeout after ${timeout}ms`);
          lastError.code = 'ETIMEDOUT';

          // Only retry on timeout if we have retries left
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
            logger.warn(`[DeepSeek] Timeout occurred, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        throw fetchError;
      }

    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const isRetryable =
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('timeout') ||
        error.message?.includes('fetch failed') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('ENOTFOUND');

      if (isRetryable && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff
        logger.warn(`[DeepSeek] Retryable error (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message?.substring(0, 100)}`);
        logger.warn(`[DeepSeek] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Not retryable or out of retries
      logger.error('[DeepSeek] Error calling API with history:', error);
      logger.error('[DeepSeek] Error details:', {
        message: error.message,
        code: error.code,
        messagesCount: messages.length,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1,
      });
      throw error;
    }
  }

  // If we exhausted all retries
  throw lastError || new Error('Failed to get response after all retries');
}

// Export with same interface as gemini_helper for easy drop-in replacement
module.exports = {
  callDeepSeek,
  callDeepSeekWithHistory,
  validateDeepSeekConnection,
  // Alias for backward compatibility
  callGemini: callDeepSeek,
  callGeminiWithHistory: callDeepSeekWithHistory,
  validateGeminiConnection: validateDeepSeekConnection,
  DEFAULT_MODEL,
};
