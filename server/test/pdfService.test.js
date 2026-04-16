const { describe, it, before, after } = require('mocha');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const {
  mergePDFs,
  splitPDF,
  compressPDF,
  rotatePDF,
  addWatermark,
  imageToPDF,
  pdfToWord,
  performOCR,
} = require('../services/pdfService');

// ─── Test Fixtures ────────────────────────────────────────────────────────────
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const TEST_OUTPUT_DIR = path.join(__dirname, 'test-outputs');

before(() => {
  if (!fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  }
});

after(() => {
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.readdirSync(TEST_OUTPUT_DIR).forEach((file) => {
      fs.unlinkSync(path.join(TEST_OUTPUT_DIR, file));
    });
    fs.rmdirSync(TEST_OUTPUT_DIR);
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const createMinimalPDF = (numPages = 1) => {
  const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
  return (async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.addPage([612, 792]);
      page.drawText(`Page ${i + 1}`, { x: 50, y: 700, size: 20, font, color: rgb(0, 0, 0) });
    }
    const buffer = Buffer.from(await pdfDoc.save());
    const filePath = path.join(TEST_OUTPUT_DIR, `test_${uuidv4()}.pdf`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  })();
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('pdfService', () => {
  describe('mergePDFs', () => {
    it('should merge two PDFs into one', async () => {
      const file1 = await createMinimalPDF(2);
      const file2 = await createMinimalPDF(3);
      const result = await mergePDFs([file1, file2]);
      assert.ok(Buffer.isBuffer(result));
      assert.ok(result.length > 0);

      const { PDFDocument } = require('pdf-lib');
      const merged = await PDFDocument.load(result);
      assert.strictEqual(merged.getPageCount(), 5);

      fs.unlinkSync(file1);
      fs.unlinkSync(file2);
    });

    it('should throw error with less than 2 files', async () => {
      await assert.rejects(mergePDFs([await createMinimalPDF()]), /At least 2/);
    });
  });

  describe('splitPDF', () => {
    it('should split each page individually by default', async () => {
      const file = await createMinimalPDF(3);
      const results = await splitPDF(file, 'all');
      assert.strictEqual(results.length, 3);
      results.forEach((buf) => assert.ok(Buffer.isBuffer(buf)));
      fs.unlinkSync(file);
    });

    it('should split every N pages', async () => {
      const file = await createMinimalPDF(6);
      const results = await splitPDF(file, 'every', 2);
      assert.strictEqual(results.length, 3);
      fs.unlinkSync(file);
    });

    it('should split by custom ranges', async () => {
      const file = await createMinimalPDF(5);
      const results = await splitPDF(file, 'range', [{ start: 1, end: 2 }, { start: 3, end: 5 }]);
      assert.strictEqual(results.length, 2);
      fs.unlinkSync(file);
    });
  });

  describe('compressPDF', () => {
    it('should return a valid PDF buffer', async () => {
      const file = await createMinimalPDF(2);
      const result = await compressPDF(file);
      assert.ok(Buffer.isBuffer(result));
      assert.ok(result.length > 0);

      const { PDFDocument } = require('pdf-lib');
      const pdf = await PDFDocument.load(result);
      assert.strictEqual(pdf.getPageCount(), 2);
      fs.unlinkSync(file);
    });
  });

  describe('rotatePDF', () => {
    it('should rotate all pages by default', async () => {
      const file = await createMinimalPDF(2);
      const result = await rotatePDF(file, 90);
      assert.ok(Buffer.isBuffer(result));

      const { PDFDocument } = require('pdf-lib');
      const pdf = await PDFDocument.load(result);
      const pages = pdf.getPages();
      pages.forEach((page) => {
        assert.strictEqual(page.getRotation().angle, 90);
      });
      fs.unlinkSync(file);
    });

    it('should rotate only specified pages', async () => {
      const file = await createMinimalPDF(3);
      const result = await rotatePDF(file, 180, [1, 3]);
      assert.ok(Buffer.isBuffer(result));

      const { PDFDocument } = require('pdf-lib');
      const pdf = await PDFDocument.load(result);
      const pages = pdf.getPages();
      assert.strictEqual(pages[0].getRotation().angle, 180);
      assert.strictEqual(pages[1].getRotation().angle, 0);
      assert.strictEqual(pages[2].getRotation().angle, 180);
      fs.unlinkSync(file);
    });
  });

  describe('addWatermark', () => {
    it('should add watermark text to all pages', async () => {
      const file = await createMinimalPDF(2);
      const result = await addWatermark(file, 'TEST', {
        fontSize: 40,
        opacity: 0.5,
        colorHex: '#ff0000',
        rotation: 0,
        position: 'center',
      });
      assert.ok(Buffer.isBuffer(result));
      assert.ok(result.length > 0);
      fs.unlinkSync(file);
    });
  });

  describe('imageToPDF', () => {
    it('should convert a JPEG image to PDF', async () => {
      const sharp = require('sharp');
      const imgPath = path.join(TEST_OUTPUT_DIR, `test_${uuidv4()}.jpg`);
      await sharp({
        create: { width: 200, height: 300, channels: 3, background: { r: 255, g: 0, b: 0 } },
      })
        .jpeg()
        .toFile(imgPath);

      const result = await imageToPDF([imgPath]);
      assert.ok(Buffer.isBuffer(result));

      const { PDFDocument } = require('pdf-lib');
      const pdf = await PDFDocument.load(result);
      assert.strictEqual(pdf.getPageCount(), 1);
      fs.unlinkSync(imgPath);
    });
  });

  describe('pdfToWord', () => {
    it('should extract text and create a DOCX buffer', async () => {
      const file = await createMinimalPDF(1);
      const result = await pdfToWord(file);
      assert.ok(Buffer.isBuffer(result));
      assert.ok(result.length > 0);
      fs.unlinkSync(file);
    });
  });

  describe('performOCR', () => {
    it('should extract text from a PDF with text content', async () => {
      const file = await createMinimalPDF(1);
      const result = await performOCR(file);
      assert.ok(typeof result === 'string');
      assert.ok(result.length > 0);
      fs.unlinkSync(file);
    });
  });
});
