/**
 * Shared utilities for PDF service modules.
 * Common imports, canvas factory, and PDF loading helpers.
 */

const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const fsAsync = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

// ──────────────────────────────────────────────────────────────────────────────
// NodeCanvasFactory for pdfjs-dist rendering
// ──────────────────────────────────────────────────────────────────────────────
let _createNodeCanvas;
const getCreateNodeCanvas = () => {
  if (!_createNodeCanvas) {
    _createNodeCanvas = require('@napi-rs/canvas').createCanvas;
  }
  return _createNodeCanvas;
};

class NodeCanvasFactory {
  create(width, height) {
    const canvas = getCreateNodeCanvas()(width, height);
    return { canvas, context: canvas.getContext('2d') };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Load PDF bytes with ignoreEncryption
// ──────────────────────────────────────────────────────────────────────────────
const loadPDF = async (filePath, password = null) => {
  const bytes = await fsAsync.readFile(filePath);
  const options = { ignoreEncryption: true };
  if (password) options.password = password;
  return PDFDocument.load(bytes, options);
};

// ──────────────────────────────────────────────────────────────────────────────
// Get pdfjs-dist library (lazy-loaded once)
// ──────────────────────────────────────────────────────────────────────────────
let _pdfjsLib;
const getPdfjsLib = () => {
  if (!_pdfjsLib) {
    try {
      _pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
    } catch (err) {
      throw new Error(
        'PDF rendering requires "@napi-rs/canvas". Run: npm install @napi-rs/canvas\nError: ' + err.message
      );
    }
  }
  return _pdfjsLib;
};

// ──────────────────────────────────────────────────────────────────────────────
// Parse hex color to rgb values
// ──────────────────────────────────────────────────────────────────────────────
const parseHexColor = (hex) => {
  const bigint = parseInt((hex || '#000000').replace('#', ''), 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
};

module.exports = {
  PDFDocument,
  rgb,
  StandardFonts,
  degrees,
  fsAsync,
  fsSync,
  path,
  uuidv4,
  logger,
  NodeCanvasFactory,
  loadPDF,
  getPdfjsLib,
  getCreateNodeCanvas,
  parseHexColor,
};
