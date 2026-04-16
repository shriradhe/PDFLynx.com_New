const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { handleMultipleUpload, handleImageUpload } = require('../middleware/uploadMiddleware');
const { batchProcess } = require('../controllers/batchController');

router.post('/process', optionalAuth, handleMultipleUpload, batchProcess);

module.exports = router;
