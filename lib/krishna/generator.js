// * KRISHNA AI DOMAIN MODULE - GENERATOR & VALIDATOR
// ? Coordinates prompt assembly, Gemini invocation, JSON parsing,
// ? strict grounding validation, and safe error classification.
//
// Does NOT implement Route Handlers or UI.
// Does NOT leak API keys, authorization headers, or sensitive user data in errors.

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildKrishnaPrompt } = require("./prompt");

const GENERATOR_CONFIG = {
  PRIMARY_MODEL: "gemini-flash-lite-latest",
  FALLBACK_MODEL: "gemini-3.1-flash-lite-preview",
  TEMPERATURE: 0.7,
  MAX_OUTPUT_TOKENS: 1500,
};

/**
 * Custom application error class for Krishna AI generation failures.
 */
class KrishnaAIError extends Error {
  /**
   * @param {string} userMessage - Safe, sanitized message for display
   * @param {string} code - Machine-readable error code
   * @param {string} [internalDetail] - Sanitized technical details for server logging
   */
  constructor(userMessage, code, internalDetail = "") {
    super(userMessage);
    this.name = "KrishnaAIError";
    this.code = code;
    this.userMessage = userMessage;
    this.internalDetail = internalDetail;
  }
}

/**
 * Sanitizes any raw error to ensure no API keys or credentials are leaked.
 *
 * @param {Error|any} error - Raw error object
 * @returns {KrishnaAIError} Sanitized application error
 */
function classifyGeminiError(error) {
  if (error instanceof KrishnaAIError) {
    return error;
  }

  const rawMessage = (error && error.message) ? String(error.message) : "";
  const rawStatus = (error && error.status) ? String(error.status) : "";

  // 1. Missing API Key
  if (rawMessage.includes("Missing GEMINI_API_KEY") || rawMessage.includes("API key is not configured")) {
    return new KrishnaAIError(
      "Gemini API key is not configured.",
      "MISSING_API_KEY"
    );
  }

  // 2. Authentication / Invalid API key
  if (
    rawMessage.includes("API_KEY_INVALID") ||
    rawMessage.includes("API key not valid") ||
    rawMessage.includes("401") ||
    rawMessage.includes("403") ||
    rawMessage.includes("PERMISSION_DENIED") ||
    rawStatus === "401" ||
    rawStatus === "403"
  ) {
    return new KrishnaAIError(
      "Gemini authentication failed. Please check the configured API key.",
      "AUTH_FAILED"
    );
  }

  // 3. Rate limits / Quota exceeded
  if (
    rawMessage.includes("429") ||
    rawMessage.includes("RESOURCE_EXHAUSTED") ||
    rawMessage.includes("Quota exceeded") ||
    rawMessage.includes("rate limit") ||
    rawStatus === "429"
  ) {
    return new KrishnaAIError(
      "AI service rate limit or quota exceeded.",
      "RATE_LIMIT_EXCEEDED"
    );
  }

  // 4. Overloaded / Temporary 503
  if (rawMessage.includes("503") || rawMessage.includes("Service Unavailable")) {
    return new KrishnaAIError(
      "AI service is temporarily unavailable. Please try again shortly.",
      "SERVICE_UNAVAILABLE"
    );
  }

  // 5. Generic fallback
  return new KrishnaAIError(
    "AI generation failed. Please try again.",
    "GENERATION_FAILED"
  );
}

/**
 * Safely parses raw LLM text into JSON, stripping code fences if present.
 *
 * @param {string} rawText - Text output from Gemini
 * @returns {object} Parsed JSON object
 */
function parseRawOutput(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new KrishnaAIError("AI response was empty or malformed.", "EMPTY_RESPONSE");
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if model wrapped response
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    throw new KrishnaAIError("AI response could not be parsed as valid JSON.", "INVALID_JSON");
  }
}

/**
 * Validates the parsed structure and guarantees that cited verses
 * strictly correspond to retrieved verses.
 *
 * @param {object} parsed - Parsed JSON from the model
 * @param {Array<object>} retrievedVerses - The array of retrieved verses supplied in context
 * @returns {object} Validated, clean response structure
 */
function validateAndEnforceGrounding(parsed, retrievedVerses = []) {
  if (!parsed || typeof parsed !== "object") {
    throw new KrishnaAIError("Malformed AI response structure.", "MALFORMED_OUTPUT");
  }

  const answer = (typeof parsed.answer === "string") ? parsed.answer.trim() : "";
  if (!answer) {
    throw new KrishnaAIError("AI returned an empty answer.", "EMPTY_ANSWER");
  }

  // Build sets of authorized IDs and references
  const allowedIdMap = new Map();
  const allowedVerseSet = new Set();

  for (const v of retrievedVerses) {
    if (v && v.id) {
      allowedIdMap.set(String(v.id), v);
      allowedVerseSet.add(`${v.chapterNumber}.${v.verseNumber}`);
    }
  }

  // Enforce citedVerseIds: reject / filter any unknown IDs
  const rawCitedIds = Array.isArray(parsed.citedVerseIds) ? parsed.citedVerseIds : [];
  const validCitedVerseIds = [];

  for (const id of rawCitedIds) {
    const idStr = String(id);
    if (allowedIdMap.has(idStr)) {
      if (!validCitedVerseIds.includes(idStr)) {
        validCitedVerseIds.push(idStr);
      }
    }
  }

  // Enforce citations: reject any chapter.verse pair not retrieved
  const rawCitations = Array.isArray(parsed.citations) ? parsed.citations : [];
  const validCitations = [];

  for (const cit of rawCitations) {
    if (cit && typeof cit.chapter === "number" && typeof cit.verse === "number") {
      const key = `${cit.chapter}.${cit.verse}`;
      if (allowedVerseSet.has(key)) {
        const alreadyAdded = validCitations.some(
          (c) => c.chapter === cit.chapter && c.verse === cit.verse
        );
        if (!alreadyAdded) {
          validCitations.push({ chapter: cit.chapter, verse: cit.verse });
        }
      }
    }
  }

  return {
    answer,
    citedVerseIds: validCitedVerseIds,
    citations: validCitations,
  };
}

/**
 * Main reasoning entry point: generates a grounded Krishna AI response
 * for a user query using the retrieved verses.
 *
 * @param {string} query - Natural language user question
 * @param {Array<object>} retrievedVerses - Ranked verses from 6B.2 retrieval
 * @param {object} [options] - Custom generation options (model, customApiKey, etc.)
 * @returns {Promise<object>} Structured response { answer, citedVerseIds, citations, meta }
 */
async function generateKrishnaResponse(query, retrievedVerses = [], options = {}) {
  // ── 1. Input validation ────────────────────────────────────────────────────
  if (!query || typeof query !== "string" || !query.trim()) {
    throw new KrishnaAIError("User question must be a non-empty string.", "INVALID_INPUT");
  }

  const trimmedQuery = query.trim();

  // Validate retrieved verses format if provided
  if (!Array.isArray(retrievedVerses)) {
    throw new KrishnaAIError("Retrieved verses must be an array.", "INVALID_INPUT");
  }

  // ── 2. No-retrieval safe behavior ──────────────────────────────────────────
  // If no verses were retrieved, return safe ungrounded notification without
  // pretending to have evidence.
  if (retrievedVerses.length === 0) {
    return {
      answer: "No sufficiently relevant Bhagavad Gita context was found for this question. Please consider rephrasing your question or exploring another topic.",
      citedVerseIds: [],
      citations: [],
      meta: {
        isGrounded: false,
        zeroRetrieval: true,
        model: "none",
        retrievedCount: 0,
        citedCount: 0,
      },
    };
  }

  // ── 3. Check API key configuration ─────────────────────────────────────────
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    throw new KrishnaAIError("Gemini API key is not configured.", "MISSING_API_KEY");
  }

  // ── 4. Prompt Assembly ─────────────────────────────────────────────────────
  const prompt = buildKrishnaPrompt(trimmedQuery, retrievedVerses, options);

  // ── 5. Gemini Generative Call ──────────────────────────────────────────────
  const modelName = options.model || GENERATOR_CONFIG.PRIMARY_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey);

  let rawOutputText = "";
  let usedModelName = modelName;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: options.temperature !== undefined ? options.temperature : GENERATOR_CONFIG.TEMPERATURE,
        maxOutputTokens: options.maxOutputTokens || GENERATOR_CONFIG.MAX_OUTPUT_TOKENS,
      },
    });

    const response = await model.generateContent(prompt);
    rawOutputText = response.response.text();
  } catch (providerError) {
    const errorMsg = String(providerError && providerError.message);
    const is503 = errorMsg.includes("503") || errorMsg.includes("Service Unavailable") || errorMsg.includes("high demand");

    if (is503 && GENERATOR_CONFIG.FALLBACK_MODEL && modelName !== GENERATOR_CONFIG.FALLBACK_MODEL) {
      console.log(
        `[Krishna Generator] Model ${modelName} returned 503. Falling back to ${GENERATOR_CONFIG.FALLBACK_MODEL}...`
      );
      try {
        usedModelName = GENERATOR_CONFIG.FALLBACK_MODEL;
        const fallbackModel = genAI.getGenerativeModel({
          model: GENERATOR_CONFIG.FALLBACK_MODEL,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: options.temperature !== undefined ? options.temperature : GENERATOR_CONFIG.TEMPERATURE,
            maxOutputTokens: options.maxOutputTokens || GENERATOR_CONFIG.MAX_OUTPUT_TOKENS,
          },
        });
        const fallbackRes = await fallbackModel.generateContent(prompt);
        rawOutputText = fallbackRes.response.text();
      } catch (fallbackErr) {
        throw classifyGeminiError(fallbackErr);
      }
    } else {
      throw classifyGeminiError(providerError);
    }
  }

  // ── 6. JSON Parsing ────────────────────────────────────────────────────────
  const parsedJson = parseRawOutput(rawOutputText);

  // ── 7. Grounding Validation & Citation Enforcement ─────────────────────────
  const validated = validateAndEnforceGrounding(parsedJson, retrievedVerses);

  return {
    answer: validated.answer,
    citedVerseIds: validated.citedVerseIds,
    citations: validated.citations,
    meta: {
      isGrounded: true,
      zeroRetrieval: false,
      model: usedModelName,
      retrievedCount: retrievedVerses.length,
      citedCount: validated.citedVerseIds.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  generateKrishnaResponse,
  classifyGeminiError,
  parseRawOutput,
  validateAndEnforceGrounding,
  KrishnaAIError,
  GENERATOR_CONFIG,
};
