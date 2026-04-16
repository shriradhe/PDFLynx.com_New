const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const { getOutputPath } = require('./fileHelper');

const saveOutput = (buffer, filename) => {
  const outputPath = getOutputPath(filename);
  fs.writeFileSync(outputPath, buffer);
  const stat = fs.statSync(outputPath);
  return {
    filename,
    path: outputPath,
    size: stat.size,
    downloadUrl: `/outputs/${filename}`,
  };
};

const saveOutputsAsZip = async (buffers, baseFilename, ext) => {
  const zipFilename = `${baseFilename}.zip`;
  const zipPath = getOutputPath(zipFilename);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const stat = fs.statSync(zipPath);
      resolve({
        filename: zipFilename,
        path: zipPath,
        size: stat.size,
        downloadUrl: `/outputs/${zipFilename}`,
      });
    });

    archive.on('error', reject);
    archive.pipe(output);

    buffers.forEach((buf, i) => {
      archive.append(buf, { name: `${baseFilename}_part${i + 1}${ext}` });
    });

    archive.finalize();
  });
};

const processAndSaveOutput = async (buffers, tool) => {
  const baseFilename = `${tool}_${uuidv4()}`;
  
  if (buffers.length === 1) {
    const ext = getExtensionForTool(tool);
    const filename = `${baseFilename}${ext}`;
    return saveOutput(buffers[0], filename);
  } else {
    const ext = getExtensionForTool(tool);
    return saveOutputsAsZip(buffers, baseFilename, ext);
  }
};

const getExtensionForTool = (tool) => {
  const extensions = {
    'pdf-to-word': '.docx',
    'ocr': '.txt',
    'pdf-to-text': '.txt',
    'pdf-to-png': '.png',
    'pdf-to-jpg': '.jpg',
    'jpg-to-pdf': '.pdf',
    'pdf-to-word': '.docx',
    'merge': '.pdf',
    'split': '.pdf',
    'compress': '.pdf',
    'rotate': '.pdf',
    'watermark': '.pdf',
    'protect': '.pdf',
    'unlock': '.pdf',
    'page-numbers': '.pdf',
    'sign': '.pdf',
    'edit': '.pdf',
    'organize': '.pdf',
    'redact': '.pdf',
    'html-to-pdf': '.pdf',
    'image-to-pdf': '.pdf',
    'annotate': '.pdf',
    'fill-form': '.pdf',
  };
  return extensions[tool] || '.pdf';
};

module.exports = {
  saveOutput,
  saveOutputsAsZip,
  processAndSaveOutput,
  getExtensionForTool,
};
