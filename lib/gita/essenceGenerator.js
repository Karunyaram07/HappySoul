// * BHAGAVAD GITA VERSE ESSENCE GENERATOR - PHASE 6B.9.2
// ? Isolated Gemini generator distilling single-verse wisdom into a short essence
// ? in the user's preferred onboarding language.
//
// Does NOT touch Chaitanyam chat or retrieval systems.
// Does NOT leak API keys, credentials, or internal provider errors.

const { GoogleGenerativeAI } = require("@google/generative-ai");

const ESSENCE_CONFIG = {
  PRIMARY_MODEL: "gemini-flash-lite-latest",
  FALLBACK_MODEL: "gemini-3.1-flash-lite-preview",
  TEMPERATURE: 0.25,
  MAX_OUTPUT_TOKENS: 250,
};

const ALLOWED_LANGUAGES = [
  "English",
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
];

const SCRIPT_INSTRUCTIONS = {
  English: "Write strictly in English using the Latin script.",
  Telugu: "Write strictly in Telugu using the Telugu script (తెలుగు లిపి). Do NOT use English transliteration.",
  Hindi: "Write strictly in Hindi using the Devanagari script (देवनागरी लिपि). Do NOT use English transliteration.",
  Tamil: "Write strictly in Tamil using the Tamil script (தமிழ் எழுத்துக்கள்). Do NOT use English transliteration.",
  Kannada: "Write strictly in Kannada using the Kannada script (ಕನ್ನಡ ಲಿಪಿ). Do NOT use English transliteration.",
  Malayalam: "Write strictly in Malayalam using the Malayalam script (മലയാള ലിപി). Do NOT use English transliteration.",
};

/**
 * Sanitizes errors to prevent credential exposure and classify failure modes.
 */
function classifyEssenceError(error) {
  const rawMessage = error && error.message ? String(error.message) : "";
  const rawStatus = error && error.status ? String(error.status) : "";

  if (
    rawMessage.includes("Missing GEMINI_API_KEY") ||
    rawMessage.includes("API key is not configured")
  ) {
    return {
      message: "Gemini API key is not configured.",
      code: "MISSING_API_KEY",
      statusCode: 500,
    };
  }

  if (
    rawMessage.includes("API_KEY_INVALID") ||
    rawMessage.includes("API key not valid") ||
    rawMessage.includes("401") ||
    rawMessage.includes("403") ||
    rawMessage.includes("PERMISSION_DENIED") ||
    rawStatus === "401" ||
    rawStatus === "403"
  ) {
    return {
      message: "Gemini authentication failed.",
      code: "AUTH_FAILED",
      statusCode: 500,
    };
  }

  if (
    rawMessage.includes("429") ||
    rawMessage.includes("RESOURCE_EXHAUSTED") ||
    rawMessage.includes("Quota exceeded") ||
    rawMessage.includes("rate limit") ||
    rawStatus === "429"
  ) {
    return {
      message: "AI service rate limit exceeded.",
      code: "RATE_LIMIT_EXCEEDED",
      statusCode: 429,
    };
  }

  return {
    message: "Failed to generate verse essence.",
    code: "GENERATION_FAILED",
    statusCode: 502,
  };
}

/**
 * Builds the strictly bounded prompt for single-verse essence.
 */
function buildEssencePrompt({ chapter, verse, sanskrit, translation, targetLanguage }) {
  const scriptGuide = SCRIPT_INSTRUCTIONS[targetLanguage] || SCRIPT_INSTRUCTIONS.English;

  return `You are a reverent, wise scholar and philosopher of the Bhagavad Gita.
Your sole task is to explain the direct "Essence" of this specific Bhagavad Gita verse in ${targetLanguage}.

[CANONICAL VERSE]
Chapter: ${chapter}
Verse: ${verse}
Original Sanskrit:
${sanskrit}

Canonical English Translation:
${translation}

[INSTRUCTIONS]
1. Explain ONLY the meaning and spiritual wisdom of this specific verse.
2. Ground your explanation strictly in the supplied Sanskrit text and canonical translation.
3. Do NOT invent teachings, extrapolate unrelated stories, or cite other scriptures.
4. Do NOT claim to be Krishna, God, or an avatar.
5. Do NOT provide medical advice or psychotherapy.
6. Length: Exactly 2 to 3 concise, impactful sentences (approximately 50 to 80 words).
7. Tone: Serene, profound, clear, and practical for daily life.
8. Language & Script Requirement: ${scriptGuide}
9. Output format: Provide ONLY the final essence text. Do NOT include markdown code blocks, labels like "Essence:", or introductions.`;
}

/**
 * Generates verse essence using Gemini.
 *
 * @param {object} params
 * @param {number} params.chapter
 * @param {number} params.verse
 * @param {string} params.sanskrit
 * @param {string} params.translation
 * @param {string} params.targetLanguage
 * @param {string} [params.apiKey]
 * @returns {Promise<{ essence: string, language: string, model: string }>}
 */
async function generateVerseEssence({
  chapter,
  verse,
  sanskrit,
  translation,
  targetLanguage,
  apiKey,
}) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || typeof key !== "string" || !key.trim()) {
    throw classifyEssenceError(new Error("Missing GEMINI_API_KEY"));
  }

  const validLang = ALLOWED_LANGUAGES.includes(targetLanguage)
    ? targetLanguage
    : "English";

  const prompt = buildEssencePrompt({
    chapter,
    verse,
    sanskrit,
    translation,
    targetLanguage: validLang,
  });

  const genAI = new GoogleGenerativeAI(key);

  const modelOptions = {
    temperature: ESSENCE_CONFIG.TEMPERATURE,
    maxOutputTokens: ESSENCE_CONFIG.MAX_OUTPUT_TOKENS,
    responseMimeType: ESSENCE_CONFIG.RESPONSE_MIME_TYPE || "text/plain",
  };

  let usedModel = ESSENCE_CONFIG.PRIMARY_MODEL;
  let rawText = "";

  try {
    const model = genAI.getGenerativeModel({
      model: ESSENCE_CONFIG.PRIMARY_MODEL,
      generationConfig: modelOptions,
    });
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (primaryErr) {
    const errorMsg = String(primaryErr && primaryErr.message);
    const is503 =
      errorMsg.includes("503") ||
      errorMsg.includes("Service Unavailable") ||
      errorMsg.includes("high demand");

    if (is503 && ESSENCE_CONFIG.FALLBACK_MODEL) {
      console.log(
        `[Gita Essence] Model ${ESSENCE_CONFIG.PRIMARY_MODEL} returned 503. Retrying with fallback ${ESSENCE_CONFIG.FALLBACK_MODEL}...`
      );
      try {
        usedModel = ESSENCE_CONFIG.FALLBACK_MODEL;
        const fallbackModel = genAI.getGenerativeModel({
          model: ESSENCE_CONFIG.FALLBACK_MODEL,
          generationConfig: modelOptions,
        });
        const fallbackRes = await fallbackModel.generateContent(prompt);
        rawText = fallbackRes.response.text();
      } catch (fallbackErr) {
        throw classifyEssenceError(fallbackErr);
      }
    } else {
      throw classifyEssenceError(primaryErr);
    }
  }

  // Clean output: remove any leading quotes, "Essence:", or extra spaces
  let cleaned = (rawText || "").trim();
  cleaned = cleaned.replace(/^(Essence|भावार्थ|తాత్పర్యం|സാരം|సారాంశం)\s*:\s*/i, "");
  cleaned = cleaned.replace(/^["'«»“](.*)["'«»”]$/s, "$1").trim();

  return {
    essence: cleaned,
    language: validLang,
    model: usedModel,
  };
}

module.exports = {
  generateVerseEssence,
  buildEssencePrompt,
  classifyEssenceError,
  ESSENCE_CONFIG,
  ALLOWED_LANGUAGES,
};
