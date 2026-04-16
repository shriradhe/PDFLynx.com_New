/**
 * PDF Controller — Refactored with handler factory pattern.
 * 
 * Each tool is defined as a simple config object, and the `createToolHandler()`
 * factory wraps it in the common try/catch/record/cleanup boilerplate.
 * Reduces ~1040 lines to ~350 lines.
 */

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');
const pdfService = require('../services/pdfService');
const FileRecord = require('../models/FileRecord');
const User = require('../models/User');
const logger = require('../utils/logger');
const { deleteFiles, getOutputPath, buildDownloadUrl, formatBytes } = require('../utils/fileHelper');
const { sanitizePDFEdit, sanitizeWatermark, sanitizeSignature } = require('../utils/sanitizer');
const { ValidationError } = require('../middleware/errorHandler');

const safeJsonParse = (str, fallback = null) => {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

const requireJson = (str, fieldName) => {
  const parsed = safeJsonParse(str);
  if (parsed === null) {
    throw new ValidationError(`Invalid ${fieldName} format. Expected JSON.`);
  }
  return parsed;
};

// ──────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ──────────────────────────────────────────────────────────────────────────────

const createRecord = async (userId, tool, inputFiles) => {
  return FileRecord.create({
    userId: userId || null,
    tool,
    status: 'processing',
    inputFiles: inputFiles.map((f) => ({
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    })),
  });
};

const saveOutput = (buffer, filename, req) => {
  const outputPath = getOutputPath(filename);
  fs.writeFileSync(outputPath, buffer);
  const stat = fs.statSync(outputPath);
  return {
    filename,
    path: outputPath,
    size: stat.size,
    downloadUrl: buildDownloadUrl(req, filename),
  };
};

const saveOutputsAsZip = (buffers, baseFilename, ext, req) => {
  return new Promise((resolve, reject) => {
    const zipFilename = `${baseFilename}.zip`;
    const zipPath = getOutputPath(zipFilename);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const stat = fs.statSync(zipPath);
      resolve({
        filename: zipFilename,
        path: zipPath,
        size: stat.size,
        downloadUrl: buildDownloadUrl(req, zipFilename),
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

// ──────────────────────────────────────────────────────────────────────────────
// HANDLER FACTORY — eliminates boilerplate duplication
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Creates a standardized PDF tool handler.
 * @param {Object} config
 * @param {string} config.tool - Tool name for records
 * @param {string} config.fileMode - 'single' | 'multiple' | 'none'
 * @param {Function} config.validate - (req) => void, throw on invalid
 * @param {Function} config.process - (files, req) => { buffer|buffers, meta }
 * @param {Function} config.formatResponse - (outputMeta, extra) => response obj
 */
const createToolHandler = (config) => {
  return async (req, res) => {
    const startTime = Date.now();
    const file = req.file;
    const files = req.files || (file ? [file] : []);
    let record;

    try {
      // Validate
      if (config.fileMode === 'single' && !file) {
        return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
      }
      if (config.fileMode === 'multiple' && files.length === 0) {
        return res.status(400).json({ success: false, message: 'Please upload file(s).' });
      }

      if (config.validate) {
        config.validate(req);
      }

      // Create record
      record = await createRecord(req.user?._id, config.tool, files);

      // Process
      const result = await config.process(file, files, req);

      // Save output
      let outputMeta;
      if (result.buffers && Array.isArray(result.buffers)) {
        if (result.buffers.length === 1 && result.singleFilename) {
          outputMeta = saveOutput(result.buffers[0], result.singleFilename, req);
        } else {
          outputMeta = await saveOutputsAsZip(
            result.buffers,
            result.zipBasename || `${config.tool}_${uuidv4()}`,
            result.ext || '.pdf',
            req
          );
        }
      } else {
        const filename = result.filename || `${config.tool}_${uuidv4()}.pdf`;
        outputMeta = saveOutput(result.buffer, filename, req);
      }

      // Update record
      const updateData = {
        status: 'completed',
        outputFiles: [outputMeta],
        processingTimeMs: Date.now() - startTime,
      };
      if (result.metadata) updateData.metadata = result.metadata;
      await FileRecord.findByIdAndUpdate(record._id, updateData);

      // Track user stats
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { filesProcessed: 1 } });
      }

      // Build response
      const response = {
        success: true,
        message: result.message || `${config.tool} completed successfully.`,
        downloadUrl: outputMeta.downloadUrl,
        filename: outputMeta.filename,
        size: formatBytes(outputMeta.size),
        ...(result.extra || {}),
      };

      res.json(response);
    } catch (error) {
      logger.error(`${config.tool} error:`, error);
      if (record) {
        await FileRecord.findByIdAndUpdate(record._id, {
          status: 'failed',
          errorMessage: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || `Failed to process ${config.tool}.`,
      });
    } finally {
      // Cleanup uploaded files
      const filesToClean = config.fileMode === 'multiple'
        ? files.map(f => f.path)
        : (file ? [file.path] : []);
      if (filesToClean.length > 0) {
        deleteFiles(filesToClean);
      }
    }
  };
};

// ──────────────────────────────────────────────────────────────────────────────
// TOOL HANDLERS  
// ──────────────────────────────────────────────────────────────────────────────

const merge = createToolHandler({
  tool: 'merge',
  fileMode: 'multiple',
  validate: (req) => {
    if ((req.files || []).length < 2) {
      throw new ValidationError('Please upload at least 2 PDF files to merge.');
    }
  },
  process: async (file, files) => ({
    buffer: await pdfService.mergePDFs(files.map(f => f.path)),
    filename: `merged_${uuidv4()}.pdf`,
    message: 'PDFs merged successfully.',
  }),
});

const split = createToolHandler({
  tool: 'split',
  fileMode: 'single',
  process: async (file, files, req) => {
    const { splitMode = 'all', ranges, every } = req.body;
    let parsedValue = null;
    if (splitMode === 'range' && ranges) {
      try {
        parsedValue = typeof ranges === 'string' ? JSON.parse(ranges) : ranges;
        if (!Array.isArray(parsedValue)) {
          throw new ValidationError('Ranges must be an array.');
        }
      } catch (e) {
        throw new ValidationError('Invalid ranges format. Expected JSON array.');
      }
    } else if (splitMode === 'every' && every) {
      const everyNum = parseInt(every);
      if (isNaN(everyNum) || everyNum < 1) {
        throw new ValidationError('Every value must be a positive number.');
      }
      parsedValue = everyNum;
    }

    const buffers = await pdfService.splitPDF(file.path, splitMode, parsedValue);
    const baseId = uuidv4();

    if (buffers.length === 1) {
      return {
        buffer: buffers[0],
        filename: `split_${baseId}.pdf`,
        message: 'PDF split into 1 file.',
      };
    }
    return {
      buffers,
      zipBasename: `split_${baseId}`,
      ext: '.pdf',
      message: `PDF split into ${buffers.length} file(s).`,
      extra: { pages: buffers.length },
    };
  },
});

const compress = createToolHandler({
  tool: 'compress',
  fileMode: 'single',
  process: async (file) => {
    const compressedBuffer = await pdfService.compressPDF(file.path);
    const originalSize = file.size;
    const newSize = compressedBuffer.length;
    const reduction = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

    return {
      buffer: compressedBuffer,
      filename: `compressed_${uuidv4()}.pdf`,
      message: `PDF compressed. Size reduced by ${reduction}%.`,
      metadata: { originalSize, newSize, reductionPercent: reduction },
      extra: {
        originalSize: formatBytes(originalSize),
        newSize: formatBytes(newSize),
        reduction: `${reduction}%`,
      },
    };
  },
});

const rotate = createToolHandler({
  tool: 'rotate',
  fileMode: 'single',
  process: async (file, files, req) => {
    const rotation = parseInt(req.body.rotation) || 90;
    const pageNumbers = safeJsonParse(req.body.pages, null);
    return {
      buffer: await pdfService.rotatePDF(file.path, rotation, pageNumbers),
      filename: `rotated_${uuidv4()}.pdf`,
      message: `PDF rotated ${rotation}° successfully.`,
    };
  },
});

const watermark = createToolHandler({
  tool: 'watermark',
  fileMode: 'single',
  process: async (file, files, req) => {
    const options = sanitizeWatermark({
      text: req.body.text,
      fontSize: req.body.fontSize,
      opacity: req.body.opacity,
      colorHex: req.body.colorHex,
      rotation: req.body.rotation,
      position: req.body.position,
    });
    return {
      buffer: await pdfService.addWatermark(file.path, options.text, options),
      filename: `watermarked_${uuidv4()}.pdf`,
      message: 'Watermark added successfully.',
    };
  },
});

const protect = createToolHandler({
  tool: 'protect',
  fileMode: 'single',
  validate: (req) => {
    if (!req.body.userPassword) {
      throw new ValidationError('A user password is required.');
    }
  },
  process: async (file, files, req) => ({
    buffer: await pdfService.protectPDF(
      file.path,
      req.body.userPassword,
      req.body.ownerPassword || req.body.userPassword
    ),
    filename: `protected_${uuidv4()}.pdf`,
    message: 'PDF protected successfully.',
  }),
});

const unlock = createToolHandler({
  tool: 'unlock',
  fileMode: 'single',
  process: async (file, files, req) => ({
    buffer: await pdfService.unlockPDF(file.path, req.body.password || ''),
    filename: `unlocked_${uuidv4()}.pdf`,
    message: 'PDF unlocked successfully.',
  }),
});

const pageNumbers = createToolHandler({
  tool: 'page-numbers',
  fileMode: 'single',
  process: async (file, files, req) => {
    const { startNumber = 1, position = 'bottom-center', fontSize = 12, format = 'numeric', margin = 30 } = req.body;
    return {
      buffer: await pdfService.addPageNumbers(file.path, {
        startNumber: parseInt(startNumber),
        position,
        fontSize: parseInt(fontSize),
        format,
        margin: parseInt(margin),
      }),
      filename: `numbered_${uuidv4()}.pdf`,
      message: 'Page numbers added successfully.',
    };
  },
});

const convert = createToolHandler({
  tool: 'convert',
  fileMode: 'multiple',
  validate: (req) => {
    if (!req.body.type) throw new ValidationError('Conversion type is required.');
  },
  process: async (file, files, req) => {
    const { type } = req.body;
    const baseId = uuidv4();

    if (type === 'jpg-to-pdf') {
      return {
        buffer: await pdfService.imageToPDF(files.map(f => f.path)),
        filename: `converted_${baseId}.pdf`,
        message: 'Conversion completed successfully.',
      };
    } else if (type === 'pdf-to-word') {
      return {
        buffer: await pdfService.pdfToWord(files[0].path),
        filename: `converted_${baseId}.docx`,
        message: 'Conversion completed successfully.',
      };
    } else if (type === 'pdf-to-jpg') {
      const images = await pdfService.pdfToImages(files[0].path, 2.0);
      if (images.length === 1) {
        return {
          buffer: images[0],
          filename: `page_1_${baseId}.jpg`,
          message: 'Conversion completed successfully.',
        };
      }
      return {
        buffers: images,
        zipBasename: `pages_${baseId}`,
        ext: '.jpg',
        message: 'Conversion completed successfully.',
      };
    }
    throw new ValidationError(`Unknown conversion type: ${type}`);
  },
});

const ocr = createToolHandler({
  tool: 'ocr',
  fileMode: 'single',
  process: async (file) => {
    const text = await pdfService.performOCR(file.path);
    return {
      buffer: Buffer.from(text, 'utf8'),
      filename: `ocr_${uuidv4()}.txt`,
      message: 'OCR completed successfully.',
      extra: {
        text: text.substring(0, 5000),
        charCount: text.length,
      },
    };
  },
});

const sign = createToolHandler({
  tool: 'sign',
  fileMode: 'single',
  validate: (req) => {
    if (!req.body.signatureText) throw new ValidationError('Signature text is required.');
  },
  process: async (file, files, req) => {
    const signOptions = sanitizeSignature({
      signatureText: req.body.signatureText,
      pageNumber: req.body.pageNumber,
      x: req.body.x,
      y: req.body.y,
      fontSize: req.body.fontSize,
    });
    return {
      buffer: await pdfService.signPDF(file.path, signOptions),
      filename: `signed_${uuidv4()}.pdf`,
      message: 'PDF signed successfully.',
    };
  },
});

const edit = createToolHandler({
  tool: 'edit',
  fileMode: 'single',
  validate: (req) => {
    if (!req.body.edits) throw new ValidationError('Edits configuration is required.');
  },
  process: async (file, files, req) => {
    const parsedEdits = requireJson(req.body.edits, 'edits');
    const sanitizedEdits = sanitizePDFEdit(parsedEdits);
    return {
      buffer: await pdfService.editPDF(file.path, sanitizedEdits),
      filename: `edited_${uuidv4()}.pdf`,
      message: 'PDF edited successfully.',
    };
  },
});

const pdfToText = createToolHandler({
  tool: 'pdf-to-text',
  fileMode: 'single',
  process: async (file) => ({
    buffer: await pdfService.pdfToText(file.path),
    filename: `text_${uuidv4()}.txt`,
    message: 'Text extracted successfully.',
  }),
});

const pdfToPng = createToolHandler({
  tool: 'pdf-to-png',
  fileMode: 'single',
  process: async (file, files, req) => {
    const scale = parseFloat(req.body.scale) || 2.0;
    const images = await pdfService.pdfToPng(file.path, scale);
    const baseId = uuidv4();

    if (images.length === 1) {
      return {
        buffer: images[0],
        filename: `page_1_${baseId}.png`,
        message: 'PDF converted to 1 PNG image.',
      };
    }
    return {
      buffers: images,
      zipBasename: `pages_${baseId}`,
      ext: '.png',
      message: `PDF converted to ${images.length} PNG image(s).`,
    };
  },
});

const organize = createToolHandler({
  tool: 'organize',
  fileMode: 'single',
  validate: (req) => {
    if (!req.body.pageOrder) throw new ValidationError('Page order is required.');
  },
  process: async (file, files, req) => {
    const parsedOrder = requireJson(req.body.pageOrder, 'pageOrder');
    return {
      buffer: await pdfService.organizePDF(file.path, parsedOrder),
      filename: `organized_${uuidv4()}.pdf`,
      message: 'Pages organized successfully.',
    };
  },
});

const redact = createToolHandler({
  tool: 'redact',
  fileMode: 'single',
  validate: (req) => {
    if (!req.body.regions) throw new ValidationError('Redaction regions are required.');
  },
  process: async (file, files, req) => {
    const parsedRegions = requireJson(req.body.regions, 'regions');
    return {
      buffer: await pdfService.redactPDF(file.path, parsedRegions),
      filename: `redacted_${uuidv4()}.pdf`,
      message: 'Content redacted successfully.',
    };
  },
});

const htmlToPdf = createToolHandler({
  tool: 'html-to-pdf',
  fileMode: 'none',
  validate: (req) => {
    if (!req.body.html) throw new ValidationError('HTML content is required.');
    if (typeof req.body.html !== 'string') throw new ValidationError('HTML must be a string.');
    if (req.body.html.length > 500000) throw new ValidationError('HTML content too large. Maximum 500KB.');
  },
  process: async (file, files, req) => ({
    buffer: await pdfService.htmlToPDF(req.body.html, req.body.options || {}),
    filename: `html_${uuidv4()}.pdf`,
    message: 'HTML converted to PDF successfully.',
  }),
});

const mergeImages = createToolHandler({
  tool: 'image-to-pdf',
  fileMode: 'multiple',
  process: async (file, files, req) => {
    const { pageSize, margin } = req.body;
    return {
      buffer: await pdfService.mergeImagesToPDF(files.map(f => f.path), {
        pageSize: pageSize || 'a4',
        margin: parseInt(margin) || 20,
      }),
      filename: `images_${uuidv4()}.pdf`,
      message: `${files.length} image(s) merged into PDF.`,
    };
  },
});

const annotate = createToolHandler({
  tool: 'annotate',
  fileMode: 'single',
  validate: (req) => {
    if (!req.body.annotations) throw new ValidationError('Annotations configuration is required.');
  },
  process: async (file, files, req) => {
    const parsed = requireJson(req.body.annotations, 'annotations');
    return {
      buffer: await pdfService.annotatePDF(file.path, parsed),
      filename: `annotated_${uuidv4()}.pdf`,
      message: 'PDF annotated successfully.',
    };
  },
});

const fillForm = createToolHandler({
  tool: 'fill-form',
  fileMode: 'single',
  validate: (req) => {
    if (!req.body.fields) throw new ValidationError('Fields data is required.');
  },
  process: async (file, files, req) => {
    const parsed = requireJson(req.body.fields, 'fields');
    return {
      buffer: await pdfService.fillPDFForm(file.path, parsed),
      filename: `filled_${uuidv4()}.pdf`,
      message: 'PDF form filled successfully.',
    };
  },
});

// ──────────────────────────────────────────────────────────────────────────────
// HISTORY (not a tool — standalone handler)
// ──────────────────────────────────────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      FileRecord.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FileRecord.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      success: true,
      records,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('History error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history.' });
  }
};

module.exports = {
  merge, split, compress, rotate, watermark, protect, unlock,
  pageNumbers, convert, ocr, getHistory, sign, edit,
  pdfToText, pdfToPng, organize, redact, htmlToPdf,
  mergeImages, annotate, fillForm,
};
