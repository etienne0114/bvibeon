const translationService = require('../services/translationService');
const { synthesizeSpeech, transcribeAudio } = translationService;

async function translate(req, res) {
  try {
    const payload = { ...req.query, ...req.body };
    const text = payload.text;
    const targetLanguage = payload.targetLanguage || payload.toLang;
    const sourceLanguage = payload.sourceLanguage || payload.fromLang;
    const includeConfidence = payload.includeConfidence !== 'false';
    const includeAlternatives = payload.includeAlternatives === 'true';

    const data = await translationService.translateText({
      text,
      targetLanguage,
      sourceLanguage,
      includeConfidence,
      includeAlternatives,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function detect(req, res) {
  try {
    const text = req.body.text ?? req.query.text;
    const data = await translationService.detectLanguage(text);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getLanguages(_req, res) {
  try {
    const data = await translationService.getSupportedLanguages();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getHealth(_req, res) {
  try {
    const data = await translationService.checkHealth();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function translateImage(req, res) {
  try {
    const { imageBase64, mimeType, targetLanguage, sourceLanguage, enhanceImage, annotateImage } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image data is required' });
    }

    const data = await translationService.translateImage({
      imageBase64,
      mimeType,
      targetLanguage,
      sourceLanguage,
      enhanceImage,
      annotateImage,
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function translateDocument(req, res) {
  try {
    const { documentBase64, mimeType, fileName, targetLanguage, sourceLanguage, preserveFormat } = req.body;

    if (!documentBase64) {
      return res.status(400).json({ success: false, error: 'Document data is required' });
    }
    if (!targetLanguage) {
      return res.status(400).json({ success: false, error: 'Target language is required' });
    }

    const data = await translationService.translateDocument({
      documentBase64,
      mimeType,
      fileName,
      targetLanguage,
      sourceLanguage,
      preserveFormat,
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function tts(req, res) {
  try {
    const { text, language, quality, speed, pitch, volume, voiceId } = req.body;
    if (!text || !language) {
      return res.status(400).json({ success: false, error: 'text and language are required' });
    }
    const data = await synthesizeSpeech({ text, language, quality, speed, pitch, volume, voiceId });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function stt(req, res) {
  try {
    const { audioBase64, mimeType, language, quality } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'audioBase64 is required' });
    }
    const data = await transcribeAudio({ audioBase64, mimeType, language, quality });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  translate,
  detect,
  translateImage,
  translateDocument,
  getLanguages,
  getHealth,
  tts,
  stt,
};
