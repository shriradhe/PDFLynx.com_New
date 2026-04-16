/**
 * PDF Compress Service
 */
const { PDFDocument, fsSync, fsAsync, path, uuidv4, logger } = require('./shared');

const compressPDF = async (filePath) => {
  const { execFile } = require('child_process');
  const { promisify } = require('util');
  const execFileAsync = promisify(execFile);

  const originalBytes = await fsAsync.readFile(filePath);
  const tempOutput = path.join(path.dirname(filePath), `compressed_temp_${uuidv4()}.pdf`);

  const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
  const args = [
    '-SDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    '-dPDFSETTINGS=/screen',
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    `-sOutputFile=${tempOutput}`,
    filePath,
  ];

  try {
    await execFileAsync(gsCommand, args, { timeout: 60000 });

    try {
      const compressedBytes = await fsAsync.readFile(tempOutput);
      await fsAsync.unlink(tempOutput);
      return Buffer.from(compressedBytes);
    } catch {
      throw new Error('Ghostscript produced no output file');
    }
  } catch (gsError) {
    try { await fsAsync.unlink(tempOutput); } catch {}

    if (gsError.code === 'ENOENT') {
      logger.warn('Ghostscript not installed. Falling back to native compression.');
    } else {
      logger.warn(`Ghostscript compression failed (${gsError.message}), falling back.`);
    }

    try {
      const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });

      if (compressedBytes.length >= originalBytes.length) {
        throw new Error(
          'Native compression could not reduce this file size. ' +
          'Ghostscript is required for deep PDF compression. ' +
          'Please install Ghostscript (gswin64c) and add it to your system PATH.'
        );
      }
      return Buffer.from(compressedBytes);
    } catch (fallbackError) {
      throw new Error(
        fallbackError.message.includes('Ghostscript')
          ? fallbackError.message
          : 'Compression failed: ' + fallbackError.message
      );
    }
  }
};

module.exports = { compressPDF };
