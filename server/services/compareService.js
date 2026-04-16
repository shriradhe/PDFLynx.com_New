const { PDFDocument } = require('pdf-lib');
const fsSync = require('fs');
const pdfParse = require('pdf-parse');

const comparePDFs = async (file1Path, file2Path, options = {}) => {
  const mode = options.mode || 'text';

  if (mode === 'text') {
    const text1 = await pdfParse(fsSync.readFileSync(file1Path));
    const text2 = await pdfParse(fsSync.readFileSync(file2Path));

    const lines1 = text1.text.split('\n').map(l => l.trim()).filter(Boolean);
    const lines2 = text2.text.split('\n').map(l => l.trim()).filter(Boolean);

    const differences = [];
    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      if (lines1[i] !== lines2[i]) {
        differences.push({
          line: i + 1,
          file1: lines1[i] || '(empty)',
          file2: lines2[i] || '(empty)',
        });
      }
    }

    return {
      mode: 'text',
      pageCount1: text1.numpages,
      pageCount2: text2.numpages,
      charCount1: text1.text.length,
      charCount2: text2.text.length,
      totalDifferences: differences.length,
      differences: differences.slice(0, 100),
      identical: differences.length === 0,
    };
  }

  if (mode === 'pages') {
    const bytes1 = fsSync.readFileSync(file1Path);
    const bytes2 = fsSync.readFileSync(file2Path);
    const pdf1 = await PDFDocument.load(bytes1, { ignoreEncryption: true });
    const pdf2 = await PDFDocument.load(bytes2, { ignoreEncryption: true });

    const pages1 = pdf1.getPageCount();
    const pages2 = pdf2.getPageCount();

    return {
      mode: 'pages',
      pageCount1: pages1,
      pageCount2: pages2,
      pageDifference: pages1 - pages2,
      identical: pages1 === pages2,
      totalDifferences: Math.abs(pages1 - pages2),
    };
  }

  throw new Error('Unknown comparison mode. Use "text" or "pages".');
};

module.exports = { comparePDFs };
