// * EMBEDDING DOMAIN MODULE - PROVIDER
// ? Communicates with Google Gemini API to generate text vectors.

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EMBEDDING_CONFIG } = require("./config");
const { TASK_TYPES } = require("./constants");
const { retryWithBackoff } = require("./retry");

let genAIInstance = null;

/**
 * Initializes and caches the Google Generative AI client.
 * @returns {GoogleGenerativeAI} Client instance
 */
function getGenAI() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable. Embedding generation aborted.");
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

/**
 * Core text embedding generator wrapped in transient failure retries.
 * @param {string} text - Input text block
 * @param {string} taskType - Google Gemini specific task type identifier
 * @param {object} options - Custom generation overrides
 * @returns {Promise<object>} Clean structured vector payload response
 */
async function embedText(text, taskType, options = {}) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Input text must be a valid non-empty string.");
  }

  const modelName = options.model || EMBEDDING_CONFIG.MODEL_NAME;
  const dimensions = options.dimensions || EMBEDDING_CONFIG.DIMENSIONS;

  const client = getGenAI();
  const model = client.getGenerativeModel({ model: modelName });

  const result = await retryWithBackoff(
    async () => {
      return await model.embedContent({
        content: {
          parts: [{ text }],
        },
        taskType,
        outputDimensionality: dimensions,
      });
    },
    EMBEDDING_CONFIG.MAX_RETRIES,
    EMBEDDING_CONFIG.RETRY_DELAY
  );

  if (!result || !result.embedding || !result.embedding.values || result.embedding.values.length === 0) {
    throw new Error(`Gemini Embedding API returned an empty or malformed payload.`);
  }

  const values = result.embedding.values;
  if (values.length !== dimensions) {
    throw new Error(`Embedding dimensions mismatch. Expected ${dimensions}, got ${values.length}`);
  }

  return {
    embedding: values,
    model: modelName,
    dimensions: dimensions,
    version: EMBEDDING_CONFIG.EMBEDDING_VERSION,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates a document embedding vector for a Gita verse or content block.
 * @param {string} text - Input document text
 * @param {object} options - Custom overrides
 * @returns {Promise<object>} Structured document embedding response
 */
async function generateDocumentEmbedding(text, options = {}) {
  console.log(`[Embeddings Provider] Generating document embedding (model: ${options.model || EMBEDDING_CONFIG.MODEL_NAME})...`);
  const start = Date.now();
  const res = await embedText(text, TASK_TYPES.RETRIEVAL_DOCUMENT, options);
  console.log(`[Embeddings Provider] Document embedding complete (duration: ${Date.now() - start}ms, dimensions: ${res.dimensions})`);
  return res;
}

/**
 * Generates a query embedding vector for a user prompt/query.
 * @param {string} userPrompt - Input user search query/prompt
 * @param {object} options - Custom overrides
 * @returns {Promise<object>} Structured query embedding response
 */
async function generateQueryEmbedding(userPrompt, options = {}) {
  if (!userPrompt || typeof userPrompt !== "string" || !userPrompt.trim()) {
    throw new Error("User prompt query must be a valid non-empty string.");
  }
  
  console.log(`[Embeddings Provider] Generating query embedding for: "${userPrompt.trim()}" (model: ${options.model || EMBEDDING_CONFIG.MODEL_NAME})...`);
  const start = Date.now();
  const res = await embedText(userPrompt, TASK_TYPES.RETRIEVAL_QUERY, options);
  console.log(`[Embeddings Provider] Query embedding complete (duration: ${Date.now() - start}ms, dimensions: ${res.dimensions})`);
  return res;
}

module.exports = {
  generateDocumentEmbedding,
  generateQueryEmbedding,
};
