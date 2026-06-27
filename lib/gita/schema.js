// * BHAGAVAD GITA SCHEMA REFERENCES
// ? This serves as developer documentation and architectural consistency.
// ? Do not introduce runtime validation libraries.

export const ChapterSchema = {
  id: "", // UUID
  api_id: "", // ID from external Ravi Siyer dataset
  chapter_number: 1, // Unique chapter number
  name: "", // Sanskrit name (e.g. अर्जुनविषादयोग)
  slug: "", // URL slug (e.g. chapter-1)
  name_transliterated: "", // Transliterated name (e.g. Arjuna Visada Yoga)
  name_translated: "", // Translated English name (e.g. Arjuna's Grief)
  verses_count: 47, // Count of verses in the chapter
  name_meaning: "", // Explanation of the name
  chapter_summary: "", // Chapter summary in English
  chapter_summary_hindi: "", // Chapter summary in Hindi
  theme_overview: "", // Custom Happy Soul theme description
  featured: false, // Whether the chapter is highlighted on the landing/explore page
  created_at: "", // Timestamptz
  updated_at: "", // Timestamptz
};

export const VerseSchema = {
  id: "", // UUID
  api_id: "", // ID from external Ravi Siyer dataset
  chapter_id: "", // UUID reference to gita_chapters
  chapter_number: 1, // Chapter number
  verse_number: 1, // Verse number within the chapter
  slug: "", // URL slug (e.g. chapter-1-verse-1)
  sanskrit_text: "", // Original Sanskrit text (Devanagari)
  transliteration: "", // Roman transliteration with diacritics
  word_meanings: "", // Word-by-word meanings
  translation: "", // Preferred translation text
  translation_author: "", // Translator author (e.g. Swami Sivananda)
  translation_author_id: "", // Translator ID identifier
  translation_language: "", // Translation language (e.g. English)
  commentary: "", // Preferred commentary text
  commentary_author: "", // Commentary author
  commentary_author_id: "", // Commentary ID identifier
  commentary_language: "", // Commentary language
  practical_insight: "", // Custom Happy Soul practical application (null initially)
  modern_explanation: "", // Custom Happy Soul simplified meaning (null initially)
  mood_relevance: "", // Custom Happy Soul emotional association (null initially)
  source: "", // Source of data (e.g. ravisiyer/gita-data)
  source_version: "", // Version tag of source dataset (e.g. v1)
  created_at: "", // Timestamptz
  updated_at: "", // Timestamptz
};

export const ThemeSchema = {
  id: "", // UUID
  name: "", // Theme name (e.g. Peace, Courage)
  description: "", // Theme description
  icon: "", // Icon identifier (e.g. Wind, Flame)
  color: "", // Theme color hex/tailwind class
};

export const FeatureTagSchema = {
  id: "", // UUID
  verse_id: "", // UUID reference to gita_verses
  feature_name: "", // Feature tag identifier (e.g. krishna_ai, daily_thought)
};
