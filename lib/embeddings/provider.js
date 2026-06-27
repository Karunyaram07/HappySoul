// * EMBEDDING DOMAIN MODULE - PROVIDER
// ? Communicates with Google Gemini API to generate text vectors.

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EMBEDDING_CONFIG } = require("./config");
const { TASK_TYPES } = require("./constants");

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
 * Generates a semantic vector for a given string block.
 * @param {string} text - Input text document
 * @param {object} options - Custom execution options (model, taskType, dimensions)
 * @returns {Promise<number[]>} Float array representing the embedding vector
 */
async function generateEmbedding(text, options = {}) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Input text must be a valid non-empty string.");
  }

  const modelName = options.model || EMBEDDING_CONFIG.MODEL_NAME;
  const dimensions = options.dimensions || EMBEDDING_CONFIG.DIMENSIONS;
  const taskType = options.taskType || TASK_TYPES.RETRIEVAL_DOCUMENT;

  const client = getGenAI();
  const model = client.getGenerativeModel({ model: modelName });

  const result = await model.embedContent({
    content: {
      parts: [{ text }],
    },
    taskType,
    outputDimensionality: dimensions,
  });

  if (!result || !result.embedding || !result.embedding.values || result.embedding.values.length === 0) {
    throw new Error(`Gemini Embedding API returned an empty or malformed payload.`);
  }

  const values = result.embedding.values;
  if (values.length !== dimensions) {
    throw new Error(`Embedding dimensions mismatch. Expected ${dimensions}, got ${values.length}`);
  }

  return values;
}

module.exports = {
  generateEmbedding,
};
