/**
 * PDF Split Service
 */
const { PDFDocument, loadPDF } = require('./shared');

const splitPDF = async (filePath, splitMode = 'all', value = null) => {
  const pdfDoc = await loadPDF(filePath);
  const totalPages = pdfDoc.getPageCount();
  const results = [];

  if (splitMode === 'range' && Array.isArray(value)) {
    for (const range of value) {
      const newPdf = await PDFDocument.create();
      const start = Math.max(0, (range.start || 1) - 1);
      const end = Math.min((range.end || totalPages) - 1, totalPages - 1);
      const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      const pages = await newPdf.copyPages(pdfDoc, indices);
      pages.forEach((p) => newPdf.addPage(p));
      results.push(Buffer.from(await newPdf.save()));
    }
  } else if (splitMode === 'every' && typeof value === 'number') {
    for (let i = 0; i < totalPages; i += value) {
      const newPdf = await PDFDocument.create();
      const indices = Array.from({ length: Math.min(value, totalPages - i) }, (_, j) => i + j);
      const pages = await newPdf.copyPages(pdfDoc, indices);
      pages.forEach((p) => newPdf.addPage(p));
      results.push(Buffer.from(await newPdf.save()));
    }
  } else {
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(page);
      results.push(Buffer.from(await newPdf.save()));
    }
  }

  return results;
};

module.exports = { splitPDF };
