const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createSigningRequest, applySignature } = require('../services/signatureService');
const FileRecord = require('../models/FileRecord');
const { getOutputPath, buildDownloadUrl, formatBytes, deleteFiles } = require('../utils/fileHelper');

const createRequest = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });

    const { signers } = req.body;
    if (!signers) return res.status(400).json({ success: false, message: 'Signers information is required.' });

    const parsedSigners = typeof signers === 'string' ? JSON.parse(signers) : signers;
    const signingRequest = await createSigningRequest(file.path, parsedSigners);

    res.json({
      success: true,
      message: 'Signing request created successfully.',
      signingId: signingRequest.signingId,
      signers: signingRequest.signers.map(s => ({
        signerId: s.signerId,
        email: s.email,
        name: s.name,
        status: s.status,
        signatureToken: s.signatureToken,
      })),
    });

    deleteFiles([file.path]);
  } catch (error) {
    console.error('Create signing request error:', error);
    res.status(500).json({ success: false, message: 'Failed to create signing request.' });
  }
};

const signDocument = async (req, res) => {
  const startTime = Date.now();
  const file = req.file;
  let record;

  try {
    if (!file) return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });

    const { signerToken, signatureText, imageData, imageFormat, page, x, y, width, height } = req.body;
    if (!signerToken) return res.status(400).json({ success: false, message: 'Signer token is required.' });

    record = await FileRecord.create({
      userId: req.user?._id || null,
      tool: 'e-sign',
      status: 'processing',
      inputFiles: [{ originalName: file.originalname, size: file.size, mimetype: file.mimetype }],
    });

    const buffer = await applySignature(file.path, {
      signerToken,
      text: signatureText,
      imageData,
      imageFormat,
      page: parseInt(page) || 1,
      x: parseInt(x) || 50,
      y: parseInt(y) || 50,
      width: parseInt(width) || 200,
      height: parseInt(height) || 50,
    });

    const filename = `signed_${uuidv4()}.pdf`;
    const outputPath = getOutputPath(filename);
    fs.writeFileSync(outputPath, buffer);
    const stat = fs.statSync(outputPath);

    await FileRecord.findByIdAndUpdate(record._id, {
      status: 'completed',
      outputFiles: [{ filename, path: outputPath, size: stat.size, downloadUrl: buildDownloadUrl(req, filename) }],
      processingTimeMs: Date.now() - startTime,
    });

    res.json({
      success: true,
      message: 'Document signed successfully.',
      downloadUrl: buildDownloadUrl(req, filename),
      filename,
      size: formatBytes(stat.size),
    });
  } catch (error) {
    console.error('Sign document error:', error);
    if (record) await FileRecord.findByIdAndUpdate(record._id, { status: 'failed', errorMessage: error.message });
    res.status(500).json({ success: false, message: error.message || 'Failed to sign document.' });
  } finally {
    if (file) deleteFiles([file.path]);
  }
};

module.exports = { createRequest, signDocument };
