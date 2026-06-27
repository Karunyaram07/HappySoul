// * GITA SEED PIPELINE - STAGE 3: TRANSLATIONS ENRICHER
// ? Filters and updates translations in Supabase.

/**
 * Stage 3: Updates gita_verses with the preferred translation
 * @param {object} supabase - Supabase client instance
 * @param {Array<object>} translations - List of translations downloaded from dataset
 * @param {object} config - Configuration options from GITA_CONFIG
 */
async function enrichTranslations(supabase, translations, config) {
  console.log("\n--- STAGE 3: Enriching Translations ---");
  
  if (!Array.isArray(translations) || translations.length === 0) {
    throw new Error(`Invalid translations dataset received.`);
  }
  
  console.log(`Mapping translations to verses...`);
  
  const preferredTranslator = config.DEFAULT_TRANSLATOR; // e.g. "Swami Sivananda"
  
  // * Build a map of verse_id to translations array
  const verseTranslationsMap = new Map();
  translations.forEach((t) => {
    if (!verseTranslationsMap.has(t.verse_id)) {
      verseTranslationsMap.set(t.verse_id, []);
    }
    verseTranslationsMap.get(t.verse_id).push(t);
  });
  
  // Query all verses from DB
  const { data: dbVerses, error: dbError } = await supabase
    .from("gita_verses")
    .select("id, api_id, chapter_number, verse_number");
    
  if (dbError) {
    throw new Error(`Failed to fetch verses from DB: ${dbError.message}`);
  }
  
  console.log(`Fetched ${dbVerses.length} verses from DB. Computing updates...`);
  
  const updates = dbVerses.map((dbV) => {
    const list = verseTranslationsMap.get(Number(dbV.api_id)) || [];
    
    // Fallback Selection Rules:
    // 1. Matches preferred translator name
    // 2. Matches English translation
    // 3. First available translation
    let chosen = list.find((t) => t.authorName.toLowerCase() === preferredTranslator.toLowerCase());
    if (!chosen) {
      chosen = list.find((t) => t.lang.toLowerCase() === "english");
    }
    if (!chosen && list.length > 0) {
      chosen = list[0];
    }
    
    if (!chosen) {
      console.warn(`[Warning] No translation found for verse ID ${dbV.api_id} (Chapter ${dbV.chapter_number}, Verse ${dbV.verse_number})`);
      return null;
    }
    
    return {
      id: dbV.id,
      translation: chosen.description.trim(),
      translation_author: chosen.authorName,
      translation_author_id: String(chosen.author_id),
      translation_language: chosen.lang,
    };
  }).filter(Boolean);
  
  console.log(`Updating translations for ${updates.length} verses in batches...`);
  
  const batchSize = 50;
  let successCount = 0;
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (item) => {
        const { error } = await supabase
          .from("gita_verses")
          .update({
            translation: item.translation,
            translation_author: item.translation_author,
            translation_author_id: item.translation_author_id,
            translation_language: item.translation_language,
          })
          .eq("id", item.id);
          
        if (error) {
          throw new Error(`Failed to update translation for verse ID ${item.id}: ${error.message}`);
        }
      })
    );
    
    successCount += batch.length;
    console.log(`  ✓ Updated translations ${i + 1} to ${Math.min(i + batchSize, updates.length)}...`);
  }
  
  if (successCount === dbVerses.length) {
    console.log(`✓ Translation Updated: ${successCount} | PASS`);
  } else {
    console.log(`❌ Translation Updated: ${successCount} / ${dbVerses.length} | FAIL`);
    throw new Error(`Translation update count mismatch.`);
  }
}

module.exports = {
  enrichTranslations,
};
