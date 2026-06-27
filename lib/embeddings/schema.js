// * EMBEDDING DOMAIN MODULE - SCHEMA DOCUMENTATION
// ? Documents the structured shape of processed embedding records.

/**
 * @typedef {object} EmbeddingPayload
 * @property {string} verseId - The unique database ID of the verse
 * @property {string} text - The formatted text string sent to the embedder
 * @property {number[]} embedding - The 768-dimension vector values
 * @property {string} model - The model identifier used (e.g. 'gemini-embedding-001')
 * @property {number} dimensions - The dimension size of the vector
 * @property {string} version - The version identifier of the model
 * @property {number} textVersion - The version of the formatter layout
 * @property {string} embeddedAt - ISO timestamp of vector generation
 */

module.exports = {};
