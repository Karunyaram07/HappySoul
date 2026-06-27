// * GITA SEED PIPELINE - STAGE 2: VERSES SEEDER
// ? Validates records, detects duplicates, and upserts unique verses in batches of 50.

/**
 * Stage 2: Seeds the Gita verses (without translations/commentaries)
 * @param {object} supabase - Supabase client instance
 * @param {Array<object>} verses - List of verses downloaded from dataset
 * @param {Map<number, string>} chapterMap - Map of chapter_number to DB UUID
 * @returns {Promise<number>} Success count of imported verses
 */
async function seedVerses(supabase, verses, chapterMap) {
  console.log("\n--- STAGE 2: Seeding Verses ---");
  console.log("Stage 2 — Downloading verses...");
  console.log("✓ Download complete");

  console.log("\nStage 2 — Validating dataset...");
  if (!Array.isArray(verses) || verses.length === 0) {
    throw new Error("Download data is invalid or empty. Expected non-empty array of verses.");
  }
  console.log("✓ Dataset format valid");

  console.log("\nStage 2 — Duplicate detection...");
  const uniqueKeys = new Set();
  const validVerses = [];
  let duplicateCount = 0;
  let invalidCount = 0;

  verses.forEach((v) => {
    // 1. Validate required fields
    const apiId = v.id || v.api_id;
    const { chapter_number, verse_number, text, transliteration } = v;

    if (!apiId || !chapter_number || !verse_number || !text || !transliteration) {
      console.warn(
        `[Warning] Skipping invalid record: missing required fields. ID: ${apiId || "N/A"}, Ch: ${
          chapter_number || "N/A"
        }, Verse: ${verse_number || "N/A"}`
      );
      invalidCount++;
      return;
    }

    // 2. Detect duplicates
    const key = `${chapter_number}-${verse_number}`;
    if (uniqueKeys.has(key)) {
      duplicateCount++;
      return; // Discard duplicate
    }
    
    uniqueKeys.add(key);
    validVerses.push(v);
  });

  if (validVerses.length === 0) {
    throw new Error("No valid verses found in the dataset to import.");
  }
  console.log("✓ Duplicate detection complete");

  // Print Import Summary
  console.log("\n=========================================");
  console.log(`Downloaded verses : ${verses.length}`);
  console.log(`Duplicate verses  : ${duplicateCount}`);
  console.log(`Invalid verses    : ${invalidCount}`);
  console.log(`Unique verses     : ${validVerses.length}`);
  console.log("=========================================");
  console.log("Proceeding with import...");

  console.log("\nStage 2 — Preparing batches...");
  const formattedVerses = validVerses.map((v) => {
    const chapterUuid = chapterMap.get(v.chapter_number);
    if (!chapterUuid) {
      throw new Error(`Chapter UUID lookup failed for chapter number ${v.chapter_number}`);
    }

    return {
      api_id: String(v.id || v.api_id),
      chapter_id: chapterUuid,
      chapter_number: v.chapter_number,
      verse_number: v.verse_number,
      slug: `chapter-${v.chapter_number}-verse-${v.verse_number}`,
      sanskrit_text: v.text,
      transliteration: v.transliteration,
      word_meanings: v.word_meanings || "",
      translation: "",
      translation_author: "",
      translation_author_id: "",
      translation_language: "",
      commentary: "",
      commentary_author: "",
      commentary_author_id: "",
      commentary_language: "",
      source: "ravisiyer/gita-data",
      source_version: "v1",
    };
  });
  console.log(`✓ ${formattedVerses.length} verses ready`);

  console.log("\nStage 2 — Uploading...");
  const batchSize = 50;
  let successCount = 0;
  const totalBatches = Math.ceil(formattedVerses.length / batchSize);

  for (let i = 0; i < formattedVerses.length; i += batchSize) {
    const batch = formattedVerses.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    const { data, error } = await supabase
      .from("gita_verses")
      .upsert(batch, { onConflict: "chapter_number, verse_number" })
      .select("id");

    if (error) {
      throw new Error(`Failed to upsert verses batch ${batchNum}/${totalBatches}: ${error.message}`);
    }

    successCount += data.length;
    console.log(`  ✓ Batch ${batchNum}/${totalBatches}`);
  }

  if (successCount === formattedVerses.length) {
    console.log(`\n✓ Verses Imported: ${successCount} / ${formattedVerses.length} | PASS`);
  } else {
    console.log(`\n❌ Verses Imported: ${successCount} / ${formattedVerses.length} | FAIL`);
    throw new Error(`Upserted verse count mismatch. Expected ${formattedVerses.length}, got ${successCount}.`);
  }

  return successCount;
}

module.exports = {
  seedVerses,
};
