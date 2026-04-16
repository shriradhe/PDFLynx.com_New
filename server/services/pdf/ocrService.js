/**
 * PDF OCR Service
 */
const { fsSync, fsAsync, path, logger } = require('./shared');
const { pdfToImages } = require('./convertService');

const performOCR = async (filePath) => {
  const Tesseract = require('tesseract.js');
  const ext = path.extname(filePath).toLowerCase();

  let imagePath = filePath;
  let tempImagePath = null;

  if (ext === '.pdf') {
    try {
      const images = await pdfToImages(filePath, 2.0);
      if (images.length === 0) throw new Error('Could not render PDF for OCR.');
      tempImagePath = filePath.replace('.pdf', '_ocr_page1.jpg');
      await fsAsync.writeFile(tempImagePath, images[0]);
      imagePath = tempImagePath;
    } catch (err) {
      logger.error('PDF to image conversion failed for OCR, falling back to pdfParse:', err.message);
      const pdfParse = require('pdf-parse');
      const dataBuffer = await fsAsync.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || 'No text could be extracted.';
    }
  }

  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: () => {},
    });
    return text;
  } finally {
    if (tempImagePath) {
      try { await fsAsync.unlink(tempImagePath); } catch {}
    }
  }
};

module.exports = { performOCR };
