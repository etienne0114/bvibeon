const axios = require('axios');
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');

/**
 * Translator Integration Service
 * Connects learn_backend with vibeon_translator API
 * Provides unified translation capabilities for the learn features
 */
class TranslatorIntegrationService {
  constructor() {
    this.translatorBaseUrl = process.env.TRANSLATOR_API_URL || 'https://etienne0114-vibeon-translator.hf.space';
    // Use the vibeon_translator service's secret key (matches SECRET_KEY set in HF Space secrets)
    this.apiSecret = process.env.TRANSLATOR_SECRET_KEY || '509a213999016c5a5d97bc9f981a151fceb05a2759a1fa0d9b55de2fdcb2df94';
    this.algorithm = process.env.TRANSLATOR_ALGORITHM || 'HS256';
    // Default timeout; some ML operations (OCR, long translations) need longer
    this.timeout = parseInt(process.env.TRANSLATION_TIMEOUT || '120000');
    
    // Cache for supported languages
    this._supportedLanguages = null;
    this._languagesCacheTime = null;
    this._languagesCacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

    // Strict mode: disable any placeholder/unified fallbacks
    this.strictMode = String(process.env.DICTIONARY_STRICT || '').toLowerCase() === 'true';
  }

  /**
   * Get headers for API requests
   */
  getHeaders(kind = 'platform') {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // In development, use simple token as fallback if JWT fails
    const useSimpleToken = process.env.NODE_ENV === 'development' && 
                           process.env.USE_SIMPLE_TRANSLATOR_TOKEN === 'true';
    
    if (useSimpleToken) {
      // Use simple token for development
      headers['Authorization'] = 'Bearer platform-token';
    } else {
      // Sign a short-lived JWT for the translator API
      try {
        const nowSec = Math.floor(Date.now() / 1000);
        const payload = kind === 'platform'
          ? { sub: 'learn_backend', user_id: 'platform', scopes: ['platform', 'admin'], iat: nowSec, exp: nowSec + 60 * 15 }
          : { sub: 'learn_backend_user', user_id: 'backend_user', scopes: ['translate:read', 'translate:write'], iat: nowSec, exp: nowSec + 60 * 15 };
        const token = jwt.sign(payload, this.apiSecret, { algorithm: this.algorithm });
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        // Fallback to simple token if JWT signing fails
        logger.warn('JWT signing failed, using simple token fallback:', error.message);
        headers['Authorization'] = 'Bearer platform-token';
      }
    }
    
    return headers;
  }

  /**
   * Make HTTP request to translator API
   */
  async makeRequest(method, endpoint, data = null, kind = 'platform', timeoutOverride = null) {
    try {
      const url = `${this.translatorBaseUrl}${endpoint}`;
      const config = {
        method,
        url,
        headers: this.getHeaders(kind),
        timeout: timeoutOverride ?? this.timeout,
      };

      if (data) {
        config.data = data;
      }

      logger.debug(`Translator API request: ${method} ${url}`, { data });
      const response = await axios(config);
      
      logger.debug(`Translator API response: ${response.status}`, { 
        data: response.data,
        endpoint, 
      });
      
      return response.data;
    } catch (error) {
      // Enhanced error handling for connection issues
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        logger.error('Translator API connection failed:', {
          method,
          endpoint,
          url: `${this.translatorBaseUrl}${endpoint}`,
          error: error.message,
          code: error.code,
          translatorBaseUrl: this.translatorBaseUrl,
          hint: 'Translation service unreachable. Check TRANSLATOR_API_URL and that the HF Space is running.',
        });
        
        throw new Error(`Cannot connect to translation service at ${this.translatorBaseUrl}. Please ensure the translation service is running.`);
      }
      
      logger.error('Translator API request failed:', {
        method,
        endpoint,
        error: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // Provide more specific error messages
      if (error.response?.status) {
        throw new Error(`Translation service error (${error.response.status}): ${error.response.data?.detail || error.response.data?.error || error.message}`);
      }
      
      throw new Error(`Translation service error: ${error.message}`);
    }
  }

  /**
   * Translate text using the translator API with unified fallback
   */
  async translateText({
    text,
    sourceLanguage = 'auto',
    targetLanguage,
    includeConfidence = true,
    includeAlternatives = false,
    context = null,
  }) {
    try {
      if (!text || !targetLanguage) {
        throw new Error('Text and target language are required');
      }

      // Validate languages
      if (!sourceLanguage || !targetLanguage) {
        throw new Error('Source and target languages are required');
      }

      // Check if source and target are the same
      if (sourceLanguage !== 'auto' && sourceLanguage === targetLanguage) {
        logger.info('Source and target languages are the same - returning original text');
        return {
          success: true,
          data: {
            originalText: text,
            translatedText: text,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            confidence: 1.0,
            qualityScore: 1.0,
            alternatives: [],
            model: 'no-translation-needed',
            processingTime: 0,
            cached: false,
          },
        };
      }

      // If source is auto, detect it first to avoid passing 'auto' downstream
      if (!sourceLanguage || sourceLanguage === 'auto') {
        try {
          const detection = await this.detectLanguage({ text });
          const detected = detection?.data?.language;
          if (detected && typeof detected === 'string') {
            logger.info('Detected source language', { detected });
            sourceLanguage = detected;
          } else {
            logger.warn('Language detection returned no language; proceeding with en as fallback');
            sourceLanguage = 'en';
          }
        } catch (detectError) {
          logger.error('Auto-detect failed before translation; proceeding with en', { error: detectError.message });
          sourceLanguage = 'en';
        }
      }

      // If source equals target after detection, short-circuit and return original
      if (sourceLanguage === targetLanguage) {
        logger.info('Source equals target after detection - returning original text');
        return {
          success: true,
          data: {
            originalText: text,
            translatedText: text,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            confidence: 1.0,
            qualityScore: 1.0,
            alternatives: [],
            model: 'no-translation-needed',
            processingTime: 0,
            cached: false,
          },
        };
      }

      // Log translation request with language pair
      logger.debug('Translation request:', {
        textLength: text.length,
        sourceLanguage,
        targetLanguage,
        languagePair: `${sourceLanguage} → ${targetLanguage}`,
        isNonEnglishPair: sourceLanguage !== 'en' && targetLanguage !== 'en',
        timestamp: new Date().toISOString(),
      });

      // Try vibeon_translator first (supports ANY-to-ANY translation with NLLB-200)
      try {
        const requestData = {
          text: text,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          model_preference: 'auto',  // Uses NLLB-200 for maximum language coverage
        };

        const response = await this.makeRequest('POST', '/api/translate', requestData, 'platform');
        
        // Log successful translation
        logger.info('Translation completed:', {
          model: response.model_used || 'unknown',
          confidence: response.confidence_score || 0,
          qualityScore: response.quality_score || 0,
          languagePair: `${sourceLanguage} → ${targetLanguage}`,
          timestamp: new Date().toISOString(),
        });
        
        return {
          success: true,
          data: {
            originalText: text,
            translatedText: response.translated_text || response.translatedText,
            sourceLanguage: response.source_language || response.sourceLanguage || sourceLanguage,
            targetLanguage: targetLanguage,
            confidence: response.confidence || response.confidence_score || 0.9,
            qualityScore: response.quality_score || 0.9,
            alternatives: response.alternatives || response.suggestions || [],
            model: response.model || response.model_used || 'vibeon-translator',
            processingTime: response.processing_time || response.processingTime,
            cached: response.cached || false,
          },
        };
      } catch (translatorError) {
        // Log detailed error information
        logger.error('Translation service error:', {
          error: translatorError.message,
          languagePair: `${sourceLanguage} → ${targetLanguage}`,
          textLength: text.length,
          strictMode: this.strictMode,
          timestamp: new Date().toISOString(),
        });

        // No fallback - throw error for real functionality
        throw new Error(`Translation failed for ${sourceLanguage} → ${targetLanguage}: ${translatorError.message}`);
      }
    } catch (error) {
      logger.error('Text translation failed:', {
        error: error.message,
        languagePair: `${sourceLanguage} → ${targetLanguage}`,
        textLength: text?.length || 0,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      
      // Provide user-friendly error messages
      if (error.message?.includes('Translation service error')) {
        throw new Error('Translation service temporarily unavailable. Please try again.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Translation took too long. Please try with shorter text.');
      } else if (error.message?.includes('Unsupported language')) {
        throw new Error(`Language pair ${sourceLanguage} → ${targetLanguage} is not supported.`);
      }
      
      throw error;
    }
  }


  /**
   * Detect language of text
   */
  async detectLanguage({ text, includeOptions = false }) {
    try {
      if (!text) {
        throw new Error('Text is required for language detection');
      }

      const requestData = { text };
      const response = await this.makeRequest('POST', '/api/translate/detect', requestData, 'user');
      
      return {
        success: true,
        data: {
          language: response.detected_language?.language || response.detected_language || response.detectedLanguage || response.language,
          confidence: response.detected_language?.confidence || response.confidence || 0.0,
          isReliable: response.detected_language?.is_reliable || response.is_reliable || response.isReliable || false,
          alternatives: response.alternatives || [],
          languageName: response.language_name || response.languageName,
        },
      };
    } catch (error) {
      logger.error('Language detection failed:', error);
      throw error;
    }
  }


  /**
   * Translate audio using the translator API
   */
  async translateAudio({
    audioUrl,
    sourceLanguage = 'auto',
    targetLanguage,
    includeTranscription = true,
  }) {
    try {
      if (!audioUrl || !targetLanguage) {
        throw new Error('Audio URL and target language are required');
      }

      const requestData = {
        audio_url: audioUrl,
        target_language: targetLanguage,
        enhance_audio: true,
        output_format: 'text',
      };

      const response = await this.makeRequest('POST', '/api/vibeon/translate/audio', requestData, 'platform');
      
      return {
        originalTranscription: response.extracted_text || response.original_transcription || response.originalTranscription,
        translatedText: response.translated_text || response.translatedText,
        sourceLanguage: response.source_language || response.sourceLanguage,
        targetLanguage: targetLanguage,
        confidence: response.confidence || response.confidence_score || 0.0,
        duration: response.audio_metadata?.duration || response.duration,
        processingTime: response.processing_time || response.processingTime,
      };
    } catch (error) {
      logger.error('Audio translation failed:', error);
      throw error;
    }
  }

  /**
   * Generate speech from text (TTS)
   */
  async generateSpeech({
    text,
    language = 'en',
    voiceStyle = 'natural',
    enginePreference = null,
  }) {
    return this.generateSpeechAdvanced({
      text,
      language,
      engine: enginePreference,
      quality: voiceStyle === 'premium' ? 'premium' : voiceStyle === 'fast' ? 'low' : voiceStyle === 'slow' ? 'high' : 'medium',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voiceId: null,
      userId: null,
      sessionId: null,
    });
  }

  /**
   * Generate speech from text with advanced TTS parameters
   */
  async generateSpeechAdvanced({
    text,
    language = 'en',
    engine = null,
    quality = 'medium',
    speed = 1.0,
    pitch = 1.0,
    volume = 1.0,
    voiceId = null,
    userId = null,
    sessionId = null,
  }) {
    try {
      if (!text) {
        throw new Error('Text is required for speech generation');
      }

      const requestData = {
        text,
        language,
        quality,
        speed,
        pitch,
        volume,
      };

      if (engine) requestData.engine = engine;
      if (voiceId && voiceId !== 'auto') requestData.voice_id = voiceId;
      if (userId) requestData.user_id = userId;
      if (sessionId) requestData.session_id = sessionId;

      const response = await this.makeRequest('POST', '/api/voice/tts', requestData, 'platform');
      
      return {
        success: true,
        data: {
          audio_base64: response.audio_base64,
          audio_format: response.audio_format,
          audio_url: response.audio_url || response.audioUrl,
          duration: response.duration,
          language: response.language || language,
          quality: response.quality || quality,
          engine: response.engine_used || response.engine || engine || 'auto',
          processing_time: response.processing_time || 0,
          metadata: response.metadata || {},
        },
      };
    } catch (error) {
      logger.error('Advanced speech generation failed:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(audioUrl, language, includeTimestamps) {
    try {
      language = language || 'auto';
      
      if (!audioUrl) {
        throw new Error('Audio URL is required for transcription');
      }

      if (audioUrl.startsWith('blob:')) {
        throw new Error('Blob URLs not supported. Please convert to base64 on the frontend.');
      }

      const FormData = require('form-data');
      const fs = require('fs');
      const path = require('path');
      const os = require('os');

      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `audio_${Date.now()}.wav`);
      
      try {
        const downloadResponse = await axios({
          method: 'GET',
          url: audioUrl,
          responseType: 'stream',
          timeout: 300000,
        });

        const writer = fs.createWriteStream(tempFilePath);
        downloadResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const formData = new FormData();
        formData.append('audio_file', fs.createReadStream(tempFilePath), {
          filename: 'audio.wav',
          contentType: 'audio/wav',
        });
        formData.append('language', language === 'auto' ? 'en' : language);
        formData.append('quality', 'medium');

        const headers = this.getHeaders('platform');
        delete headers['Content-Type'];
        Object.assign(headers, formData.getHeaders());
        
        const response = await axios({
          method: 'POST',
          url: `${this.translatorBaseUrl}/api/voice/stt`,
          data: formData,
          headers: headers,
          timeout: 300000,
        });

        fs.unlinkSync(tempFilePath);

        return {
          success: true,
          data: {
            text: response.data.text || response.data.transcript,
            language: response.data.language || language,
            confidence: response.data.confidence || 0.8,
            timestamps: response.data.timestamps || [],
            duration: response.data.duration || 0,
            processingTime: response.data.processing_time || 0,
          },
        };

      } catch (downloadError) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw downloadError;
      }
    } catch (error) {
      logger.error('Audio transcription failed:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio from base64 data
   */
  async transcribeAudioFromBase64(audioBase64, language, includeTimestamps) {
    try {
      language = language || 'auto';
      if (!audioBase64) throw new Error('Base64 audio data is required for transcription');

      const audioBuffer = Buffer.from(audioBase64, 'base64');
      
      let audioFormat = 'wav';
      let contentType = 'audio/wav';
      
      const header4 = audioBuffer.subarray(0, 4);
      if (header4.toString() === 'OggS') {
        audioFormat = 'ogg'; contentType = 'audio/ogg';
      } else if (header4.toString() === 'fLaC') {
        audioFormat = 'flac'; contentType = 'audio/flac';
      } else if (header4.toString() === 'RIFF') {
        audioFormat = 'wav'; contentType = 'audio/wav';
      } else if (header4[0] === 0xff && header4[1] === 0xfb) {
        audioFormat = 'mp3'; contentType = 'audio/mpeg';
      }
      
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('audio_file', audioBuffer, {
        filename: `audio.${audioFormat}`,
        contentType: contentType,
        knownLength: audioBuffer.length,
      });
      formData.append('language', language === 'auto' ? 'en' : language);
      formData.append('quality', 'medium');
      
      const headers = this.getHeaders('platform');
      delete headers['Content-Type'];
      Object.assign(headers, formData.getHeaders());
      
      const response = await axios({
        method: 'POST',
        url: `${this.translatorBaseUrl}/api/voice/stt`,
        data: formData,
        headers: headers,
        timeout: 300000,
      });

      return {
        success: true,
        data: {
          text: response.data.text || response.data.transcript || '',
          language: response.data.language || language,
          confidence: response.data.confidence || 0.8,
          timestamps: response.data.timestamps || [],
          duration: response.data.duration || 0,
          processingTime: response.data.processing_time || 0,
        },
      };
    } catch (error) {
      logger.error('Base64 audio transcription failed:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages() {
    try {
      const response = await this.makeRequest('GET', '/api/languages', {}, 'platform');
      return {
        success: true,
        data: {
          languages: response.languages,
          total: response.total_count || response.languages.length,
          categories: response.categories || [],
          features: response.features || {},
          supported_pairs: response.supported_pairs || 'all',
          available_models: response.available_models || ['nllb-200', 'whisper', 'gtts'],
          last_updated: response.last_updated || new Date().toISOString(),
          version: response.version || '1.0.0',
        },
      };
    } catch (error) {
      logger.error('Failed to get supported languages:', error);
      throw error;
    }
  }
  
  /**
   * Real-time translation with session caching
   */
  async translateRealtime({ text, sourceLanguage = 'auto', targetLanguage, sessionId, isFinal = false, userId = null }) {
    try {
      const requestData = {
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        session_id: sessionId,
        is_final: isFinal,
        user_id: userId,
      };

      const response = await this.makeRequest('POST', '/api/vibeon/translate/realtime', requestData, 'platform');
      
      return {
        success: true,
        data: {
          translated_text: response.translated_text || response.translatedText,
          confidence_score: response.confidence_score || 0.9,
          is_final: response.is_final || isFinal,
          session_id: response.session_id || sessionId,
          processing_time: response.processing_time || 0,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        },
      };
    } catch (error) {
      logger.error('Real-time translation failed:', error);
      throw error;
    }
  }

  /**
   * Check translator service health
   */
  async checkHealth() {
    try {
      const response = await this.makeRequest('GET', '/health');
      return {
        isHealthy: response.status === 'healthy' || response.healthy === true,
        service: 'vibeon_translator',
        version: response.version,
        database: response.database,
        translator: response.translator,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return { isHealthy: false, service: 'vibeon_translator', error: error.message, lastChecked: new Date().toISOString() };
    }
  }
}

// Create singleton instance
const translatorIntegrationService = new TranslatorIntegrationService();

module.exports = translatorIntegrationService;
