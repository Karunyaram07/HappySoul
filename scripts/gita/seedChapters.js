// * GITA SEED PIPELINE - STAGE 1: CHAPTERS SEEDER
// ? Upserts chapter metadata into Supabase public.gita_chapters and maps chapter numbers.

/**
 * Stage 1: Seeds the 18 Gita chapters
 * @param {object} supabase - Supabase client instance
 * @param {Array<object>} chapters - List of chapters downloaded from dataset
 * @returns {Promise<Map<number, string>>} Map of chapter_number to DB UUID
 */
async function seedChapters(supabase, chapters) {
  console.log("\n--- STAGE 1: Seeding Chapters ---");
  
  if (!Array.isArray(chapters) || chapters.length !== 18) {
    throw new Error(`Expected exactly 18 chapters in dataset, but received ${chapters?.length}`);
  }
  
  console.log(`Upserting 18 chapters to Supabase...`);
  
  const rows = chapters.map((c) => ({
    api_id: String(c.id),
    chapter_number: c.chapter_number,
    name: c.name,
    slug: c.image_name, // e.g., 'arjuna-vishada-yoga'
    name_transliterated: c.name_transliterated,
    name_translated: c.name_translation,
    verses_count: c.verses_count,
    name_meaning: c.name_meaning,
    chapter_summary: c.chapter_summary,
    chapter_summary_hindi: c.chapter_summary_hindi || "",
    featured: c.chapter_number === 1 || c.chapter_number === 2, // highlight first two chapters as featured by default
    theme_overview: `Explore teachings on the essence of ${c.name_meaning}.`,
  }));
  
  const { data, error } = await supabase
    .from("gita_chapters")
    .upsert(rows, { onConflict: "chapter_number" })
    .select("chapter_number, id");
    
  if (error) {
    throw new Error(`Failed to upsert chapters: ${error.message}`);
  }
  
  // Verify matching counts
  const insertedCount = data.length;
  if (insertedCount === 18) {
    console.log(`✓ Chapters Imported: ${insertedCount} / 18 | PASS`);
  } else {
    console.log(`❌ Chapters Imported: ${insertedCount} / 18 | FAIL`);
    throw new Error(`Upserted count mismatch. Expected 18, but database recorded ${insertedCount}.`);
  }
  
  // Map chapter_number to UUID
  const chapterMap = new Map();
  data.forEach((row) => {
    chapterMap.set(row.chapter_number, row.id);
  });
  
  return chapterMap;
}

module.exports = {
  seedChapters,
};
