const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { handleSingleUpload } = require('../middleware/uploadMiddleware');
const { createRequest, signDocument } = require('../controllers/signatureController');

router.post('/create', optionalAuth, handleSingleUpload, createRequest);
router.post('/sign', optionalAuth, handleSingleUpload, signDocument);

module.exports = router;
