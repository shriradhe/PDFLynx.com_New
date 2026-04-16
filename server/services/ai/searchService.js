/**
 * Smart Search Service
 * Keyword + semantic search inside PDFs with page-level results.
 */
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { getAIProvider } = require('./aiProvider');
const logger = require('../../utils/logger');

/**
 * Search a PDF for keywords with context snippets.
 * @param {string} filePath - Path to PDF
 * @param {string} query - Search query
 * @param {Object} options - { mode: 'keyword'|'semantic'|'hybrid', maxResults: 20 }
 * @returns {Object} { results, totalMatches, query }
 */
const searchPDF = async (filePath, query, options = {}) => {
  const { mode = 'hybrid', maxResults = 20 } = options;

  const dataBuffer = await fs.readFile(filePath);
  const pdfData = await pdfParse(dataBuffer);
  const text = pdfData.text || '';

  if (!text.trim()) {
    throw new Error('No text content found in the PDF.');
  }

  let results = [];

  // Keyword search
  if (mode === 'keyword' || mode === 'hybrid') {
    const keywordResults = keywordSearch(text, query, pdfData.numpages);
    results.push(...keywordResults.map(r => ({ ...r, type: 'keyword' })));
  }

  // Semantic search
  if (mode === 'semantic' || mode === 'hybrid') {
    try {
      const semanticResults = await semanticSearch(text, query);
      results.push(...semanticResults.map(r => ({ ...r, type: 'semantic' })));
    } catch (err) {
      logger.warn('Semantic search failed, falling back to keyword only:', err.message);
    }
  }

  // Deduplicate and sort by relevance
  const seen = new Set();
  results = results.filter(r => {
    const key = r.context.substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  results = results.slice(0, maxResults);

  return {
    results,
    totalMatches: results.length,
    query,
    mode,
    pageCount: pdfData.numpages,
  };
};

/**
 * Basic keyword search with context extraction.
 */
const keywordSearch = (text, query, totalPages) => {
  const results = [];
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/).filter(w => w.length > 2);
  const lines = text.split('\n');

  // Estimate page boundaries
  const charsPerPage = Math.max(1, Math.ceil(text.length / totalPages));

  let charIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // Check if any query word appears
    const matchCount = words.filter(w => lineLower.includes(w)).length;
    if (matchCount > 0) {
      const pageNum = Math.min(totalPages, Math.floor(charIndex / charsPerPage) + 1);

      // Get context (3 lines around match)
      const start = Math.max(0, i - 1);
      const end = Math.min(lines.length, i + 2);
      const context = lines.slice(start, end).join('\n').trim();

      if (context.length > 10) {
        results.push({
          page: pageNum,
          context: context.substring(0, 300),
          relevance: matchCount / words.length,
          lineNumber: i + 1,
        });
      }
    }

    charIndex += line.length + 1;
  }

  return results;
};

/**
 * Semantic search using embeddings.
 */
const semanticSearch = async (text, query) => {
  const ai = getAIProvider();
  if (!ai.isConfigured()) return [];

  // Chunk the text
  const chunks = [];
  const chunkSize = 500;
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, Math.min(i + chunkSize, text.length)));
  }

  // Embed query
  const queryEmb = await ai.embed(query);

  // Embed and score chunks (limit to first 50 chunks to control costs)
  const results = [];
  const maxChunks = Math.min(chunks.length, 50);

  for (let i = 0; i < maxChunks; i++) {
    try {
      const chunkEmb = await ai.embed(chunks[i]);
      let dotProduct = 0, normA = 0, normB = 0;
      for (let j = 0; j < queryEmb.length; j++) {
        dotProduct += queryEmb[j] * chunkEmb[j];
        normA += queryEmb[j] * queryEmb[j];
        normB += chunkEmb[j] * chunkEmb[j];
      }
      const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

      if (similarity > 0.3) {
        results.push({
          page: Math.floor((i * chunkSize) / (text.length / 1)) + 1,
          context: chunks[i].trim().substring(0, 300),
          relevance: Math.round(similarity * 100) / 100,
        });
      }
    } catch {
      // Skip failed embeddings
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
};

module.exports = { searchPDF };
