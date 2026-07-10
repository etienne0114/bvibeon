const express = require('express');
const progressController = require('../controllers/progressController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.post('/enroll', auth, progressController.enroll);
router.post('/track', auth, progressController.track);
router.get('/', auth, progressController.getProgress);
module.exports = router;
