const express = require('express');
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const progressRoutes = require('./progressRoutes');
const learnRoutes = require('./learnRoutes');
const aiRoutes = require('./aiRoutes');
const translationRoutes = require('./translationRoutes');
const certificateRoutes = require('./certificateRoutes');

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/progress', progressRoutes);
router.use('/learn', learnRoutes);
router.use('/ai', aiRoutes);
router.use('/translation', translationRoutes);
router.use('/certificates', certificateRoutes);

module.exports = router;
