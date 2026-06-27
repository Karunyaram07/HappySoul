// * GITA SEED PIPELINE - MAIN RUNNER
// ? Coordinates downloading Gita JSON files, executing staged seeding, and updating metadata.

const { loadEnv, calculateChecksum } = require("./utils");
const { fetchWithRetry } = require("./fetch");
const { seedChapters } = require("./seedChapters");
const { seedVerses } = require("./seedVerses");
const { enrichTranslations } = require("./enrichTranslations");
const { enrichCommentaries } = require("./enrichCommentaries");
const { createClient } = require("@supabase/supabase-js");

async function main() {
  console.log("=========================================");
  console.log("  HAPPY SOUL - GITA DATA SEED PIPELINE   ");
  console.log("=========================================");
  
  // 1. Load env variables
  loadEnv();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env configuration.");
  }
  
  // 2. Resolve Next.js GITA_CONFIG dynamically using ES modules dynamic import
  const { GITA_CONFIG } = await import("../../lib/gita/config.js");
  const baseUrl = GITA_CONFIG.DATASET_BASE_URL;
  
  console.log(`Config Base URL: ${baseUrl}`);
  console.log(`Preferred Translator: ${GITA_CONFIG.DEFAULT_TRANSLATOR}`);
  console.log(`Preferred Commentary: ${GITA_CONFIG.DEFAULT_COMMENTARY}`);
  
  // 3. Concurrently fetch all JSON files with automatic retries
  console.log("\nDownloading all dataset JSON files concurrently...");
  const [chaptersData, versesData, translationsData, commentariesData] = await Promise.all([
    fetchWithRetry(`${baseUrl}/chapters.json`),
    fetchWithRetry(`${baseUrl}/verse.json`),
    fetchWithRetry(`${baseUrl}/translation.json`),
    fetchWithRetry(`${baseUrl}/commentary.json`),
  ]);
  
  // 4. Calculate content checksum
  const combinedRaw = JSON.stringify(chaptersData) +
                      JSON.stringify(versesData) +
                      JSON.stringify(translationsData) +
                      JSON.stringify(commentariesData);
  const checksum = calculateChecksum(combinedRaw);
  console.log(`Dataset Checksum computed: ${checksum}`);
  
  // 5. Initialize Supabase Client using service role bypass key
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // 6. Run staged imports
  // Stage 1: Chapters
  const chapterMap = await seedChapters(supabase, chaptersData);
  
  // Stage 2: Verses
  const versesCount = await seedVerses(supabase, versesData, chapterMap);
  
  // Stage 3: Translations
  await enrichTranslations(supabase, translationsData, GITA_CONFIG);
  
  // Stage 4: Commentaries
  await enrichCommentaries(supabase, commentariesData, GITA_CONFIG);
  
  // 7. Write Seed Metadata log record
  console.log("\nLogging execution summary to seed_metadata...");
  const { error: metaError } = await supabase
    .from("seed_metadata")
    .insert([{
      dataset_name: "Bhagavad Gita",
      translator: GITA_CONFIG.DEFAULT_TRANSLATOR,
      commentary: GITA_CONFIG.DEFAULT_COMMENTARY,
      version: GITA_CONFIG.LIBRARY_VERSION,
      chapters_count: chapterMap.size,
      verses_count: versesCount,
      checksum: checksum
    }]);
    
  if (metaError) {
    console.error(`[Warning] Failed to write seed metadata: ${metaError.message}`);
  } else {
    console.log("✓ Seeding session logged in seed_metadata | PASS");
  }
  
  console.log("\n=========================================");
  console.log("  GITA SEED PIPELINE COMPLETED SUCCESSFULLY ");
  console.log("=========================================");
}

main().catch((err) => {
  console.error("\n❌ Seeding pipeline failed with error:");
  console.error(err);
  process.exit(1);
});
