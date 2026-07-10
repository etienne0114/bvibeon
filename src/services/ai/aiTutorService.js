const { callDeepSeek, callDeepSeekWithHistory } = require('./deepseek_helper');
const logger = require('../../utils/logger');

// In-memory conversation history (in production, use Redis or database)
const conversationHistory = new Map();
// Track if user has been greeted
const greetedUsers = new Map();

class AITutorService {
  /**
   * Generate a personalized greeting for the user
   */
  async generateGreeting({ userId, userName, locale = 'en-US', timeOfDay = 'day' }) {
    try {
      logger.info(`[AITutorService] Generating greeting for ${userName || 'user'}`);

      const lastGreeted = greetedUsers.get(userId);
      const now = Date.now();
      const GREETING_COOLDOWN = 30 * 60 * 1000; // 30 minutes

      if (lastGreeted && (now - lastGreeted) < GREETING_COOLDOWN) {
        return {
          text: `Welcome back, ${userName || 'friend'}! Ready to continue practicing?`,
          type: 'welcome_back',
          shouldSpeak: true,
          followUp: null,
        };
      }

      const greetingPrompt = `You are Vibeon, a friendly AI language tutor. Generate a simple, warm greeting for a user named "${userName || 'friend'}" who just opened the language practice section. 

Time of day: ${timeOfDay}
Language: ${locale}

Requirements:
1. Start with "Hi ${userName || 'there'}!" or "Hello ${userName || 'there'}!"
2. Introduce yourself as Vibeon, their AI tutor
3. Use the appropriate greeting based on time of day (Good morning/afternoon/evening)
4. Keep it under 20 words
5. Be warm and friendly
6. IMPORTANT: Do NOT ask any questions
7. IMPORTANT: Do NOT mention any topics or scenarios
8. Return ONLY the greeting text in plain format.`;

      const rawGreeting = await callDeepSeek(greetingPrompt, { temperature: 0.8 });
      const greeting = this.cleanMarkdown(rawGreeting);

      greetedUsers.set(userId, now);
      this.clearConversationHistory(userId);
      this.updateConversationHistory(userId, '[User opened practice]', greeting);

      return {
        text: greeting,
        type: 'greeting',
        shouldSpeak: true,
        followUp: null,
        sessionId: `session_${userId}_${now}`,
      };
    } catch (error) {
      logger.error('[AITutorService] Greeting generation error:', error);
      return {
        text: `Hi ${userName || 'there'}! I'm Vibeon, your AI tutor. Good ${timeOfDay}!`,
        type: 'greeting',
        shouldSpeak: true,
        followUp: null,
      };
    }
  }

  /**
   * Generate an AI tutor response with grammar analysis
   */
  async getResponse(message, locale = 'en-US', userId = null, courseId = null, lessonId = null, analyzeGrammar = true, customContext = null) {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Invalid message input');
    }

    try {
      logger.info(`[AITutorService] Generating response for user ${userId || 'anonymous'}`);

      const history = this.getConversationHistory(userId);
      const isFirstMessage = this.isFirstUserMessageAfterGreeting(history);

      let systemPrompt = this.buildSystemPrompt(locale, courseId, lessonId, analyzeGrammar, isFirstMessage);

      if (customContext) {
        systemPrompt = `${customContext}\n\n${systemPrompt}`;
      }

      if (isFirstMessage && customContext) {
        systemPrompt += '\n\nCRITICAL: This is the user\'s first message after greeting. The topic is already chosen - begin the scenario RIGHT NOW.';
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message.trim() },
      ];

      const response = await callDeepSeekWithHistory(messages);

      if (!response) throw new Error('AI returned empty response');

      const cleanedResponse = this.cleanMarkdown(response);
      let parsedResponse = { text: cleanedResponse };

      if (analyzeGrammar) {
        parsedResponse = this.parseStructuredResponse(cleanedResponse, message);
        parsedResponse.text = this.cleanMarkdown(parsedResponse.text);
      }

      this.updateConversationHistory(userId, message, parsedResponse.text);

      return {
        text: parsedResponse.text,
        grammarErrors: parsedResponse.grammarErrors || [],
        nativeSpeakerVersion: parsedResponse.nativeSpeakerVersion || null,
        pronunciationTips: parsedResponse.pronunciationTips || [],
        shouldSpeak: true,
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          hasGrammarAnalysis: analyzeGrammar,
        },
      };
    } catch (err) {
      logger.error('[AITutorService] AI Response error:', err);
      throw err;
    }
  }

  /**
   * Helper to clean markdown
   */
  cleanMarkdown(text) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\*\*/g, '').replace(/__/g, '').replace(/`/g, '').trim();
  }

  /**
   * Build system prompt
   */
  buildSystemPrompt(locale, courseId, lessonId, includeGrammarAnalysis = false, isFirstMessage = false) {
    let prompt = `You are 'Vibeon', a friendly AI language tutor. Personality: supportive, patient, conversational. 
Language of instruction: ${locale}.

RULES:
1. No markdown. Plain text only.
2. Keep each reply to 2-4 sentences.
3. Be encouraging and helpful.
`;

    if (includeGrammarAnalysis) {
      prompt += `
GRAMMAR_ANALYSIS:
After your natural response, if there are any mistakes in the user's message, add a separate section at the very end in this EXACT format:
[ANALYSIS]
Mistake: "[exact wrong text]" | Correction: "[correct text]" | Explanation: "[one sentence why]"
(Repeat line for each mistake)

NATIVE_VERSION:
If the user's expression is grammatically correct but unnatural, provide a more natural version at the end:
[NATIVE]
"[natural version]"
`;
    }

    return prompt;
  }

  /**
   * Parse structured response
   */
  parseStructuredResponse(response, originalMessage) {
    const result = {
      text: response,
      grammarErrors: [],
      nativeSpeakerVersion: null,
      pronunciationTips: [],
    };

    // Extract Analysis section
    const analysisParts = response.split('[ANALYSIS]');
    if (analysisParts.length > 1) {
      result.text = analysisParts[0].trim();
      const analysisContent = analysisParts[1].split('[NATIVE]')[0];
      
      const lines = analysisContent.split('\n').filter(l => l.includes('|'));
      lines.forEach(line => {
        const parts = line.split('|');
        const mistakeMatch = parts[0]?.match(/Mistake: ["']?([^"']+)["']?/i);
        const correctionMatch = parts[1]?.match(/Correction: ["']?([^"']+)["']?/i);
        const explanationMatch = parts[2]?.match(/Explanation: ["']?([^"']+)["']?/i);

        if (mistakeMatch && correctionMatch) {
          const incorrectText = mistakeMatch[1].trim();
          const correction = correctionMatch[1].trim();
          const indices = this.findTextIndices(originalMessage, incorrectText);

          if (indices) {
            result.grammarErrors.push({
              incorrectText,
              correction,
              startIndex: indices.startIndex,
              endIndex: indices.endIndex,
              errorType: 'grammar',
              explanation: explanationMatch ? explanationMatch[1].trim() : `Should be "${correction}"`,
            });
          }
        }
      });
    }

    // Extract Native section
    const nativeParts = response.split('[NATIVE]');
    if (nativeParts.length > 1) {
      if (analysisParts.length === 1) result.text = nativeParts[0].trim();
      const nativeContent = nativeParts[1].trim().match(/["']?([^"']+)["']?/);
      if (nativeContent) {
        result.nativeSpeakerVersion = nativeContent[1].trim();
      }
    }

    return result;
  }

  /**
   * Find text indices for highlighting
   */
  findTextIndices(originalText, searchText) {
    if (!originalText || !searchText) return null;
    const index = originalText.toLowerCase().indexOf(searchText.toLowerCase().trim());
    if (index !== -1) {
      return {
        startIndex: index,
        endIndex: index + searchText.trim().length,
      };
    }
    return null;
  }

  getConversationHistory(userId) {
    if (!userId) return [];
    return (conversationHistory.get(userId) || []).slice(-10);
  }

  isFirstUserMessageAfterGreeting(history) {
    return history.length === 2 && history[0].content.includes('[User opened practice]');
  }

  updateConversationHistory(userId, userMessage, aiResponse) {
    if (!userId) return;
    if (!conversationHistory.has(userId)) conversationHistory.set(userId, []);
    const history = conversationHistory.get(userId);
    history.push({ role: 'user', content: userMessage }, { role: 'assistant', content: aiResponse });
    if (history.length > 20) conversationHistory.set(userId, history.slice(-20));
  }

  clearConversationHistory(userId) {
    if (userId) conversationHistory.delete(userId);
  }
}

module.exports = new AITutorService();
