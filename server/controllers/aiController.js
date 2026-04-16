/**
 * AI Controller — Summarize, Chat with PDF, Smart Search
 */
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { summarizePDF } = require('../services/ai/summaryService');
const { indexDocument, chatWithDocument, hasSession, getSessionInfo } = require('../services/ai/chatService');
const { searchPDF } = require('../services/ai/searchService');
const { getAIProvider } = require('../services/ai/aiProvider');
const FileRecord = require('../models/FileRecord');
const User = require('../models/User');
const logger = require('../utils/logger');
const { deleteFiles, getOutputPath, buildDownloadUrl, formatBytes } = require('../utils/fileHelper');

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/ai/summarize
// ──────────────────────────────────────────────────────────────────────────────
const summarize = async (req, res) => {
  const startTime = Date.now();
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const { type = 'detailed', language = 'en' } = req.body;

    const result = await summarizePDF(file.path, { type, language });

    // Save summary as text file
    const filename = `summary_${uuidv4()}.txt`;
    const outputPath = getOutputPath(filename);
    fs.writeFileSync(outputPath, result.summary);
    const stat = fs.statSync(outputPath);

    // Record for analytics
    if (req.user) {
      await FileRecord.create({
        userId: req.user._id,
        tool: 'ai-summarize',
        status: 'completed',
        inputFiles: [{ originalName: file.originalname, size: file.size, mimetype: file.mimetype }],
        outputFiles: [{ filename, path: outputPath, size: stat.size }],
        processingTimeMs: Date.now() - startTime,
        metadata: { summaryType: type, pageCount: result.pageCount },
      });
      await User.findByIdAndUpdate(req.user._id, { $inc: { filesProcessed: 1 } });
    }

    res.json({
      success: true,
      message: 'PDF summarized successfully.',
      summary: result.summary,
      pageCount: result.pageCount,
      wordCount: result.wordCount,
      summaryType: result.summaryType,
      truncated: result.truncated,
      model: result.model,
      downloadUrl: buildDownloadUrl(req, filename),
      aiConfigured: getAIProvider().isConfigured(),
    });
  } catch (error) {
    logger.error('AI Summarize error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to summarize PDF.' });
  } finally {
    if (file) deleteFiles([file.path]);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat/upload — Index a PDF for chat
// ──────────────────────────────────────────────────────────────────────────────
const chatUpload = async (req, res) => {
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const sessionId = uuidv4();
    const result = await indexDocument(sessionId, file.path);

    res.json({
      success: true,
      message: 'PDF indexed for chat. You can now ask questions.',
      sessionId: result.sessionId,
      pageCount: result.pageCount,
      chunkCount: result.chunkCount,
      wordCount: result.wordCount,
      aiConfigured: getAIProvider().isConfigured(),
    });
  } catch (error) {
    logger.error('AI Chat upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to index PDF.' });
  } finally {
    if (file) deleteFiles([file.path]);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat/ask — Ask a question about indexed PDF
// ──────────────────────────────────────────────────────────────────────────────
const chatAsk = async (req, res) => {
  const startTime = Date.now();

  try {
    const { sessionId, question } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required.' });
    }

    const result = await chatWithDocument(sessionId, question.trim());

    // Track usage
    if (req.user) {
      await FileRecord.create({
        userId: req.user._id,
        tool: 'ai-chat',
        status: 'completed',
        processingTimeMs: Date.now() - startTime,
        metadata: { question: question.substring(0, 200) },
      });
    }

    res.json({
      success: true,
      answer: result.answer,
      relevantChunks: result.relevantChunks,
      model: result.model,
      sessionInfo: getSessionInfo(sessionId),
    });
  } catch (error) {
    logger.error('AI Chat error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process question.' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/ai/search — Smart search inside PDF
// ──────────────────────────────────────────────────────────────────────────────
const search = async (req, res) => {
  const startTime = Date.now();
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const { query, mode = 'hybrid', maxResults = 20 } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    const result = await searchPDF(file.path, query.trim(), {
      mode,
      maxResults: parseInt(maxResults) || 20,
    });

    // Track usage
    if (req.user) {
      await FileRecord.create({
        userId: req.user._id,
        tool: 'ai-search',
        status: 'completed',
        inputFiles: [{ originalName: file.originalname, size: file.size, mimetype: file.mimetype }],
        processingTimeMs: Date.now() - startTime,
        metadata: { query: query.substring(0, 200), mode },
      });
      await User.findByIdAndUpdate(req.user._id, { $inc: { filesProcessed: 1 } });
    }

    res.json({
      success: true,
      message: `Found ${result.totalMatches} result(s).`,
      results: result.results,
      totalMatches: result.totalMatches,
      query: result.query,
      mode: result.mode,
      pageCount: result.pageCount,
      aiConfigured: getAIProvider().isConfigured(),
    });
  } catch (error) {
    logger.error('AI Search error:', error);
    res.status(500).json({ success: false, message: error.message || 'Search failed.' });
  } finally {
    if (file) deleteFiles([file.path]);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/ai/status — Check AI provider status
// ──────────────────────────────────────────────────────────────────────────────
const status = async (req, res) => {
  const ai = getAIProvider();
  res.json({
    success: true,
    provider: ai.getProvider(),
    configured: ai.isConfigured(),
    features: ['summarize', 'chat', 'search'],
  });
};

module.exports = { summarize, chatUpload, chatAsk, search, status };
