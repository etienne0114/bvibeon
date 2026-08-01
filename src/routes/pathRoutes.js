const express = require('express');
const pathController = require('../controllers/pathController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.get('/', auth, pathController.listPaths);
router.get('/:pathId', auth, pathController.getPath);
router.post('/:pathId/enroll', auth, pathController.enroll);
module.exports = router;
