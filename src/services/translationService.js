const axios = require('axios');
const logger = require('../utils/logger');

const baseUrl = process.env.TRANSLATOR_API_URL || '';
const apiSecret = process.env.TRANSLATOR_SECRET_KEY || '';
const timeout = parseInt(process.env.TRANSLATION_TIMEOUT || '60000', 10);

function isConfigured() {
  return Boolean(baseUrl);
}

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (apiSecret) {
    headers.Authorization = `Bearer ${apiSecret}`;
  }
  return headers;
}

async function request(method, endpoint, payload = {}) {
  if (!isConfigured()) {
    throw new Error('Translator service is not configured');
  }

  const config = {
    method,
    url: `${baseUrl}${endpoint}`,
    headers: buildHeaders(),
    timeout,
  };

  if (method.toLowerCase() === 'get') {
    config.params = payload;
  } else {
    config.data = payload;
  }

  const response = await axios(config);
  return response.data;
}

async function translateText({
  text,
  targetLanguage,
  sourceLanguage = 'auto',
  includeConfidence = true,
  includeAlternatives = false,
}) {
  if (!text || !targetLanguage) {
    throw new Error('Text and target language are required');
  }

  if (!isConfigured()) {
    return {
      translatedText: text,
      sourceLanguage,
      targetLanguage,
      confidence: 1,
      alternatives: [],
      model: 'local-fallback',
      fallback: true,
    };
  }

  const payload = {
    text,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    include_confidence: includeConfidence,
    include_alternatives: includeAlternatives,
  };

  const response = await request('post', '/api/translate', payload);
  logger.info('Translator response', { sourceLanguage, targetLanguage, status: response.status || 'ok' });

  return {
    translatedText: response.translated_text || response.translatedText || text,
    sourceLanguage: response.source_language || response.sourceLanguage || sourceLanguage,
    targetLanguage: response.target_language || response.targetLanguage || targetLanguage,
    confidence: response.confidence || response.confidence_score || 0,
    model: response.model || response.model_used || 'translator',
    alternatives: response.alternatives || response.suggestions || [],
    detectedLanguage: response.detected_language || null,
    processingTime: response.processing_time || response.processingTime,
    cached: response.cached || false,
    raw: response,
  };
}

async function translateImage({
  imageBase64,
  mimeType,
  targetLanguage,
  sourceLanguage = 'auto',
  enhanceImage = true,
  annotateImage = false,
}) {
  if (!imageBase64 || !targetLanguage) {
    throw new Error('Image data and target language are required');
  }

  const payload = {
    image_base64: imageBase64,
    mime_type: mimeType,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    enhance_image: enhanceImage,
    annotate_image: annotateImage,
  };

  const response = await request('post', '/api/multimodal/image', payload);
  logger.info('Image Translator response', { targetLanguage, status: 'ok' });

  return {
    originalText: response.original_text,
    translatedText: response.translated_text,
    detectedLanguage: response.detected_language,
    targetLanguage: response.target_language,
    ocrConfidence: response.ocr_confidence,
    translationConfidence: response.translation_confidence,
    annotatedImage: response.annotated_image,
    processingTime: response.processing_time,
    raw: response,
  };
}

async function translateDocument({
  documentBase64,
  mimeType,
  fileName,
  targetLanguage,
  sourceLanguage = 'auto',
  preserveFormat = true,
}) {
  if (!documentBase64 || !targetLanguage) {
    throw new Error('Document data and target language are required');
  }

  const payload = {
    document_base64: documentBase64,
    mime_type: mimeType,
    file_name: fileName,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    preserve_format: preserveFormat,
  };

  const response = await request('post', '/api/multimodal/document', payload);
  logger.info('Document Translator response', { targetLanguage, fileName, status: 'ok' });

  return {
    originalText: response.original_text,
    translatedText: response.translated_text,
    detectedLanguage: response.detected_language,
    targetLanguage: response.target_language,
    confidence: response.confidence,
    qualityScore: response.quality_score,
    model: response.model,
    pages: response.pages,
    processingTime: response.processing_time,
    metadata: response.metadata,
    raw: response,
  };
}

async function detectLanguage(text) {
  if (!text) {
    throw new Error('Text is required for language detection');
  }

  if (!isConfigured()) {
    return { language: 'en', confidence: 0.9, isReliable: true, raw: null };
  }

  const response = await request('post', '/api/translate/detect', { text });
  const detected = response.detected_language || response.language;
  return {
    language: detected?.language || detected || 'en',
    confidence: detected?.confidence || response.confidence || 0,
    isReliable: response.is_reliable ?? detected?.is_reliable ?? true,
    raw: response,
  };
}

async function getSupportedLanguages() {
  if (!isConfigured()) {
    return {
      languages: [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' },
      ],
      total: 3,
      cached: false,
    };
  }

  const response = await request('get', '/api/languages');
  return {
    languages: response.languages || [],
    total: response.total_count || response.languages?.length || 0,
    categories: response.categories || [],
    features: response.features || {},
    raw: response,
  };
}

async function checkHealth() {
  if (!isConfigured()) {
    return { isHealthy: false, reason: 'TRANSLATOR_NOT_CONFIGURED' };
  }

  try {
    const response = await request('get', '/health');
    return {
      isHealthy: response.status === 'healthy' || response.healthy === true,
      service: response.service || response.translator || 'vibeon_translator',
      version: response.version,
      uptime: response.uptime,
      raw: response,
    };
  } catch (error) {
    logger.error('Translator health check failed', error.message);
    return {
      isHealthy: false,
      error: error.message,
    };
  }
}

/**
 * Synthesize speech from text using vibeon_translator TTS engine.
 * Returns { audioBase64, audioFormat, duration, engineUsed, language, processingTime }
 */
async function synthesizeSpeech({ text, language, quality = 'medium', speed = 1.0, pitch = 1.0, volume = 1.0, voiceId = null }) {
  if (!text || !language) {
    throw new Error('Text and language are required for TTS');
  }

  if (!isConfigured()) {
    throw new Error('Translator service is not configured');
  }

  const payload = {
    text,
    language,
    quality,
    speed,
    pitch,
    volume,
    ...(voiceId ? { voice_id: voiceId } : {}),
  };

  const response = await request('post', '/api/voice/tts', payload);
  logger.info('TTS response', { language, engine: response.engine_used });

  return {
    audioBase64: response.audio_base64,
    audioFormat: response.audio_format || 'mp3',
    duration: response.duration || 0,
    engineUsed: response.engine_used || 'tts',
    language: response.language || language,
    processingTime: response.processing_time || 0,
    metadata: response.metadata || {},
  };
}

/**
 * Transcribe audio to text using vibeon_translator STT engine.
 * Accepts audioBase64 + mimeType from frontend, forwards as multipart to vibeon_translator.
 * Returns { text, confidence, language, engineUsed, processingTime }
 */
async function transcribeAudio({ audioBase64, mimeType = 'audio/wav', language = 'auto', quality = 'medium' }) {
  if (!audioBase64) {
    throw new Error('Audio data is required for STT');
  }

  if (!isConfigured()) {
    throw new Error('Translator service is not configured');
  }

  // Convert base64 back to buffer and forward as multipart/form-data
  const FormData = require('form-data');
  const audioBuffer = Buffer.from(audioBase64, 'base64');

  // Determine file extension from mimeType
  const extMap = { 'audio/wav': 'wav', 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/flac': 'flac' };
  const ext = extMap[mimeType] || 'wav';

  const form = new FormData();
  form.append('audio_file', audioBuffer, { filename: `audio.${ext}`, contentType: mimeType });
  form.append('language', language);
  form.append('quality', quality);

  const response = await axios({
    method: 'post',
    url: `${baseUrl}/api/voice/stt`,
    headers: {
      ...form.getHeaders(),
      ...(apiSecret ? { Authorization: `Bearer ${apiSecret}` } : {}),
    },
    data: form,
    timeout,
  });

  const data = response.data;
  logger.info('STT response', { language, engine: data.engine_used, confidence: data.confidence });

  return {
    text: data.text || '',
    confidence: data.confidence || 0,
    language: data.language || language,
    engineUsed: data.engine_used || 'stt',
    processingTime: data.processing_time || 0,
    alternatives: data.alternatives || [],
    metadata: data.metadata || {},
  };
}

module.exports = {
  translateText,
  translateImage,
  translateDocument,
  detectLanguage,
  getSupportedLanguages,
  checkHealth,
  synthesizeSpeech,
  transcribeAudio,
};
