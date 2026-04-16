/**
 * PDF Transform Service — rotate, watermark, page numbers, organize
 */
const { PDFDocument, rgb, StandardFonts, degrees, loadPDF, parseHexColor } = require('./shared');

// ──────────────────────────────────────────────────────────────────────────────
// ROTATE
// ──────────────────────────────────────────────────────────────────────────────
const rotatePDF = async (filePath, rotation = 90, pageNumbers = null) => {
  const pdfDoc = await loadPDF(filePath);
  const pages = pdfDoc.getPages();

  const pageIndices = pageNumbers
    ? pageNumbers.map((n) => n - 1).filter((i) => i >= 0 && i < pages.length)
    : pages.map((_, i) => i);

  pageIndices.forEach((i) => {
    const page = pages[i];
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  });

  return Buffer.from(await pdfDoc.save());
};

// ──────────────────────────────────────────────────────────────────────────────
// WATERMARK
// ──────────────────────────────────────────────────────────────────────────────
const addWatermark = async (filePath, text = 'CONFIDENTIAL', options = {}) => {
  const pdfDoc = await loadPDF(filePath);
  const font = await pdfDoc.embedFont(options.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const {
    fontSize = 60,
    opacity = 0.25,
    colorHex = '#888888',
    rotation = -45,
    position = 'center',
  } = options;

  const { r, g, b } = parseHexColor(colorHex);

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;

    let x = (width - textWidth) / 2;
    let y = (height - textHeight) / 2;

    if (position === 'top-left') { x = 40; y = height - 80; }
    else if (position === 'top-right') { x = width - textWidth - 40; y = height - 80; }
    else if (position === 'bottom-left') { x = 40; y = 40; }
    else if (position === 'bottom-right') { x = width - textWidth - 40; y = 40; }

    page.drawText(text, {
      x, y,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(rotation),
    });
  });

  return Buffer.from(await pdfDoc.save());
};

// ──────────────────────────────────────────────────────────────────────────────
// PAGE NUMBERS
// ──────────────────────────────────────────────────────────────────────────────
const addPageNumbers = async (filePath, options = {}) => {
  const pdfDoc = await loadPDF(filePath);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const {
    startNumber = 1,
    position = 'bottom-center',
    fontSize = 12,
    format = 'numeric',
    margin = 30,
  } = options;

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNum = startNumber + index;
    const label = format === 'page-n-of-total'
      ? `Page ${pageNum} of ${pages.length}`
      : `${pageNum}`;
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    let x, y;
    if (position === 'bottom-center') { x = (width - textWidth) / 2; y = margin; }
    else if (position === 'bottom-left') { x = margin; y = margin; }
    else if (position === 'bottom-right') { x = width - textWidth - margin; y = margin; }
    else if (position === 'top-center') { x = (width - textWidth) / 2; y = height - margin; }
    else if (position === 'top-left') { x = margin; y = height - margin; }
    else if (position === 'top-right') { x = width - textWidth - margin; y = height - margin; }
    else { x = (width - textWidth) / 2; y = margin; }

    page.drawText(label, {
      x, y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return Buffer.from(await pdfDoc.save());
};

// ──────────────────────────────────────────────────────────────────────────────
// ORGANIZE (reorder pages)
// ──────────────────────────────────────────────────────────────────────────────
const organizePDF = async (filePath, pageOrder = []) => {
  const pdfDoc = await loadPDF(filePath);
  const totalPages = pdfDoc.getPageCount();

  if (!pageOrder.length) {
    throw new Error('Page order array is required. Use page numbers (1-based).');
  }

  const newPdf = await PDFDocument.create();

  for (const pageNum of pageOrder) {
    if (pageNum < 1 || pageNum > totalPages) continue;
    const [page] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
    newPdf.addPage(page);
  }

  if (newPdf.getPageCount() === 0) {
    throw new Error('No valid pages in the page order array.');
  }

  return Buffer.from(await newPdf.save());
};

module.exports = { rotatePDF, addWatermark, addPageNumbers, organizePDF };
