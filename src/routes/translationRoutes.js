const express = require('express');
const { translate, detect, translateImage, translateDocument, getLanguages, getHealth, tts, stt } = require('../controllers/translationController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.post('/translate', auth, translate);
router.get('/translate', auth, translate);
router.post('/detect', auth, detect);
router.post('/image', auth, translateImage);
router.post('/document', auth, translateDocument);
router.get('/languages', auth, getLanguages);
router.get('/health', auth, getHealth);
router.post('/tts', auth, tts);
router.post('/stt', auth, stt);
module.exports = router;
