// * GITA SEED PIPELINE - STAGE 4: COMMENTARIES ENRICHER
// ? Filters and updates commentaries in Supabase.

/**
 * Stage 4: Updates gita_verses with the preferred commentary
 * @param {object} supabase - Supabase client instance
 * @param {Array<object>} commentaries - List of commentaries downloaded from dataset
 * @param {object} config - Configuration options from GITA_CONFIG
 */
async function enrichCommentaries(supabase, commentaries, config) {
  console.log("\n--- STAGE 4: Enriching Commentaries ---");
  
  if (!Array.isArray(commentaries) || commentaries.length === 0) {
    throw new Error(`Invalid commentaries dataset received.`);
  }
  
  console.log(`Mapping commentaries to verses...`);
  
  const preferredCommentary = config.DEFAULT_COMMENTARY; // e.g. "Swami Sivananda"
  
  // * Build a map of verse_id to commentaries array
  const verseCommentariesMap = new Map();
  commentaries.forEach((c) => {
    if (!verseCommentariesMap.has(c.verse_id)) {
      verseCommentariesMap.set(c.verse_id, []);
    }
    verseCommentariesMap.get(c.verse_id).push(c);
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
    const list = verseCommentariesMap.get(Number(dbV.api_id)) || [];
    
    // Fallback Selection Rules:
    // 1. Matches preferred commentary author name
    // 2. Matches English commentary
    // 3. First available commentary
    let chosen = list.find((c) => c.authorName.toLowerCase() === preferredCommentary.toLowerCase());
    if (!chosen) {
      chosen = list.find((c) => c.lang.toLowerCase() === "english");
    }
    if (!chosen && list.length > 0) {
      chosen = list[0];
    }
    
    if (!chosen) {
      console.warn(`[Warning] No commentary found for verse ID ${dbV.api_id} (Chapter ${dbV.chapter_number}, Verse ${dbV.verse_number})`);
      return null;
    }
    
    return {
      id: dbV.id,
      commentary: chosen.description.trim(),
      commentary_author: chosen.authorName,
      commentary_author_id: String(chosen.author_id),
      commentary_language: chosen.lang,
    };
  }).filter(Boolean);
  
  console.log(`Updating commentaries for ${updates.length} verses in batches...`);
  
  const batchSize = 50;
  let successCount = 0;
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (item) => {
        const { error } = await supabase
          .from("gita_verses")
          .update({
            commentary: item.commentary,
            commentary_author: item.commentary_author,
            commentary_author_id: item.commentary_author_id,
            commentary_language: item.commentary_language,
          })
          .eq("id", item.id);
          
        if (error) {
          throw new Error(`Failed to update commentary for verse ID ${item.id}: ${error.message}`);
        }
      })
    );
    
    successCount += batch.length;
    console.log(`  ✓ Updated commentaries ${i + 1} to ${Math.min(i + batchSize, updates.length)}...`);
  }
  
  if (successCount === dbVerses.length) {
    console.log(`✓ Commentary Updated: ${successCount} | PASS`);
  } else {
    console.log(`❌ Commentary Updated: ${successCount} / ${dbVerses.length} | FAIL`);
    throw new Error(`Commentary update count mismatch.`);
  }
}

module.exports = {
  enrichCommentaries,
};
