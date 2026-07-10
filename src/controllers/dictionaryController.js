const dictionaryService = require('../services/dictionaryService');
const translatorIntegrationService = require('../services/translator/translatorIntegrationService');

function parseBool(value, defaultValue = false) {
  if (typeof value === 'string') {
    return ['1', 'true', 'yes'].includes(value.toLowerCase());
  }
  if (typeof value === 'boolean') return value;
  return defaultValue;
}

async function getWordDefinition(req, res) {
  try {
    const { word } = req.params;
    const language = req.query.language || 'en';
    const data = await dictionaryService.getWordDefinition(word, language);
    if (!data) return res.status(404).json({ success: false, error: 'Definition not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function searchVocabulary(req, res) {
  try {
    const { query, language = 'en', limit = 12 } = req.query;
    if (!query) return res.status(400).json({ success: false, error: 'Query parameter is required' });
    const data = await dictionaryService.searchVocabulary(query.toString(), language.toString(), parseInt(limit.toString(), 10));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getDailyVocabulary(req, res) {
  try {
    const { targetLanguage = 'en', nativeLanguage = 'en', limit = 3 } = req.body;
    const payload = await dictionaryService.getDailyVocabulary({
      userId: req.user?.id,
      targetLanguage,
      nativeLanguage,
      limit: parseInt(limit, 10) || 3,
    });
    res.json({ success: true, data: payload });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getVocabularyRecommendations(req, res) {
  try {
    const { targetLanguage = 'en', limit = 8 } = req.query;
    const data = await dictionaryService.getVocabularyRecommendations({
      userId: req.user?.id,
      targetLanguage: targetLanguage.toString(),
      limit: parseInt(limit.toString(), 10) || 8,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getRecentVocabulary(req, res) {
  try {
    const data = await dictionaryService.getRecentVocabulary(req.user?.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function translateText(req, res) {
  try {
    const text = req.query.text || req.body.text;
    const sourceLanguage = req.query.fromLang || req.query.sourceLanguage || req.body.fromLang || 'auto';
    const targetLanguage = req.query.toLang || req.query.targetLanguage || req.body.toLang;
    if (!text || !targetLanguage) {
      return res.status(400).json({ success: false, error: 'Text and target language are required' });
    }
    const includeConfidence = parseBool(req.query.includeConfidence, true);
    const includeAlternatives = parseBool(req.query.includeAlternatives, false);
    const payload = await translatorIntegrationService.translateText({
      text: text.toString(),
      sourceLanguage: sourceLanguage.toString(),
      targetLanguage: targetLanguage.toString(),
      includeConfidence,
      includeAlternatives,
    });
    res.json({ success: true, data: payload.data || payload });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function translateEntry(req, res) {
  try {
    const { entry, targetLanguage } = req.body;
    if (!entry || !targetLanguage) {
      return res.status(400).json({ success: false, error: 'Entry and targetLanguage are required' });
    }
    const data = await dictionaryService.translateEntry(entry, targetLanguage);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getWordDefinition,
  searchVocabulary,
  getDailyVocabulary,
  getVocabularyRecommendations,
  getRecentVocabulary,
  translateText,
  translateEntry,
};
