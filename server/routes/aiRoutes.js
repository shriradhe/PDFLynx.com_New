/**
 * AI Routes
 * AI endpoints use optional auth — work for all users,
 * with enhanced tracking for logged-in users.
 */
const express = require('express');
const router = express.Router();
const { summarize, chatUpload, chatAsk, search, status } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { handleSingleUpload } = require('../middleware/uploadMiddleware');
const { pdfLimiter } = require('../utils/rateLimiter');

// AI status (public)
router.get('/status', status);

// AI tools (optional auth — works without login, tracks usage if logged in)
router.post('/summarize', pdfLimiter, optionalAuth, handleSingleUpload, summarize);
router.post('/chat/upload', pdfLimiter, optionalAuth, handleSingleUpload, chatUpload);
router.post('/chat/ask', pdfLimiter, optionalAuth, chatAsk);
router.post('/search', pdfLimiter, optionalAuth, handleSingleUpload, search);

module.exports = router;

