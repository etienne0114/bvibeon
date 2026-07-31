const express = require('express');
const { listMyCertificates, getCourseCertificate, verifyCertificate } = require('../controllers/certificateController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.get('/verify/:code', verifyCertificate);
router.get('/', auth, listMyCertificates);
router.get('/course/:courseId', auth, getCourseCertificate);
module.exports = router;
