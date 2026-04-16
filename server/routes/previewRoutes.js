const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdfService');
const { optionalAuth } = require('../middleware/authMiddleware');
const { handleSingleUpload } = require('../middleware/uploadMiddleware');
const { deleteFiles } = require('../utils/fileHelper');

router.post('/thumbnail', optionalAuth, handleSingleUpload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });

    const pageNumber = parseInt(req.body.pageNumber) || 1;
    const images = await pdfService.pdfToPng(req.file.path, 1.0);

    if (pageNumber < 1 || pageNumber > images.length) {
      deleteFiles([req.file.path]);
      return res.status(400).json({ success: false, message: `Invalid page number. PDF has ${images.length} pages.` });
    }

    const thumbnail = images[pageNumber - 1];
    res.set('Content-Type', 'image/png');
    res.send(thumbnail);
    deleteFiles([req.file.path]);
  } catch (error) {
    if (req.file) deleteFiles([req.file.path]);
    console.error('Thumbnail error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate thumbnail.' });
  }
});

router.post('/page-count', optionalAuth, handleSingleUpload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });

    const { PDFDocument } = require('pdf-lib');
    const bytes = require('fs').readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    res.json({ success: true, pageCount: pdfDoc.getPageCount() });
    deleteFiles([req.file.path]);
  } catch (error) {
    if (req.file) deleteFiles([req.file.path]);
    console.error('Page count error:', error);
    res.status(500).json({ success: false, message: 'Failed to get page count.' });
  }
});

module.exports = router;
