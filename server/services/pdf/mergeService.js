/**
 * PDF Merge Service
 */
const { PDFDocument, loadPDF } = require('./shared');

const mergePDFs = async (filePaths) => {
  if (!filePaths || filePaths.length < 2) {
    throw new Error('At least 2 PDF files are required for merging.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const filePath of filePaths) {
    const pdf = await loadPDF(filePath);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
};

module.exports = { mergePDFs };
