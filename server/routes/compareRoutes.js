const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { handleMultipleUpload } = require('../middleware/uploadMiddleware');
const { compare } = require('../controllers/compareController');

router.post('/compare', optionalAuth, handleMultipleUpload, compare);

module.exports = router;
