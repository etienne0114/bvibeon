const express = require('express');
const { runReEngagementSweep } = require('../controllers/cronController');

const router = express.Router();
router.get('/re-engagement', runReEngagementSweep);
router.post('/re-engagement', runReEngagementSweep);
module.exports = router;
