/**
 * Chat with PDF Service (RAG)
 * 
 * Pipeline: PDF text → chunk → embed → vector store → semantic search → LLM answer
 * Uses in-memory vector store (no external dependency for MVP).
 */
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { getAIProvider } = require('./aiProvider');
const logger = require('../../utils/logger');

// In-memory document store (per session)
const documentStore = new Map();

/**
 * Chunk text into overlapping segments.
 */
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({
      text: text.substring(start, end),
      startIndex: start,
      endIndex: end,
    });
    start += chunkSize - overlap;
  }
  return chunks;
};

/**
 * Cosine similarity between two vectors.
 */
const cosineSimilarity = (a, b) => {
  if (a.length !== b.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Index a PDF document for chat.
 * @param {string} sessionId - Chat session ID
 * @param {string} filePath - Path to PDF
 * @returns {Object} { sessionId, pageCount, chunkCount }
 */
const indexDocument = async (sessionId, filePath) => {
  const dataBuffer = await fs.readFile(filePath);
  const pdfData = await pdfParse(dataBuffer);
  let text = pdfData.text || '';

  // OCR fallback for scanned PDFs
  if (!text.trim()) {
    try {
      logger.info('Chat: No text found, attempting OCR extraction...');
      const { extractTextWithOCR } = require('./summaryService.js');
      text = await extractTextWithOCR(dataBuffer);
      logger.info(`Chat OCR: Extracted ${text.length} chars`);
    } catch (ocrErr) {
      logger.error('Chat OCR failed:', ocrErr.message);
    }
  }

  if (!text.trim()) {
    throw new Error('No text content found in the PDF. The document may be image-only or corrupted.');
  }

  const chunks = chunkText(text);
  const ai = getAIProvider();

  // Embed each chunk
  const embeddedChunks = [];
  for (const chunk of chunks) {
    try {
      const embedding = await ai.embed(chunk.text);
      embeddedChunks.push({
        ...chunk,
        embedding,
      });
    } catch (err) {
      logger.warn('Failed to embed chunk:', err.message);
      embeddedChunks.push({ ...chunk, embedding: [] });
    }
  }

  // Store in memory
  documentStore.set(sessionId, {
    chunks: embeddedChunks,
    fullText: text,
    pageCount: pdfData.numpages,
    createdAt: Date.now(),
    history: [],
  });

  // Auto-cleanup after 1 hour
  setTimeout(() => {
    documentStore.delete(sessionId);
  }, 60 * 60 * 1000);

  return {
    sessionId,
    pageCount: pdfData.numpages,
    chunkCount: embeddedChunks.length,
    wordCount: text.split(/\s+/).length,
  };
};

/**
 * Chat with an indexed document.
 * @param {string} sessionId - Chat session ID
 * @param {string} question - User's question
 * @returns {Object} { answer, relevantChunks, usage }
 */
const chatWithDocument = async (sessionId, question) => {
  const doc = documentStore.get(sessionId);
  if (!doc) {
    throw new Error('Session not found or expired. Please re-upload the PDF.');
  }

  const ai = getAIProvider();

  // Embed the question
  const questionEmbedding = await ai.embed(question);

  // Find most relevant chunks via cosine similarity
  const scored = doc.chunks
    .filter(c => c.embedding.length > 0)
    .map(chunk => ({
      ...chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const context = scored.map(c => c.text).join('\n\n---\n\n');

  // Build conversation with history
  const messages = [
    {
      role: 'system',
      content: `You are a helpful assistant answering questions about a PDF document. 
Use ONLY the provided context to answer. If the answer is not in the context, say so clearly.
Format your answers with markdown for readability. Be precise and cite relevant details.`,
    },
  ];

  // Add conversation history (last 6 messages)
  const history = doc.history.slice(-6);
  messages.push(...history);

  messages.push({
    role: 'user',
    content: `Context from the document:\n\n${context}\n\n---\n\nQuestion: ${question}`,
  });

  const result = await ai.chat(messages, {
    temperature: 0.3,
    maxTokens: 1500,
  });

  // Update history
  doc.history.push(
    { role: 'user', content: question },
    { role: 'assistant', content: result.content }
  );

  return {
    answer: result.content,
    relevantChunks: scored.map(c => ({
      text: c.text.substring(0, 200) + '...',
      score: Math.round(c.score * 100) / 100,
    })),
    usage: result.usage,
    model: result.model,
  };
};

/**
 * Check if a session exists.
 */
const hasSession = (sessionId) => documentStore.has(sessionId);

/**
 * Get session info.
 */
const getSessionInfo = (sessionId) => {
  const doc = documentStore.get(sessionId);
  if (!doc) return null;
  return {
    sessionId,
    pageCount: doc.pageCount,
    chunkCount: doc.chunks.length,
    messageCount: doc.history.length,
    createdAt: doc.createdAt,
  };
};

module.exports = { indexDocument, chatWithDocument, hasSession, getSessionInfo };
