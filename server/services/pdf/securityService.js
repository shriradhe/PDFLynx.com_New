/**
 * PDF Security Service — protect, unlock, redact
 */
const { PDFDocument, rgb, loadPDF, fsSync, fsAsync, path, uuidv4, logger } = require('./shared');

// ──────────────────────────────────────────────────────────────────────────────
// PROTECT PDF
// ──────────────────────────────────────────────────────────────────────────────
const protectPDF = async (filePath, userPassword, ownerPassword) => {
  const muhammara = require('muhammara');
  const tempOutput = path.join(path.dirname(filePath), `protected_${uuidv4()}.pdf`);

  try {
    muhammara.recrypt(filePath, tempOutput, {
      userPassword: userPassword,
      ownerPassword: ownerPassword || userPassword,
      userProtectionFlag: 4,
    });

    const buffer = await fsAsync.readFile(tempOutput);
    try { await fsAsync.unlink(tempOutput); } catch {}
    return buffer;
  } catch (err) {
    try { await fsAsync.unlink(tempOutput); } catch {}
    throw new Error(`Failed to protect PDF: ${err.message}`);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// UNLOCK PDF
// ──────────────────────────────────────────────────────────────────────────────
const unlockPDF = async (filePath, password = '') => {
  const muhammara = require('muhammara');
  const tempOutput = path.join(path.dirname(filePath), `unlocked_${uuidv4()}.pdf`);

  try {
    muhammara.recrypt(filePath, tempOutput, { password });
    const buffer = await fsAsync.readFile(tempOutput);
    try { await fsAsync.unlink(tempOutput); } catch {}
    return buffer;
  } catch (err) {
    try { await fsAsync.unlink(tempOutput); } catch {}
    throw new Error('Failed to unlock PDF. The password might be incorrect.');
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// REDACT PDF
// ──────────────────────────────────────────────────────────────────────────────
const redactPDF = async (filePath, regions = []) => {
  const pdfDoc = await loadPDF(filePath);
  const pages = pdfDoc.getPages();

  for (const region of regions) {
    const pageIndex = Math.max(0, Math.min((region.page || 1) - 1, pages.length - 1));
    const page = pages[pageIndex];

    page.drawRectangle({
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      color: rgb(0, 0, 0),
      opacity: 1,
    });

    const margin = 1;
    page.drawRectangle({
      x: region.x - margin,
      y: region.y - margin,
      width: region.width + margin * 2,
      height: region.height + margin * 2,
      color: rgb(0, 0, 0),
      opacity: 1,
    });
  }

  logger.warn(
    'Visual-only redaction applied. Underlying PDF content (text streams, annotations, metadata) ' +
    'is NOT removed. Do NOT use for legally sensitive redactions.'
  );
  return Buffer.from(await pdfDoc.save());
};

module.exports = { protectPDF, unlockPDF, redactPDF };
