const audioContributionService = require('../services/audioContributionService');
const { sendServerError } = require('../utils/errors');

const isAppError = (error) => error?.constructor === Error && !error?.clientVersion;

async function submitAudio(req, res) {
  try {
    const { word, language, audio, mimeType, vocabularyItemId } = req.body;
    const contribution = await audioContributionService.submitAudio(req.user.id, {
      word,
      language,
      audioBase64: audio,
      mimeType,
      vocabularyItemId,
    });
    res.status(201).json({ success: true, data: { id: contribution.id, createdAt: contribution.createdAt } });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Submit audio error');
  }
}

async function listAudioForWord(req, res) {
  try {
    const { word, language } = req.query;
    if (!word || !language) {
      return res.status(400).json({ success: false, error: 'word and language query params are required' });
    }
    const contributions = await audioContributionService.listAudioForWord(word, language);
    res.json({ success: true, data: contributions });
  } catch (error) {
    sendServerError(res, error, 'List audio error');
  }
}

async function getAudioFile(req, res) {
  try {
    const contribution = await audioContributionService.getAudioFile(req.params.id);
    if (!contribution) {
      return res.status(404).json({ success: false, error: 'Recording not found' });
    }
    const buffer = Buffer.from(contribution.audioData, 'base64');
    res.set('Content-Type', contribution.mimeType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (error) {
    sendServerError(res, error, 'Get audio file error');
  }
}

async function reportAudio(req, res) {
  try {
    await audioContributionService.reportAudio(req.params.id);
    res.json({ success: true });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Report audio error');
  }
}

async function getMyAudio(req, res) {
  try {
    const contributions = await audioContributionService.getMyAudio(req.user.id);
    res.json({ success: true, data: contributions });
  } catch (error) {
    sendServerError(res, error, 'Get my audio error');
  }
}

module.exports = { submitAudio, listAudioForWord, getAudioFile, reportAudio, getMyAudio };
