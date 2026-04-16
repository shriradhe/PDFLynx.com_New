const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const pdfService = require('../services/pdfService');
const FileRecord = require('../models/FileRecord');
const User = require('../models/User');
const { deleteFiles, getOutputPath, buildDownloadUrl, formatBytes } = require('../utils/fileHelper');

const batchProcess = async (req, res) => {
  const startTime = Date.now();
  const files = req.files || [];
  let record;

  try {
    const { tool, options = {} } = req.body;

    if (!tool) return res.status(400).json({ success: false, message: 'Tool parameter is required.' });
    if (files.length === 0) return res.status(400).json({ success: false, message: 'Please upload files.' });

    const supportedBatchTools = ['compress', 'rotate', 'watermark', 'protect', 'unlock', 'page-numbers', 'ocr', 'sign', 'pdf-to-text', 'pdf-to-png', 'pdf-to-jpg'];
    if (!supportedBatchTools.includes(tool)) {
      return res.status(400).json({ success: false, message: `Batch processing not supported for: ${tool}` });
    }

    record = await FileRecord.create({
      userId: req.user?._id || null,
      tool: `batch-${tool}`,
      status: 'processing',
      inputFiles: files.map((f) => ({ originalName: f.originalname, size: f.size, mimetype: f.mimetype })),
    });

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        let result;
        switch (tool) {
          case 'compress':
            result = await pdfService.compressPDF(file.path);
            break;
          case 'rotate':
            result = await pdfService.rotatePDF(file.path, parseInt(options.rotation) || 90, options.pageNumbers ? JSON.parse(options.pageNumbers) : null);
            break;
          case 'watermark':
            result = await pdfService.addWatermark(file.path, options.text || 'CONFIDENTIAL', options);
            break;
          case 'protect':
            result = await pdfService.protectPDF(file.path, options.userPassword, options.ownerPassword || options.userPassword);
            break;
          case 'unlock':
            result = await pdfService.unlockPDF(file.path, options.password || '');
            break;
          case 'page-numbers':
            result = await pdfService.addPageNumbers(file.path, options);
            break;
          case 'ocr':
            result = await pdfService.performOCR(file.path);
            break;
          case 'sign':
            result = await pdfService.signPDF(file.path, options);
            break;
          case 'pdf-to-text':
            result = await pdfService.pdfToText(file.path);
            break;
          case 'pdf-to-png':
            result = await pdfService.pdfToPng(file.path, parseFloat(options.scale) || 2.0);
            break;
          case 'pdf-to-jpg':
            result = await pdfService.pdfToImages(file.path, parseFloat(options.scale) || 2.0);
            break;
          default:
            throw new Error(`Unsupported batch tool: ${tool}`);
        }

        const buffers = Array.isArray(result) ? result : [result];
        const baseId = uuidv4();
        const ext = tool === 'pdf-to-png' ? '.png' : tool === 'pdf-to-text' ? '.txt' : tool === 'ocr' ? '.txt' : tool === 'pdf-to-jpg' ? '.jpg' : '.pdf';

        if (buffers.length === 1) {
          const filename = `${tool}_${baseId}${ext}`;
          const outputPath = getOutputPath(filename);
          fs.writeFileSync(outputPath, buffers[0]);
          const stat = fs.statSync(outputPath);
          results.push({
            originalName: file.originalname,
            filename,
            downloadUrl: buildDownloadUrl(req, filename),
            size: formatBytes(stat.size),
          });
        }

        deleteFiles([file.path]);
      } catch (err) {
        errors.push({ originalName: file.originalname, error: err.message });
        deleteFiles([file.path]);
      }
    }

    await FileRecord.findByIdAndUpdate(record._id, {
      status: errors.length === files.length ? 'failed' : 'completed',
      outputFiles: results.map((r) => ({ originalName: r.originalName, filename: r.filename, size: r.size })),
      processingTimeMs: Date.now() - startTime,
      metadata: { totalFiles: files.length, successCount: results.length, errorCount: errors.length },
    });

    if (req.user) await User.findByIdAndUpdate(req.user._id, { $inc: { filesProcessed: results.length } });

    res.json({
      success: true,
      message: `Batch ${tool} completed. ${results.length}/${files.length} files processed successfully.`,
      results,
      errors,
      totalProcessed: results.length,
      totalFailed: errors.length,
    });
  } catch (error) {
    console.error('Batch process error:', error);
    if (record) await FileRecord.findByIdAndUpdate(record._id, { status: 'failed', errorMessage: error.message });
    files.forEach((f) => deleteFiles([f.path]));
    res.status(500).json({ success: false, message: error.message || 'Batch processing failed.' });
  }
};

module.exports = { batchProcess };
