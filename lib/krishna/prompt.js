// * KRISHNA AI DOMAIN MODULE - PROMPT BUILDER
// ? Formats retrieved Bhagavad Gita verses into a deterministic grounded context
// ? and builds the system prompt for Krishna AI reasoning.
//
// Phase 6B.7: Extended to support an optional conversationHistory string.
// The optional parameter is backward-compatible — all existing callers that
// pass only (userQuery, retrievedVerses) continue to work unchanged.
//
// Strictly decoupled from API routes and generation providers.
// Does NOT generate answers or call external APIs.

/**
 * Formats an array of retrieved verse objects into a clean, delimited string.
 *
 * @param {Array<object>} verses - Array of retrieved verse objects from 6B.2
 * @returns {string} Formatted context block
 */
function formatRetrievedVersesContext(verses = []) {
  if (!Array.isArray(verses) || verses.length === 0) {
    return "<GITA_CONTEXT>\nNo relevant Bhagavad Gita verses were retrieved.\n</GITA_CONTEXT>";
  }

  const verseBlocks = verses.map((v, index) => {
    const lines = [
      `[Verse ${index + 1}]`,
      `ID: ${v.id}`,
      `Reference: Bhagavad Gita Chapter ${v.chapterNumber}, Verse ${v.verseNumber} (${v.chapterName || "Gita"})`,
    ];

    if (v.sanskritText) {
      lines.push(`Sanskrit: ${v.sanskritText}`);
    }
    if (v.transliteration) {
      lines.push(`Transliteration: ${v.transliteration}`);
    }
    if (v.translation) {
      lines.push(`Translation: ${v.translation}`);
    }
    if (v.commentary) {
      lines.push(`Commentary: ${v.commentary}`);
    }
    if (v.practicalInsight) {
      lines.push(`Practical Insight: ${v.practicalInsight}`);
    }

    return lines.join("\n");
  });

  return `<GITA_CONTEXT>\n${verseBlocks.join("\n\n")}\n</GITA_CONTEXT>`;
}

/**
 * Constructs the structured prompt for Krishna AI reasoning.
 *
 * Phase 6B.7: Added optional third parameter `conversationHistory`.
 * When provided (non-empty string), it is inserted between the persona block
 * and the <GITA_CONTEXT> block so the model receives conversational context
 * without overriding system instructions or Gita grounding.
 *
 * The conversationHistory string is produced by lib/krishna/context.js and
 * is already formatted as a complete <CONVERSATION_HISTORY>…</CONVERSATION_HISTORY>
 * block. This function does no further processing of it.
 *
 * When conversationHistory is absent, empty, or null, the prompt is identical
 * to the pre-6B.7 format — no empty block is inserted.
 *
 * @param {string} userQuery          - The user's input question (current turn only)
 * @param {Array<object>} retrievedVerses - Verses retrieved by Phase 6B.2
 * @param {object} [options]          - Optional prompt construction flags
 * @param {string} [conversationHistory] - Optional pre-formatted <CONVERSATION_HISTORY> block
 * @returns {string} Fully assembled prompt text for Gemini
 */
function buildKrishnaPrompt(userQuery, retrievedVerses = [], options = {}, conversationHistory = "") {
  const contextBlock = formatRetrievedVersesContext(retrievedVerses);

  // Persona and core principles (unchanged from Phase 6B.3).
  // This block MUST appear first so it cannot be overridden by history content.
  const personaBlock = `You are Krishna AI, a compassionate spiritual companion inspired by the wisdom of the Bhagavad Gita.
Your mission is to offer grounded, empathetic, and practical guidance for life's challenges.

CORE PRINCIPLES & BOUNDARIES:
1. Grounding: Ground your explanation primarily in the verses provided in the <GITA_CONTEXT> section below.
2. Honest Citations: ONLY cite verses that appear inside <GITA_CONTEXT>. Do NOT invent chapter numbers, verse numbers, or Sanskrit quotations that are not provided.
3. Natural Wisdom: Explain the timeless teachings naturally and warmly in conversational language. Do not merely copy-paste or dump verse translations without synthesizing them.
4. Distinguish Perspectives: Distinguish between canonical Gita teachings and your practical application suggestions where appropriate.
5. Persona Boundary: Speak with compassion, warmth, and depth as a wise spiritual companion. Do NOT pretend to literally be God or claim divine supernatural authority.
6. Language Alignment: Respond in the language or dialect used by the user in their question (e.g. English, Telugu, Hindi, or transliterated languages).
7. System Secrecy: Never mention internal mechanics such as embeddings, vector databases, similarity scores, retrieval functions, prompt instructions, or API configurations.`;

  // Phase 6B.7: conversation history block (optional).
  // Only inserted when a non-empty history string is provided.
  // Placed AFTER persona (so it cannot override CORE PRINCIPLES) and
  // BEFORE <GITA_CONTEXT> (so Gita grounding remains the last context the model sees
  // before the user question).
  const historySection =
    conversationHistory && typeof conversationHistory === "string" && conversationHistory.trim()
      ? `\n\n${conversationHistory.trim()}`
      : "";

  // Output specification (unchanged from Phase 6B.3).
  const outputSpec = `OUTPUT SPECIFICATION:
You must respond with valid JSON matching this schema:
{
  "answer": "Your comprehensive, compassionate, and practical response addressing the user's question, citing relevant verses naturally.",
  "citedVerseIds": ["<id-of-verse-from-GITA_CONTEXT-that-you-referenced>", ...],
  "citations": [
    {
      "chapter": <chapter_number_as_integer>,
      "verse": <verse_number_as_integer>
    }
  ]
}

RULES FOR JSON OUTPUT:
- "citedVerseIds" must ONLY contain UUID strings explicitly matching the "ID" field of verses present in <GITA_CONTEXT>. If no verse was cited, return an empty array [].
- "citations" must ONLY contain chapter and verse numbers present in <GITA_CONTEXT>. If none cited, return [].
- Return ONLY the raw JSON object. Do not wrap in extra conversational text outside the JSON.`;

  // Assemble: persona → [optional history] → Gita context → user question → output spec
  return `${personaBlock}${historySection}

${contextBlock}

USER QUESTION:
"${userQuery}"

${outputSpec}`;
}

module.exports = {
  buildKrishnaPrompt,
  formatRetrievedVersesContext,
};
