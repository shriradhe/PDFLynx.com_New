/**
 * AI Provider Adapter
 * 
 * Provider-agnostic AI interface supporting OpenAI, with fallback chain.
 * Token usage tracking included.
 */
const logger = require('../../utils/logger');

class AIProvider {
  constructor() {
    this.provider = null;
    this.client = null;
    this._init();
  }

  _init() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const OpenAI = require('openai');
        this.client = new OpenAI({ apiKey });
        this.provider = 'openai';
        logger.info('AI Provider initialized: OpenAI');
      } catch (err) {
        logger.warn('OpenAI package not available:', err.message);
      }
    }

    if (!this.provider) {
      logger.warn('No AI provider configured. AI features will return mock responses. Set OPENAI_API_KEY in .env');
      this.provider = 'mock';
    }
  }

  /**
   * Generate a chat completion.
   * @param {Array} messages - [{role, content}]
   * @param {Object} options - { model, temperature, maxTokens }
   * @returns {Object} { content, usage }
   */
  async chat(messages, options = {}) {
    const model = options.model || process.env.AI_MODEL || 'gpt-4o-mini';
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 2000;

    if (this.provider === 'openai') {
      try {
        const response = await this.client.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        });

        return {
          content: response.choices[0]?.message?.content || '',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
          model: response.model,
        };
      } catch (err) {
        logger.error('OpenAI API error:', err.message);
        throw new Error(`AI processing failed: ${err.message}`);
      }
    }

    // Mock provider for development
    return {
      content: this._getMockResponse(messages),
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: 'mock',
    };
  }

  /**
   * Generate embeddings for text.
   * @param {string} text
   * @returns {Array<number>} embedding vector
   */
  async embed(text) {
    if (this.provider === 'openai') {
      try {
        const response = await this.client.embeddings.create({
          model: process.env.AI_EMBEDDING_MODEL || 'text-embedding-3-small',
          input: text,
        });
        return response.data[0]?.embedding || [];
      } catch (err) {
        logger.error('Embedding error:', err.message);
        throw new Error(`Embedding failed: ${err.message}`);
      }
    }

    // Mock: return random 384-dim vector
    return Array.from({ length: 384 }, () => Math.random() * 2 - 1);
  }

  _getMockResponse(messages) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    if (lastMsg.toLowerCase().includes('summarize') || lastMsg.toLowerCase().includes('summary')) {
      return '## Summary\n\nThis document covers several key topics. The main points are:\n\n1. **Introduction** — The document presents an overview of the subject matter.\n2. **Key Findings** — Important data and analysis results are discussed.\n3. **Conclusions** — Final recommendations and next steps are outlined.\n\n*Note: This is a demo summary. Configure OPENAI_API_KEY for real AI-powered summaries.*';
    }
    return 'This is a demo response. To enable real AI features, set your OPENAI_API_KEY in the .env file. The AI features support PDF summarization, chat-with-PDF (RAG), and smart keyword search.';
  }

  isConfigured() {
    return this.provider !== 'mock';
  }

  getProvider() {
    return this.provider;
  }
}

// Singleton
let instance;
const getAIProvider = () => {
  if (!instance) {
    instance = new AIProvider();
  }
  return instance;
};

module.exports = { getAIProvider, AIProvider };
