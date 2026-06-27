// * EMBEDDING DOMAIN MODULE - CONFIGURATION
// ? Centralizes all configuration variables for embedding models, batches, retries, and version limits.

const EMBEDDING_CONFIG = {
  MODEL_NAME: "gemini-embedding-001",
  DIMENSIONS: 768, // Configured for gemini-embedding-001 with outputDimensionality = 768
  BATCH_SIZE: 25,
  MAX_RETRIES: 3,
  RETRY_DELAY: 15000, // in milliseconds (15s -> 30s -> 60s backoff)
  EMBEDDING_VERSION: "v1",
  EMBEDDING_TEXT_VERSION: 1,
};

module.exports = {
  EMBEDDING_CONFIG,
};
