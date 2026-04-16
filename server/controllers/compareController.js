const fs = require('fs');
const { comparePDFs } = require('../services/compareService');
const FileRecord = require('../models/FileRecord');

const compare = async (req, res) => {
  const startTime = Date.now();
  const files = req.files || [];
  let record;

  try {
    if (files.length !== 2) return res.status(400).json({ success: false, message: 'Please upload exactly 2 PDF files to compare.' });

    const { mode = 'text' } = req.body;

    record = await FileRecord.create({
      userId: req.user?._id || null,
      tool: 'compare',
      status: 'processing',
      inputFiles: files.map((f) => ({ originalName: f.originalname, size: f.size, mimetype: f.mimetype })),
    });

    const result = await comparePDFs(files[0].path, files[1].path, { mode });

    await FileRecord.findByIdAndUpdate(record._id, {
      status: 'completed',
      processingTimeMs: Date.now() - startTime,
      metadata: { mode, totalDifferences: result.totalDifferences, identical: result.identical },
    });

    files.forEach((f) => {
      try { fs.unlinkSync(f.path); } catch (e) {}
    });

    res.json({
      success: true,
      message: result.identical ? 'PDFs are identical.' : `Found ${result.totalDifferences} difference(s).`,
      ...result,
    });
  } catch (error) {
    console.error('Compare error:', error);
    if (record) await FileRecord.findByIdAndUpdate(record._id, { status: 'failed', errorMessage: error.message });
    files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (e) {} });
    res.status(500).json({ success: false, message: error.message || 'Failed to compare PDFs.' });
  }
};

module.exports = { compare };
