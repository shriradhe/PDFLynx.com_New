/**
 * PDF Convert Service — PDF↔Image, PDF↔Word, PDF→Text, PDF→PNG
 */
const {
  PDFDocument, fsAsync, fsSync, path, logger,
  NodeCanvasFactory, getPdfjsLib, getCreateNodeCanvas,
} = require('./shared');
const sharp = require('sharp');

// ──────────────────────────────────────────────────────────────────────────────
// IMAGE → PDF
// ──────────────────────────────────────────────────────────────────────────────
const imageToPDF = async (filePaths) => {
  const pdfDoc = await PDFDocument.create();

  for (const filePath of filePaths) {
    const imageBytes = await fsAsync.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let image;
    if (ext === '.jpg' || ext === '.jpeg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (ext === '.png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      const jpegBuffer = await sharp(filePath).jpeg({ quality: 85 }).toBuffer();
      image = await pdfDoc.embedJpg(jpegBuffer);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  return Buffer.from(await pdfDoc.save());
};

// ──────────────────────────────────────────────────────────────────────────────
// PDF → JPG
// ──────────────────────────────────────────────────────────────────────────────
const pdfToImages = async (filePath, scale = 2.0) => {
  const pdfjsLib = getPdfjsLib();
  const createNodeCanvas = getCreateNodeCanvas();

  const data = new Uint8Array(await fsAsync.readFile(filePath));
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    canvasFactory: new NodeCanvasFactory(),
  });

  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const images = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = createNodeCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: context, viewport }).promise;

    const buffer = await canvas.encode('jpeg', 92);
    images.push(buffer);
  }

  return images;
};

// ──────────────────────────────────────────────────────────────────────────────
// PDF → Word (.docx)
// ──────────────────────────────────────────────────────────────────────────────
const pdfToWord = async (filePath) => {
  const pdfjsLib = getPdfjsLib();
  const createNodeCanvas = getCreateNodeCanvas();
  const docx = require('docx');

  const data = new Uint8Array(await fsAsync.readFile(filePath));
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    canvasFactory: new NodeCanvasFactory(),
  });

  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const SCALE = 3;

  const sections = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale: SCALE });

    const canvas = createNodeCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: context, viewport }).promise;

    const rawBuffer = await canvas.encode('png', { compressionLevel: 6 });
    const pngBuffer = await sharp(rawBuffer)
      .toColorspace('srgb')
      .removeAlpha()
      .png({ compressionLevel: 6, progressive: false })
      .toBuffer();

    const pageWidth = Math.round(viewport.width);
    const pageHeight = Math.round(viewport.height);

    sections.push({
      properties: {
        page: {
          size: { width: pageWidth, height: pageHeight },
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      },
      children: [
        new docx.Paragraph({
          children: [
            new docx.ImageRun({
              data: pngBuffer,
              transformation: { width: pageWidth, height: pageHeight },
            }),
          ],
          spacing: { before: 0, after: 0, line: 0 },
        }),
      ],
    });
  }

  const doc = new docx.Document({ sections });
  const buffer = await docx.Packer.toBuffer(doc);
  return Buffer.from(buffer);
};

// ──────────────────────────────────────────────────────────────────────────────
// PDF → TEXT
// ──────────────────────────────────────────────────────────────────────────────
const pdfToText = async (filePath) => {
  const pdfParse = require('pdf-parse');
  const dataBuffer = await fsAsync.readFile(filePath);
  const pdfData = await pdfParse(dataBuffer);

  const header = `Extracted from PDF\nPages: ${pdfData.numpages}\n\n${'='.repeat(60)}\n\n`;
  const textContent = pdfData.text || 'No text could be extracted from this PDF.';

  return Buffer.from(header + textContent, 'utf8');
};

// ──────────────────────────────────────────────────────────────────────────────
// PDF → PNG
// ──────────────────────────────────────────────────────────────────────────────
const pdfToPng = async (filePath, scale = 2.0) => {
  const pdfjsLib = getPdfjsLib();
  const createNodeCanvas = getCreateNodeCanvas();

  const data = new Uint8Array(await fsAsync.readFile(filePath));
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    canvasFactory: new NodeCanvasFactory(),
  });

  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const images = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = createNodeCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: context, viewport }).promise;

    const buffer = await canvas.encode('png');
    images.push(buffer);
  }

  return images;
};

// ──────────────────────────────────────────────────────────────────────────────
// HTML → PDF
// ──────────────────────────────────────────────────────────────────────────────
const htmlToPDF = async (htmlContent, options = {}) => {
  const { PDFDocument: PdfDoc, rgb, StandardFonts } = require('pdf-lib');
  const pdfDoc = await PdfDoc.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageSize = options.pageSize || 'a4';
  const pageSizes = {
    a4: [595.28, 841.89],
    letter: [612, 792],
    legal: [612, 1008],
  };
  const [pageWidth, pageHeight] = pageSizes[pageSize] || pageSizes.a4;
  const margin = options.margin || 50;
  const fontSize = options.fontSize || 11;
  const lineHeight = fontSize * 1.5;

  const plainText = htmlContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const lines = plainText.split('\n');
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  const maxWidth = pageWidth - margin * 2;

  for (const line of lines) {
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    const words = line.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        page.drawText(currentLine, {
          x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1),
        });
        y -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, {
        x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    }
  }

  return Buffer.from(await pdfDoc.save());
};

// ──────────────────────────────────────────────────────────────────────────────
// MERGE IMAGES → PDF
// ──────────────────────────────────────────────────────────────────────────────
const mergeImagesToPDF = async (filePaths, options = {}) => {
  const pdfDoc = await PDFDocument.create();
  const pageSize = options.pageSize || 'a4';
  const pageSizes = { a4: [595.28, 841.89], letter: [612, 792] };
  const [pageWidth, pageHeight] = pageSizes[pageSize] || pageSizes.a4;
  const margin = options.margin || 20;

  for (const filePath of filePaths) {
    const jpegBuffer = await sharp(filePath)
      .resize(pageWidth - margin * 2, pageHeight - margin * 2, { fit: 'inside' })
      .jpeg({ quality: 90 })
      .toBuffer();

    const image = await pdfDoc.embedJpg(jpegBuffer);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const imgAspect = image.width / image.height;
    const pageAspect = (pageWidth - margin * 2) / (pageHeight - margin * 2);

    let drawWidth, drawHeight, x, y;
    if (imgAspect > pageAspect) {
      drawWidth = pageWidth - margin * 2;
      drawHeight = drawWidth / imgAspect;
      x = margin;
      y = (pageHeight - drawHeight) / 2;
    } else {
      drawHeight = pageHeight - margin * 2;
      drawWidth = drawHeight * imgAspect;
      x = (pageWidth - drawWidth) / 2;
      y = margin;
    }

    page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
  }

  return Buffer.from(await pdfDoc.save());
};

module.exports = {
  imageToPDF,
  pdfToImages,
  pdfToWord,
  pdfToText,
  pdfToPng,
  htmlToPDF,
  mergeImagesToPDF,
};
