// * KRISHNA AI DOMAIN MODULE - RETRIEVAL
// ? Converts a user query into a vector embedding and retrieves the most
// ? semantically relevant Bhagavad Gita verses via the match_verses() RPC.
//
// This module is the ONLY retrieval entry point for the Krishna AI feature.
// It does NOT generate AI answers or build prompts — those belong to Phase 6B.3+.
//
// Supabase client is passed in by the caller (Route Handler or test runner)
// to decouple data access context (user session vs admin).
//
// Depends on:
//   - lib/embeddings/provider.js  (generateQueryEmbedding)
//   - Supabase match_verses() RPC (Phase 6B.1 migration)

const { generateQueryEmbedding } = require("../embeddings/provider");

// ── Retrieval defaults ────────────────────────────────────────────────────────
// These can be overridden per-call via options. The defaults balance retrieval
// quality against downstream prompt context size.

const RETRIEVAL_DEFAULTS = {
  /** Minimum cosine similarity (0.0–1.0). Verses below this are excluded. */
  MATCH_THRESHOLD: 0.5,
  /** Maximum number of verses returned to the caller. */
  MATCH_COUNT: 5,
  /** Hard upper limit on user query length (characters). */
  MAX_QUERY_LENGTH: 1000,
};

// ── JSDoc type definitions ────────────────────────────────────────────────────

/**
 * @typedef {object} RetrievalOptions
 * @property {number}   [matchThreshold]         - Minimum cosine similarity (default: 0.5)
 * @property {number}   [matchCount]             - Max verses to return (default: 5)
 * @property {string[]} [filterThemes]           - Optional theme name filter (e.g. ["Peace", "self-control"])
 * @property {number}   [filterChapter]          - Optional chapter number filter (1–18)
 * @property {boolean}  [fallbackWithoutThemes]  - Fallback without theme filter if 0 results (default: true)
 */

/**
 * @typedef {object} RetrievedVerse
 * @property {string} id
 * @property {number} chapterNumber
 * @property {string} chapterName
 * @property {number} verseNumber
 * @property {string} sanskritText
 * @property {string} transliteration
 * @property {string} translation
 * @property {string} commentary
 * @property {string|null} practicalInsight
 * @property {number} similarity
 */

/**
 * @typedef {object} RetrievalResult
 * @property {string}         query         - Original user query (trimmed)
 * @property {RetrievedVerse[]} verses       - Ranked list of matched verses
 * @property {number}         count          - Number of verses returned
 * @property {object}         meta           - Retrieval metadata
 * @property {number}         meta.matchThreshold
 * @property {number}         meta.matchCount
 * @property {string[]|null}  meta.filterThemes
 * @property {number|null}    meta.filterChapter
 * @property {boolean}        meta.fallbackWithoutThemes
 * @property {boolean}        meta.usedThemeFallback
 * @property {string}         meta.embeddingModel
 * @property {number}         meta.embeddingDimensions
 * @property {string}         meta.embeddingGeneratedAt
 */

// ── Main retrieval function ───────────────────────────────────────────────────

/**
 * Converts a user query into a vector embedding and retrieves the most
 * semantically relevant Bhagavad Gita verses using the match_verses() RPC.
 *
 * Does NOT generate an AI answer. Returns raw retrieval results only.
 *
 * @param {object}           supabase - Authenticated or admin Supabase client
 * @param {string}           query    - Natural language user query
 * @param {RetrievalOptions} options  - Optional retrieval configuration
 * @returns {Promise<RetrievalResult>} Structured retrieval result
 * @throws {Error} On invalid input, embedding failure, or Supabase RPC failure
 */
async function retrieveRelevantVerses(supabase, query, options = {}) {
  // ── 1. Client & input validation ───────────────────────────────────────────
  if (!supabase || typeof supabase.rpc !== "function") {
    throw new Error("[Krishna Retrieval] A valid Supabase client is required.");
  }

  if (!query || typeof query !== "string") {
    throw new Error("[Krishna Retrieval] Query must be a non-empty string.");
  }

  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    throw new Error("[Krishna Retrieval] Query must not be blank or whitespace only.");
  }

  if (trimmedQuery.length > RETRIEVAL_DEFAULTS.MAX_QUERY_LENGTH) {
    throw new Error(
      `[Krishna Retrieval] Query exceeds maximum length of ${RETRIEVAL_DEFAULTS.MAX_QUERY_LENGTH} characters.`
    );
  }

  // ── 2. Resolve options with defaults ──────────────────────────────────────
  const matchThreshold =
    options.matchThreshold !== undefined
      ? options.matchThreshold
      : RETRIEVAL_DEFAULTS.MATCH_THRESHOLD;

  const matchCount =
    options.matchCount !== undefined
      ? options.matchCount
      : RETRIEVAL_DEFAULTS.MATCH_COUNT;

  const filterThemes =
    Array.isArray(options.filterThemes) && options.filterThemes.length > 0
      ? options.filterThemes
      : null;

  const filterChapter =
    typeof options.filterChapter === "number" && options.filterChapter >= 1
      ? options.filterChapter
      : null;

  const fallbackWithoutThemes =
    options.fallbackWithoutThemes !== undefined
      ? Boolean(options.fallbackWithoutThemes)
      : true;

  console.log(
    `[Krishna Retrieval] Starting retrieval for: "${trimmedQuery.substring(0, 80)}${trimmedQuery.length > 80 ? "..." : ""}"`
  );

  // ── 3. Generate query embedding ────────────────────────────────────────────
  // Delegates entirely to lib/embeddings/provider.js — no re-implementation.
  let embeddingResult;
  try {
    embeddingResult = await generateQueryEmbedding(trimmedQuery);
  } catch (embeddingError) {
    throw new Error(
      `[Krishna Retrieval] Embedding generation failed: ${embeddingError.message}`
    );
  }

  const queryEmbedding = embeddingResult.embedding;

  console.log(
    `[Krishna Retrieval] Embedding ready (model: ${embeddingResult.model}, dims: ${embeddingResult.dimensions}). Calling match_verses()...`
  );

  // ── 4. Call match_verses() RPC ─────────────────────────────────────────────
  const rpcParams = {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  };

  if (filterThemes !== null) rpcParams.filter_themes = filterThemes;
  if (filterChapter !== null) rpcParams.filter_chapter = filterChapter;

  let { data: rows, error: rpcError } = await supabase.rpc(
    "match_verses",
    rpcParams
  );

  if (rpcError) {
    throw new Error(
      `[Krishna Retrieval] match_verses() RPC failed: ${rpcError.message} (code: ${rpcError.code})`
    );
  }

  let usedThemeFallback = false;

  // Fallback if theme filtering yielded 0 results and fallback is enabled
  if (
    filterThemes !== null &&
    (!rows || rows.length === 0) &&
    fallbackWithoutThemes
  ) {
    console.log(
      `[Krishna Retrieval] Theme filter returned 0 results. Falling back to search without themes...`
    );

    const fallbackParams = {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    };
    if (filterChapter !== null) fallbackParams.filter_chapter = filterChapter;

    const { data: fallbackRows, error: fallbackError } = await supabase.rpc(
      "match_verses",
      fallbackParams
    );

    if (fallbackError) {
      throw new Error(
        `[Krishna Retrieval] match_verses() fallback RPC failed: ${fallbackError.message} (code: ${fallbackError.code})`
      );
    }

    rows = fallbackRows;
    usedThemeFallback = true;
  }

  // ── 5. Normalise results ───────────────────────────────────────────────────
  // Map snake_case database columns → camelCase for the application layer.
  const verses = (rows || []).map((row) => ({
    id: row.id,
    chapterNumber: row.chapter_number,
    chapterName: row.chapter_name,
    verseNumber: row.verse_number,
    sanskritText: row.sanskrit_text,
    transliteration: row.transliteration,
    translation: row.translation,
    commentary: row.commentary,
    practicalInsight: row.practical_insight ?? null,
    similarity: row.similarity,
  }));

  console.log(
    `[Krishna Retrieval] Retrieved ${verses.length} verse(s) ` +
      `(threshold: ${matchThreshold}, count: ${matchCount}${usedThemeFallback ? ", usedThemeFallback=true" : ""})`
  );

  // ── 6. Return structured result ────────────────────────────────────────────
  return {
    query: trimmedQuery,
    verses,
    count: verses.length,
    meta: {
      matchThreshold,
      matchCount,
      filterThemes,
      filterChapter,
      fallbackWithoutThemes,
      usedThemeFallback,
      embeddingModel: embeddingResult.model,
      embeddingDimensions: embeddingResult.dimensions,
      embeddingGeneratedAt: embeddingResult.generatedAt,
    },
  };
}

module.exports = {
  retrieveRelevantVerses,
  RETRIEVAL_DEFAULTS,
};
