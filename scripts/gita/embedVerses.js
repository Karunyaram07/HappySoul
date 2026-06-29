// * GITA SEED PIPELINE - EMBEDDINGS SEEDER
// ? Generates text vectors sequentially using gemini-embedding-001 and saves them in gita_verses.

const fs = require("fs");
const path = require("path");
const { loadEnv } = require("./utils");
const { createClient } = require("@supabase/supabase-js");
const { EMBEDDING_CONFIG, generateDocumentEmbedding, formatVerseForEmbedding } = require("../../lib/embeddings/index.js");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function saveFailures(failures) {
  const filePath = path.join(__dirname, "../../failed_embeddings.json");
  if (failures.length === 0) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }
  fs.writeFileSync(filePath, JSON.stringify(failures, null, 2), "utf-8");
}

async function main() {
  console.log("=========================================");
  console.log("  HAPPY SOUL - GITA EMBEDDING PIPELINE   ");
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

  // 3. Initialize Supabase Client using service role bypass key
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 4. Fetch all verses with their related chapters
  console.log("Fetching verses from database...");
  const { data: verses, error: fetchError } = await supabase
    .from("gita_verses")
    .select("*, gita_chapters(*)")
    .order("chapter_number", { ascending: true })
    .order("verse_number", { ascending: true });

  if (fetchError) {
    throw new Error(`Failed to fetch verses: ${fetchError.message}`);
  }

  console.log(`Fetched ${verses.length} verses.`);

  // 5. Smart Skip Filter
  const versesToEmbed = verses.filter((v) => {
    const hasEmbedding = !!v.embedding;
    const modelMatches = v.embedding_model === EMBEDDING_CONFIG.MODEL_NAME;
    const versionMatches = v.embedding_version === EMBEDDING_CONFIG.EMBEDDING_VERSION;
    const textVersionMatches = v.embedding_text_version === EMBEDDING_CONFIG.EMBEDDING_TEXT_VERSION;
    return !(hasEmbedding && modelMatches && versionMatches && textVersionMatches);
  });

  const totalToProcess = versesToEmbed.length;
  if (totalToProcess === 0) {
    console.log("✓ All verses have up-to-date embeddings. Skipping generation.");
    // Clear out any old failure log if everything is up to date
    saveFailures([]);
    process.exit(0);
  }

  console.log(`Found ${totalToProcess} verses needing embedding generation (out of ${verses.length} total).`);
  console.log(`Starting generation using model ${EMBEDDING_CONFIG.MODEL_NAME}...`);

  const startTime = Date.now();
  let successCount = 0;
  let failuresCount = 0;
  const failedList = [];
  const batchSize = EMBEDDING_CONFIG.BATCH_SIZE;
  const totalBatches = Math.ceil(totalToProcess / batchSize);

  for (let i = 0; i < totalToProcess; i += batchSize) {
    const batch = versesToEmbed.slice(i, i + batchSize);
    const currentBatchNum = Math.floor(i / batchSize) + 1;

    console.log(`\n--- Processing Batch ${currentBatchNum} / ${totalBatches} ---`);

    const validUpdates = [];

    // Process each verse in the batch sequentially to prevent concurrent request spikes
    for (const v of batch) {
      try {
        const formattedText = formatVerseForEmbedding(v);
        
        // Generate embedding (retries and validation are handled internally by the provider)
        const embedResult = await generateDocumentEmbedding(formattedText);
        const vector = embedResult.embedding;

        validUpdates.push({
          id: v.id,
          embedding: vector,
          embedding_model: EMBEDDING_CONFIG.MODEL_NAME,
          embedding_version: EMBEDDING_CONFIG.EMBEDDING_VERSION,
          embedding_text_version: EMBEDDING_CONFIG.EMBEDDING_TEXT_VERSION,
          embedded_at: new Date().toISOString(),
          chapter_number: v.chapter_number,
          verse_number: v.verse_number
        });

        console.log(`  ✓ Generated vector for Ch ${v.chapter_number}, Verse ${v.verse_number}`);

        // Throttling delay: 2000ms delay between calls
        await sleep(2000);
      } catch (err) {
        console.error(`  ❌ Failed for Ch ${v.chapter_number}, Verse ${v.verse_number}: ${err.message}`);
        failuresCount++;
        failedList.push({
          id: v.id,
          chapter: v.chapter_number,
          verse: v.verse_number,
          reason: err.message,
        });
      }
    }

    // Perform database updates after completing the batch
    if (validUpdates.length > 0) {
      console.log(`  Updating database with ${validUpdates.length} vectors...`);
      await Promise.all(
        validUpdates.map(async (update) => {
          const { error: updateError } = await supabase
            .from("gita_verses")
            .update({
              embedding: update.embedding,
              embedding_model: update.embedding_model,
              embedding_version: update.embedding_version,
              embedding_text_version: update.embedding_text_version,
              embedded_at: update.embedded_at,
            })
            .eq("id", update.id);

          if (updateError) {
            console.error(`  ❌ Database write failed for Ch ${update.chapter_number}, Verse ${update.verse_number}: ${updateError.message}`);
            failuresCount++;
            failedList.push({
              id: update.id,
              chapter: update.chapter_number,
              verse: update.verse_number,
              reason: `DB Write Error: ${updateError.message}`,
            });
          } else {
            successCount++;
          }
        })
      );
    }

    // Save current failure log
    saveFailures(failedList);

    // Verify count of embedded rows in the database after every batch
    const { count: dbEmbeddedCount, error: countError } = await supabase
      .from("gita_verses")
      .select("*", { count: "exact", head: true })
      .not("embedding", "is", null);
      
    if (!countError) {
      console.log(`  ✓ Database Count (embedding IS NOT NULL): ${dbEmbeddedCount} / ${verses.length}`);
    }

    // Display production progress metrics
    const elapsedMs = Date.now() - startTime;
    const avgMsPerVerse = successCount > 0 ? elapsedMs / successCount : 0;
    const remainingVerses = totalToProcess - (i + batch.length);
    const etaMs = remainingVerses * avgMsPerVerse;

    function formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m}m ${s}s`;
    }

    console.log(`\nProcessed:      ${successCount + failuresCount} / ${totalToProcess}`);
    console.log(`Success:        ${successCount}`);
    console.log(`Failed:         ${failuresCount}`);
    console.log(`Elapsed:        ${formatTime(elapsedMs)}`);
    console.log(`ETA:            ${formatTime(etaMs)}`);
    console.log(`Current Batch:  ${currentBatchNum} / ${totalBatches}`);
  }

  // 6. Log embedding session metadata log
  console.log("\nLogging embedding run summary to seed_metadata...");
  const { error: metaError } = await supabase
    .from("seed_metadata")
    .insert([{
      dataset_name: "Bhagavad Gita Embeddings",
      translator: GITA_CONFIG.DEFAULT_TRANSLATOR,
      commentary: GITA_CONFIG.DEFAULT_COMMENTARY,
      version: GITA_CONFIG.LIBRARY_VERSION,
      chapters_count: 18,
      verses_count: 701,
      embedding_model: EMBEDDING_CONFIG.MODEL_NAME,
      embedding_dimensions: EMBEDDING_CONFIG.DIMENSIONS,
      embedded_rows: successCount,
      embedding_version: EMBEDDING_CONFIG.EMBEDDING_VERSION,
      embedding_text_version: EMBEDDING_CONFIG.EMBEDDING_TEXT_VERSION,
      completed_at: new Date().toISOString()
    }]);

  if (metaError) {
    console.error(`[Warning] Failed to write seed metadata: ${metaError.message}`);
  } else {
    console.log("✓ Seeding session logged in seed_metadata | PASS");
  }

  const finalDuration = Date.now() - startTime;
  const minutes = Math.floor(finalDuration / 60000);
  const seconds = Math.floor((finalDuration % 60000) / 1000);

  console.log("\n=========================================");
  console.log("  EMBEDDING GENERATION SUMMARY           ");
  console.log("=========================================");
  console.log(`Total verses processed : ${totalToProcess}`);
  console.log(`Successfully embedded  : ${successCount}`);
  console.log(`Skipped                : ${verses.length - totalToProcess}`);
  console.log(`Failed                 : ${failuresCount}`);
  console.log(`Total execution time   : ${minutes}m ${seconds}s`);
  console.log("=========================================");
}

main().catch((err) => {
  console.error("\n❌ Seeding pipeline failed with error:");
  console.error(err);
  process.exit(1);
});
