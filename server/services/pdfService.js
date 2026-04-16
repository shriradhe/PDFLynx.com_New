/**
 * PDF Services — Barrel Export
 * 
 * Maintains backward compatibility with the original monolithic pdfService.js.
 * All consumers can still `require('../services/pdfService')` and get the same API.
 */

const { mergePDFs } = require('./pdf/mergeService');
const { splitPDF } = require('./pdf/splitService');
const { compressPDF } = require('./pdf/compressService');
const { rotatePDF, addWatermark, addPageNumbers, organizePDF } = require('./pdf/transformService');
const { protectPDF, unlockPDF, redactPDF } = require('./pdf/securityService');
const { imageToPDF, pdfToImages, pdfToWord, pdfToText, pdfToPng, htmlToPDF, mergeImagesToPDF } = require('./pdf/convertService');
const { signPDF, editPDF, annotatePDF, fillPDFForm } = require('./pdf/editService');
const { performOCR } = require('./pdf/ocrService');

module.exports = {
  mergePDFs,
  splitPDF,
  compressPDF,
  rotatePDF,
  addWatermark,
  protectPDF,
  unlockPDF,
  addPageNumbers,
  imageToPDF,
  pdfToImages,
  pdfToWord,
  performOCR,
  pdfToText,
  pdfToPng,
  signPDF,
  editPDF,
  organizePDF,
  redactPDF,
  htmlToPDF,
  mergeImagesToPDF,
  annotatePDF,
  fillPDFForm,
};
