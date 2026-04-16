const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fsSync = require('fs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const createSigningRequest = async (filePath, signers = []) => {
  const pdfDoc = await PDFDocument.load(fsSync.readFileSync(filePath));
  const totalPages = pdfDoc.getPageCount();

  const signingId = uuidv4();
  const signingLinks = signers.map((signer, index) => ({
    signerId: uuidv4(),
    email: signer.email,
    name: signer.name,
    page: signer.page || totalPages,
    x: signer.x || 50,
    y: signer.y || 50,
    width: signer.width || 200,
    height: signer.height || 50,
    status: 'pending',
    order: index + 1,
    signedAt: null,
    signatureToken: crypto.randomBytes(32).toString('hex'),
  }));

  return {
    signingId,
    documentHash: crypto.createHash('sha256').update(fsSync.readFileSync(filePath)).digest('hex'),
    totalPages,
    signers: signingLinks,
    createdAt: new Date(),
    status: 'pending',
  };
};

const applySignature = async (filePath, signatureData) => {
  const pdfDoc = await PDFDocument.load(fsSync.readFileSync(filePath));
  const pages = pdfDoc.getPages();
  const page = pages[Math.max(0, Math.min((signatureData.page || 1) - 1, pages.length - 1))];
  const { height: pageHeight } = page.getSize();

  if (signatureData.imageData) {
    const imageBytes = Buffer.from(signatureData.imageData, 'base64');
    const format = (signatureData.imageFormat || 'png').toLowerCase();
    let image;
    if (format === 'png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      image = await pdfDoc.embedJpg(imageBytes);
    }

    const sigWidth = signatureData.width || 200;
    const sigHeight = (sigWidth / image.width) * image.height;

    page.drawImage(image, {
      x: signatureData.x || 50,
      y: pageHeight - (signatureData.y || 50) - sigHeight,
      width: sigWidth,
      height: sigHeight,
    });
  }

  if (signatureData.text) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = signatureData.fontSize || 12;

    page.drawText(signatureData.text, {
      x: signatureData.x || 50,
      y: pageHeight - (signatureData.y || 50) - fontSize,
      size: fontSize,
      font,
      color: rgb(0, 0, 0.6),
    });

    page.drawText(`Signed: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, {
      x: signatureData.x || 50,
      y: pageHeight - (signatureData.y || 50) - fontSize - 16,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return Buffer.from(await pdfDoc.save());
};

module.exports = { createSigningRequest, applySignature };
