const express = require('express');
const { chat } = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.post('/tutor', auth, chat);
module.exports = router;
