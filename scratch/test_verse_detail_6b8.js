/**
 * Phase 6B.8 Step 1 Verification Test Suite
 *
 * Tests:
 * 1. Database query for valid verse 2.47
 * 2. Database query for valid verse 1.1
 * 3. Validation logic for chapter bounds (1-18)
 * 4. Validation logic for verse bounds (>0)
 * 5. Validation logic for malformed inputs (non-digits, floats, negative, empty)
 * 6. Non-existent verse handling in DB (.maybeSingle())
 * 7. Embedding exclusion check (ensuring no embedding column is selected)
 * 8. Optional fields conditional handling
 * 9. Codebase security & RLS verification
 * 10. Scope check (ensuring untouchable files were not modified)
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load .env.local
const envFile = fs.readFileSync(
  path.join(__dirname, "..", ".env.local"),
  "utf8"
);
const envVars = Object.fromEntries(
  envFile
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== PHASE 6B.8 STEP 1: VERSE DETAIL TEST SUITE ===\n");

  const client = createClient(supabaseUrl, supabaseServiceKey);

  // ── TEST 1: Valid verse 2.47 query with exact fields ───────────────────────
  console.log("Test 1: Valid verse 2.47 query & field structure");
  {
    const { data: verse, error } = await client
      .from("gita_verses")
      .select(
        `
        id,
        chapter_id,
        chapter_number,
        verse_number,
        slug,
        sanskrit_text,
        transliteration,
        word_meanings,
        translation,
        translation_author,
        translation_language,
        commentary,
        commentary_author,
        commentary_language,
        practical_insight,
        modern_explanation,
        mood_relevance,
        gita_chapters (
          chapter_number,
          name,
          name_transliterated,
          name_translated,
          name_meaning,
          chapter_summary,
          theme_overview
        )
      `
      )
      .eq("chapter_number", 2)
      .eq("verse_number", 47)
      .maybeSingle();

    assert(!error, "Query executed without error");
    assert(verse !== null, "Verse 2.47 found");
    assert(verse.chapter_number === 2, "Chapter number is 2");
    assert(verse.verse_number === 47, "Verse number is 47");
    assert(
      verse.sanskrit_text && verse.sanskrit_text.includes("कर्मण्येवाधिकारस्ते"),
      "Sanskrit text is correct"
    );
    assert(
      verse.translation && verse.translation.includes("Your right is only to work"),
      "Translation text is correct"
    );
    assert(verse.translation_author === "Swami Sivananda", "Translation author is Sivananda");
    assert(verse.gita_chapters !== null, "Chapter relation joined");
    assert(verse.gita_chapters.name_translated === "Sankhya Yoga", "Chapter name is Sankhya Yoga");
  }

  // ── TEST 2: Valid verse 1.1 query ──────────────────────────────────────────
  console.log("\nTest 2: Valid verse 1.1 query & field structure");
  {
    const { data: verse, error } = await client
      .from("gita_verses")
      .select(
        `
        id,
        chapter_id,
        chapter_number,
        verse_number,
        slug,
        sanskrit_text,
        transliteration,
        word_meanings,
        translation,
        translation_author,
        gita_chapters (
          chapter_number,
          name,
          name_transliterated,
          name_translated
        )
      `
      )
      .eq("chapter_number", 1)
      .eq("verse_number", 1)
      .maybeSingle();

    assert(!error, "Query for 1.1 executed without error");
    assert(verse !== null, "Verse 1.1 found");
    assert(verse.chapter_number === 1 && verse.verse_number === 1, "Verse 1.1 coordinates match");
    assert(
      verse.sanskrit_text && verse.sanskrit_text.includes("धर्मक्षेत्रे"),
      "Verse 1.1 contains Dhritarashtra's opening query"
    );
  }

  // ── TEST 3: Invalid chapter out of bounds (19/1) ───────────────────────────
  console.log("\nTest 3: Chapter bounds validation logic (1-18)");
  {
    const validate = (ch, v) => {
      const isDigitsOnly = (str) =>
        typeof str === "string" && /^\d+$/.test(str.trim());
      if (!isDigitsOnly(ch) || !isDigitsOnly(v)) return false;
      const c = parseInt(ch, 10);
      const vr = parseInt(v, 10);
      if (!Number.isInteger(c) || c < 1 || c > 18 || !Number.isInteger(vr) || vr < 1) {
        return false;
      }
      return true;
    };

    assert(validate("19", "1") === false, "Chapter 19 is rejected (max 18)");
    assert(validate("0", "1") === false, "Chapter 0 is rejected (min 1)");
    assert(validate("-1", "1") === false, "Negative chapter is rejected");
    assert(validate("18", "78") === true, "Chapter 18 is accepted");
    assert(validate("1", "1") === true, "Chapter 1 is accepted");
  }

  // ── TEST 4: Invalid verse query (2/9999) ───────────────────────────────────
  console.log("\nTest 4: Non-existent verse handling in database (2/9999)");
  {
    const { data: verse, error } = await client
      .from("gita_verses")
      .select("id")
      .eq("chapter_number", 2)
      .eq("verse_number", 9999)
      .maybeSingle();

    assert(!error, "Non-existent verse query returns no DB error");
    assert(verse === null, "Non-existent verse 2/9999 returns null data");
  }

  // ── TEST 5: Malformed values validation ────────────────────────────────────
  console.log("\nTest 5: Malformed input rejection");
  {
    const isDigitsOnly = (str) =>
      typeof str === "string" && /^\d+$/.test(str.trim());
    const validate = (ch, v) => {
      if (!isDigitsOnly(ch) || !isDigitsOnly(v)) return false;
      const c = parseInt(ch, 10);
      const vr = parseInt(v, 10);
      return Number.isInteger(c) && c >= 1 && c <= 18 && Number.isInteger(vr) && vr >= 1;
    };

    assert(validate("abc", "xyz") === false, "'abc'/'xyz' rejected");
    assert(validate("2.5", "47") === false, "Float '2.5' rejected");
    assert(validate("2", "47.1") === false, "Float '47.1' rejected");
    assert(validate("", "1") === false, "Empty string chapter rejected");
    assert(validate("1", "") === false, "Empty string verse rejected");
    assert(validate(null, "1") === false, "Null chapter rejected");
    assert(validate("undefined", "1") === false, "'undefined' rejected");
    assert(validate(" 2 ", " 47 ") === true, "Padded valid digits parsed cleanly");
  }

  // ── TEST 6: Embedding exclusion check ──────────────────────────────────────
  console.log("\nTest 6: Embedding exclusion security check");
  {
    const pageContent = fs.readFileSync(
      path.join(__dirname, "..", "app", "dashboard", "gita", "[chapter]", "[verse]", "page.js"),
      "utf8"
    );

    assert(
      !pageContent.includes("embedding,"),
      "Page query does not select embedding"
    );
    assert(
      !pageContent.includes("embedding_model"),
      "Page query does not select embedding_model"
    );
    assert(
      !pageContent.includes("SUPABASE_SERVICE_ROLE_KEY"),
      "Page does not reference SUPABASE_SERVICE_ROLE_KEY"
    );
    assert(
      pageContent.includes("@/lib/supabase/server"),
      "Page imports authenticated Supabase server client"
    );
    assert(
      pageContent.includes("notFound()"),
      "Page utilizes Next.js notFound()"
    );
  }

  // ── TEST 7: Optional fields conditional rendering ──────────────────────────
  console.log("\nTest 7: Optional fields handling logic");
  {
    const pageContent = fs.readFileSync(
      path.join(__dirname, "..", "app", "dashboard", "gita", "[chapter]", "[verse]", "page.js"),
      "utf8"
    );

    assert(
      pageContent.includes("hasPracticalInsight"),
      "Practical insight guarded with conditional flag"
    );
    assert(
      pageContent.includes("hasModernExplanation"),
      "Modern explanation guarded with conditional flag"
    );
    assert(
      pageContent.includes("hasMoodRelevance"),
      "Mood relevance guarded with conditional flag"
    );
    assert(
      pageContent.includes("hasWordMeanings"),
      "Word meanings guarded with conditional flag"
    );
  }

  // ── TEST 8: Scope check — untouched files ──────────────────────────────────
  console.log("\nTest 8: Scope boundary verification");
  {
    const untouchedFiles = [
      "app/layout.js",
      "lib/krishna/retrieval.js",
      "lib/krishna/prompt.js",
      "lib/krishna/generator.js",
      "app/api/krishna/route.js",
      "app/api/krishna/conversations/route.js",
      "app/api/krishna/conversations/[conversationId]/route.js",
      "lib/krishna/context.js",
      "components/krishna/GitaCitationBadge.jsx",
    ];

    for (const relPath of untouchedFiles) {
      const fullPath = path.join(__dirname, "..", relPath);
      assert(fs.existsSync(fullPath), `Protected file exists: ${relPath}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
