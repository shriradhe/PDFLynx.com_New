const express = require('express');
const router = express.Router();
const {
  merge,
  split,
  compress,
  rotate,
  watermark,
  protect,
  unlock,
  pageNumbers,
  convert,
  ocr,
  getHistory,
  sign,
  edit,
  pdfToText,
  pdfToPng,
  organize,
  redact,
  htmlToPdf,
  mergeImages,
  annotate,
  fillForm,
} = require('../controllers/pdfController');
const { protect: authProtect, optionalAuth } = require('../middleware/authMiddleware');
const { handleSingleUpload, handleMultipleUpload, handleImageUpload } = require('../middleware/uploadMiddleware');
const { pdfLimiter } = require('../utils/rateLimiter');
const {
  splitValidation,
  rotateValidation,
  watermarkValidation,
  protectValidation,
  unlockValidation,
  pageNumbersValidation,
  convertValidation,
} = require('../middleware/validationMiddleware');

// All PDF routes accept optional auth (anon users can still process files)
// Rate-limited to 30 ops/hour per IP

router.post('/merge',        pdfLimiter, optionalAuth, handleMultipleUpload, merge);
router.post('/split',        pdfLimiter, optionalAuth, handleSingleUpload,   splitValidation, split);
router.post('/compress',     pdfLimiter, optionalAuth, handleSingleUpload,   compress);
router.post('/rotate',       pdfLimiter, optionalAuth, handleSingleUpload,   rotateValidation, rotate);
router.post('/watermark',    pdfLimiter, optionalAuth, handleSingleUpload,   watermarkValidation, watermark);
router.post('/protect',      pdfLimiter, optionalAuth, handleSingleUpload,   protectValidation, protect);
router.post('/unlock',       pdfLimiter, optionalAuth, handleSingleUpload,   unlockValidation, unlock);
router.post('/page-numbers', pdfLimiter, optionalAuth, handleSingleUpload,   pageNumbersValidation, pageNumbers);
router.post('/convert',      pdfLimiter, optionalAuth, handleMultipleUpload, convertValidation, convert);
router.post('/ocr',          pdfLimiter, optionalAuth, handleSingleUpload,   ocr);

// New enterprise tools
router.post('/sign',         pdfLimiter, optionalAuth, handleSingleUpload,   sign);
router.post('/edit',         pdfLimiter, optionalAuth, handleSingleUpload,   edit);
router.post('/pdf-to-text',  pdfLimiter, optionalAuth, handleSingleUpload,   pdfToText);
router.post('/pdf-to-png',   pdfLimiter, optionalAuth, handleSingleUpload,   pdfToPng);
router.post('/organize',     pdfLimiter, optionalAuth, handleSingleUpload,   organize);
router.post('/redact',       pdfLimiter, optionalAuth, handleSingleUpload,   redact);
router.post('/html-to-pdf',  pdfLimiter, optionalAuth,                       htmlToPdf);
router.post('/image-to-pdf', pdfLimiter, optionalAuth, handleImageUpload,    mergeImages);

// Annotation & form filling
router.post('/annotate',     pdfLimiter, optionalAuth, handleSingleUpload,   annotate);
router.post('/fill-form',    pdfLimiter, optionalAuth, handleSingleUpload,   fillForm);

// History (auth required)
router.get('/history', authProtect, getHistory);

module.exports = router;
