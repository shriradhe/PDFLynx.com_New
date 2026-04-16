/**
 * PDF Edit Service — edit, sign, annotate, fill-form
 */
const { PDFDocument, rgb, StandardFonts, loadPDF, parseHexColor, logger } = require('./shared');
const docx = require('docx');

// ──────────────────────────────────────────────────────────────────────────────
// SIGN PDF
// ──────────────────────────────────────────────────────────────────────────────
const signPDF = async (filePath, options = {}) => {
  const pdfDoc = await loadPDF(filePath);
  const pages = pdfDoc.getPages();
  const targetPage = pages[(options.pageNumber || 1) - 1] || pages[pages.length - 1];

  if (options.signatureImageData) {
    const imageBytes = Buffer.from(options.signatureImageData, 'base64');
    const format = (options.signatureImageFormat || 'jpeg').toLowerCase();
    let image;
    if (format === 'png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      image = await pdfDoc.embedJpg(imageBytes);
    }

    const sigWidth = options.width || 150;
    const sigHeight = (sigWidth / image.width) * image.height;
    const x = options.x || 50;
    const y = options.y || 50;

    targetPage.drawImage(image, { x, y, width: sigWidth, height: sigHeight });
  }

  if (options.signatureText) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = options.fontSize || 12;
    const x = options.textX || 50;
    const y = options.textY || 30;

    targetPage.drawText(options.signatureText, {
      x, y, size: fontSize, font, color: rgb(0, 0, 0),
    });

    const dateText = `Signed: ${new Date().toLocaleDateString()}`;
    targetPage.drawText(dateText, {
      x, y: y - 15, size: 8, font, color: rgb(0.5, 0.5, 0.5),
    });
  }

  return Buffer.from(await pdfDoc.save());
};

// ──────────────────────────────────────────────────────────────────────────────
// EDIT PDF
// ──────────────────────────────────────────────────────────────────────────────
const editPDF = async (filePath, edits = []) => {
  const pdfDoc = await loadPDF(filePath);
  const pages = pdfDoc.getPages();

  for (const edit of edits) {
    const pageIndex = Math.max(0, Math.min((edit.page || 1) - 1, pages.length - 1));
    const page = pages[pageIndex];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    if (edit.type === 'text') {
      const font = await pdfDoc.embedFont(
        edit.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica
      );
      const fontSize = edit.fontSize || 12;
      const { r, g, b } = parseHexColor(edit.color);

      page.drawText(edit.text, {
        x: edit.x || 50,
        y: pageHeight - (edit.y || 50) - fontSize,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity: edit.opacity || 1,
      });
    } else if (edit.type === 'image' && edit.imageData) {
      const imageBytes = Buffer.from(edit.imageData, 'base64');
      const format = (edit.imageFormat || 'jpeg').toLowerCase();
      let image;
      if (format === 'png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      const imgWidth = edit.width || 100;
      const imgHeight = edit.height || (imgWidth / image.width) * image.height;

      page.drawImage(image, {
        x: edit.x || 50,
        y: pageHeight - (edit.y || 50) - imgHeight,
        width: imgWidth,
        height: imgHeight,
        opacity: edit.opacity || 1,
      });
    } else if (edit.type === 'rectangle') {
      const { r, g, b } = parseHexColor(edit.color);

      page.drawRectangle({
        x: edit.x || 50,
        y: pageHeight - (edit.y || 50) - (edit.height || 100),
        width: edit.width || 100,
        height: edit.height || 100,
        borderColor: rgb(r, g, b),
        borderWidth: edit.borderWidth || 2,
        opacity: edit.opacity || 1,
      });
    }
  }

  return Buffer.from(await pdfDoc.save());
};

// ──────────────────────────────────────────────────────────────────────────────
// ANNOTATE PDF
// ──────────────────────────────────────────────────────────────────────────────
const annotatePDF = async (filePath, annotations = []) => {
  const pdfDoc = await loadPDF(filePath);
  const pages = pdfDoc.getPages();

  for (const annotation of annotations) {
    const pageIndex = Math.max(0, Math.min((annotation.page || 1) - 1, pages.length - 1));
    const page = pages[pageIndex];
    const { height: pageHeight } = page.getSize();

    if (annotation.type === 'highlight') {
      const { r, g, b } = parseHexColor(annotation.color || '#ffff00');
      page.drawRectangle({
        x: annotation.x,
        y: pageHeight - annotation.y - annotation.height,
        width: annotation.width,
        height: annotation.height,
        color: rgb(r, g, b),
        opacity: annotation.opacity || 0.3,
      });
    } else if (annotation.type === 'underline') {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = annotation.fontSize || 12;
      const textWidth = font.widthOfTextAtSize(annotation.text || '', fontSize);

      page.drawLine({
        start: { x: annotation.x, y: pageHeight - annotation.y },
        end: { x: annotation.x + textWidth, y: pageHeight - annotation.y },
        thickness: annotation.thickness || 1,
        color: rgb(0, 0, 0),
        opacity: annotation.opacity || 1,
      });
    } else if (annotation.type === 'strikethrough') {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = annotation.fontSize || 12;
      const textWidth = font.widthOfTextAtSize(annotation.text || '', fontSize);

      page.drawLine({
        start: { x: annotation.x, y: pageHeight - annotation.y - fontSize / 2 },
        end: { x: annotation.x + textWidth, y: pageHeight - annotation.y - fontSize / 2 },
        thickness: annotation.thickness || 1,
        color: rgb(0.8, 0, 0),
        opacity: annotation.opacity || 1,
      });
    } else if (annotation.type === 'note') {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = annotation.fontSize || 10;
      const { r, g, b } = parseHexColor(annotation.color || '#ff0000');

      page.drawText(`Note: ${annotation.text}`, {
        x: annotation.x,
        y: pageHeight - annotation.y - fontSize,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity: annotation.opacity || 1,
      });
    }
  }

  return Buffer.from(await pdfDoc.save());
};

// ──────────────────────────────────────────────────────────────────────────────
// FILL PDF FORM
// ──────────────────────────────────────────────────────────────────────────────
const fillPDFForm = async (filePath, fields = {}) => {
  const pdfDoc = await loadPDF(filePath);
  const form = pdfDoc.getForm();

  for (const [fieldName, value] of Object.entries(fields)) {
    try {
      const field = form.getField(fieldName);
      if (!field) continue;

      const type = field.constructor.name;
      if (type === 'PDFTextField' || type === 'PDFRichTextField') {
        field.setText(String(value));
      } else if (type === 'PDFCheckBox') {
        if (value === true || value === 'true' || value === 'On') {
          field.check();
        } else {
          field.uncheck();
        }
      } else if (type === 'PDFRadioGroup') {
        field.select(String(value));
      } else if (type === 'PDFOptionList') {
        field.select(Array.isArray(value) ? value : [String(value)]);
      } else if (type === 'PDFDropdown') {
        field.select(String(value));
      }
    } catch (err) {
      logger.warn(`Failed to fill field ${fieldName}:`, err.message);
    }
  }

  form.updateFieldAppearances();
  return Buffer.from(await pdfDoc.save());
};

module.exports = { signPDF, editPDF, annotatePDF, fillPDFForm };
