// * GITA EMBEDDING PIPELINE - DEV VERIFICATION SCRIPT
// ? Manually generates a query embedding vector to verify providers, retries, and formats.

const { loadEnv } = require("../scripts/gita/utils");
const { generateQueryEmbedding } = require("../lib/embeddings/index.js");

async function main() {
  console.log("=========================================");
  console.log("  QUERY EMBEDDING VERIFICATION TEST      ");
  console.log("=========================================");

  try {
    // 1. Load env configuration
    loadEnv();

    const prompt = "I feel anxious about my future.";
    console.log(`Prompt: "${prompt}"`);

    // 2. Execute query embedding generation
    const start = Date.now();
    const result = await generateQueryEmbedding(prompt);
    const duration = Date.now() - start;

    console.log("\n[Success] Query embedding generated successfully!");
    console.log(`Model used      : ${result.model}`);
    console.log(`Dimensions      : ${result.dimensions}`);
    console.log(`Vector Length   : ${result.embedding.length}`);
    console.log(`Generated At    : ${result.generatedAt}`);
    console.log(`Version         : ${result.version}`);
    console.log(`Elapsed Time    : ${duration}ms`);
    console.log("=========================================");

    // 3. Verify bad input validation
    console.log("\nVerifying bad input validation (passing empty prompt)...");
    try {
      await generateQueryEmbedding("   ");
      console.error("❌ Test Failed: Expected validation error to be thrown, but it succeeded.");
    } catch (valErr) {
      console.log(`✓ Input validation threw expected error: "${valErr.message}" | PASS`);
    }

  } catch (err) {
    console.error("\n❌ Test Failed with error:");
    console.error(err);
    process.exit(1);
  }
}

main();
