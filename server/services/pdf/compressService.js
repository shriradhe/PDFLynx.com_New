/**
 * PDF Compress Service
 */
const { PDFDocument, fsSync, fsAsync, path, uuidv4, logger } = require('./shared');

const VALID_LEVELS = new Set(['low', 'recommended', 'strong']);

const compressPDF = async (filePath, level = 'strong') => {
  const { execFile } = require('child_process');
  const { promisify } = require('util');
  const execFileAsync = promisify(execFile);
  const selectedLevel = VALID_LEVELS.has(level) ? level : 'strong';

  const originalBytes = await fsAsync.readFile(filePath);
  const tempOutput = path.join(path.dirname(filePath), `compressed_temp_${uuidv4()}.pdf`);
  const tempAggressiveOutput = path.join(path.dirname(filePath), `compressed_aggressive_${uuidv4()}.pdf`);

  const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
  const baseArgs = [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
  ];
  const levelToPreset = {
    low: '/printer',
    recommended: '/ebook',
    strong: '/screen',
  };
  const baseLevelArgs = [
    ...baseArgs,
    `-dPDFSETTINGS=${levelToPreset[selectedLevel]}`,
    `-sOutputFile=${tempOutput}`,
    filePath,
  ];
  const aggressiveArgs = [
    ...baseArgs,
    '-dPDFSETTINGS=/screen',
    '-dDetectDuplicateImages=true',
    '-dDownsampleColorImages=true',
    '-dColorImageDownsampleType=/Bicubic',
    '-dColorImageResolution=96',
    '-dDownsampleGrayImages=true',
    '-dGrayImageDownsampleType=/Bicubic',
    '-dGrayImageResolution=96',
    '-dDownsampleMonoImages=true',
    '-dMonoImageDownsampleType=/Subsample',
    '-dMonoImageResolution=150',
    `-sOutputFile=${tempAggressiveOutput}`,
    filePath,
  ];

  try {
    await execFileAsync(gsCommand, baseLevelArgs, { timeout: 60000 });

    try {
      const compressedBytes = await fsAsync.readFile(tempOutput);
      await fsAsync.unlink(tempOutput);

      // Retry with stronger image downsampling only for recommended/strong profiles.
      if (selectedLevel !== 'low' && compressedBytes.length >= originalBytes.length) {
        await execFileAsync(gsCommand, aggressiveArgs, { timeout: 60000 });
        const aggressiveBytes = await fsAsync.readFile(tempAggressiveOutput);
        await fsAsync.unlink(tempAggressiveOutput);

        if (aggressiveBytes.length < compressedBytes.length) {
          return Buffer.from(aggressiveBytes);
        }
      }

      return Buffer.from(compressedBytes);
    } catch {
      throw new Error('Ghostscript produced no output file');
    }
  } catch (gsError) {
    try { await fsAsync.unlink(tempOutput); } catch {}
    try { await fsAsync.unlink(tempAggressiveOutput); } catch {}

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
