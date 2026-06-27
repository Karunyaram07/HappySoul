// * EMBEDDING DOMAIN MODULE - FORMATTER
// ? Compiles multi-field verse attributes into a structured string document.

/**
 * Formats a Bhagavad Gita verse object into a clean structured text document for semantic embedding.
 * @param {object} verse - Verse database record with optional gita_chapters relation
 * @returns {string} Formatted text document
 */
function formatVerseForEmbedding(verse) {
  if (!verse) return "";
  
  const parts = [];
  
  // Chapter & Verse coordinates
  const chapterName = verse.gita_chapters?.name_translated || verse.gita_chapters?.name || "";
  if (chapterName) {
    parts.push(`Chapter Name: ${chapterName}`);
  }
  parts.push(`Chapter Number: ${verse.chapter_number}`);
  parts.push(`Verse Number: ${verse.verse_number}`);
  
  // Sanskrit Text and Transliteration
  if (verse.sanskrit_text && verse.sanskrit_text.trim()) {
    parts.push(`Sanskrit: ${verse.sanskrit_text.trim()}`);
  }
  if (verse.transliteration && verse.transliteration.trim()) {
    parts.push(`Transliteration: ${verse.transliteration.trim()}`);
  }
  
  // Word Meanings
  if (verse.word_meanings && verse.word_meanings.trim()) {
    parts.push(`Word Meanings: ${verse.word_meanings.trim()}`);
  }
  
  // Translation
  if (verse.translation && verse.translation.trim()) {
    parts.push(`Translation: ${verse.translation.trim()}`);
  }
  
  // Commentary
  if (verse.commentary && verse.commentary.trim()) {
    parts.push(`Commentary: ${verse.commentary.trim()}`);
  }
  
  // Dynamic future extensions (AI enrichment outputs)
  if (verse.practical_insight && verse.practical_insight.trim()) {
    parts.push(`Practical Insight: ${verse.practical_insight.trim()}`);
  }
  if (verse.modern_explanation && verse.modern_explanation.trim()) {
    parts.push(`Modern Explanation: ${verse.modern_explanation.trim()}`);
  }
  
  return parts.join("\n\n");
}

module.exports = {
  formatVerseForEmbedding,
};
