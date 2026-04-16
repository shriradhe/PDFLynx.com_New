/**
 * AI Summary Service
 * PDF text extraction + LLM summarization with configurable summary types.
 * Falls back to OCR (Tesseract.js) for scanned/image-based PDFs.
 */
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { getAIProvider } = require('./aiProvider');
const logger = require('../../utils/logger');

const SUMMARY_PROMPTS = {
  brief: 'Provide a concise 2-3 paragraph summary of the following document. Focus on the main points only.',
  detailed: 'Provide a detailed summary of the following document, organized with sections and bullet points. Cover all important topics, findings, and conclusions.',
  executive: 'Write an executive summary of the following document. Include key findings, recommendations, and action items. Format with clear headings and bullet points.',
  'key-points': 'Extract the top 10 key points from the following document. Present them as a numbered list with brief explanations.',
};

/**
 * Extract text from PDF using OCR (Tesseract.js) as fallback.
 * Converts each page to an image via pdfjs-dist, then runs OCR.
 * @param {Buffer} dataBuffer - Raw PDF file buffer
 * @returns {string} Extracted text
 */
const extractTextWithOCR = async (dataBuffer) => {
  logger.info('Attempting OCR text extraction for scanned PDF...');
  
  const { createWorker } = require('tesseract.js');
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = require('@napi-rs/canvas');

  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  logger.info(`OCR: Processing ${numPages} page(s)...`);

  // Create Tesseract worker
  const worker = await createWorker('eng');
  
  let allText = '';
  const maxPages = Math.min(numPages, 20); // Limit to 20 pages for performance

  try {
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better OCR accuracy
      
      // Render page to canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Convert canvas to PNG buffer
      const imageBuffer = canvas.toBuffer('image/png');
      
      // Run OCR on the image
      const { data } = await worker.recognize(imageBuffer);
      
      if (data.text && data.text.trim()) {
        allText += `\n--- Page ${i} ---\n${data.text.trim()}\n`;
      }
      
      logger.info(`OCR: Page ${i}/${maxPages} complete (${data.text?.length || 0} chars)`);
    }
  } finally {
    await worker.terminate();
  }

  if (numPages > maxPages) {
    allText += `\n\n[OCR processed first ${maxPages} of ${numPages} pages due to length limit]`;
  }

  return allText.trim();
};

/**
 * Summarize a PDF file using AI.
 * @param {string} filePath - Path to PDF file
 * @param {Object} options - { type: 'brief'|'detailed'|'executive'|'key-points', language: 'en' }
 * @returns {Object} { summary, pageCount, wordCount, usage }
 */
const summarizePDF = async (filePath, options = {}) => {
  const { type = 'detailed', language = 'en' } = options;

  // Extract text from PDF
  const dataBuffer = await fs.readFile(filePath);
  const pdfData = await pdfParse(dataBuffer);
  let text = pdfData.text || '';
  let usedOCR = false;

  // If no text found, try OCR fallback for scanned PDFs
  if (!text.trim()) {
    try {
      text = await extractTextWithOCR(dataBuffer);
      usedOCR = true;
      logger.info(`OCR extraction completed: ${text.length} chars`);
    } catch (ocrError) {
      logger.error('OCR extraction failed:', ocrError.message);
      throw new Error('No text content found in the PDF and OCR extraction failed. The PDF may be corrupted or contain only graphics.');
    }
  }

  if (!text.trim()) {
    throw new Error('No text content could be extracted from the PDF, even with OCR. The document may contain only images/graphics without readable text.');
  }

  const wordCount = text.split(/\s+/).length;

  // Chunk text if too long (max ~12000 tokens ≈ ~48000 chars)
  const maxChars = 48000;
  const truncatedText = text.length > maxChars
    ? text.substring(0, maxChars) + '\n\n[Document truncated due to length...]'
    : text;

  const systemPrompt = SUMMARY_PROMPTS[type] || SUMMARY_PROMPTS.detailed;
  const langNote = language !== 'en' ? `\nRespond in ${language}.` : '';

  const ai = getAIProvider();
  const result = await ai.chat([
    {
      role: 'system',
      content: `You are a professional document analyst. ${systemPrompt}${langNote}`,
    },
    {
      role: 'user',
      content: `Please summarize this document:\n\n${truncatedText}`,
    },
  ], {
    temperature: 0.3,
    maxTokens: 2000,
  });

  return {
    summary: result.content,
    pageCount: pdfData.numpages,
    wordCount,
    charCount: text.length,
    truncated: text.length > maxChars,
    usedOCR,
    usage: result.usage,
    model: result.model,
    summaryType: type,
  };
};

module.exports = { summarizePDF, extractTextWithOCR };
