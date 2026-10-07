// Test script: Phase 6B.2 — Retrieval Layer Verification
// Run from project root via: node scratch/test_retrieval_6b2.js
//
// Tests the full retrieval pipeline:
//   user question → generateQueryEmbedding() → retrieveRelevantVerses(supabase, query, options)
//
// Uses service-role client directly in this test script only.
// Exercises:
//   - Input validation (including MAX_QUERY_LENGTH = 1000)
//   - Live semantic retrieval on realistic queries (English, Hindi, Telugu)
//   - Cross-lingual semantic alignment (English, Telugu, Hindi, Telugu transliteration)
//   - Top-5 verse ID overlap & Jaccard index
//   - Irrelevant negative control queries
//   - Threshold calibration metrics (top-1, 5th, gap, control-query margin)
//   - Theme fallback (fallbackWithoutThemes + usedThemeFallback)
//   - Chapter filtering

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const { retrieveRelevantVerses, RETRIEVAL_DEFAULTS } = require("../lib/krishna/retrieval");

// ── Instantiate Supabase service-role client for test runner ──────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Test runner state ─────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const testResults = [];

function pass(testName, detail = "") {
  passed++;
  testResults.push({ status: "✓ PASS", test: testName, detail });
  console.log(`  ✓ PASS  ${testName}${detail ? " — " + detail : ""}`);
}

function fail(testName, detail = "") {
  failed++;
  testResults.push({ status: "✗ FAIL", test: testName, detail });
  console.log(`  ✗ FAIL  ${testName}${detail ? " — " + detail : ""}`);
}

function header(label) {
  console.log(`\n${"─".repeat(65)}`);
  console.log(`  ${label}`);
  console.log(`${"─".repeat(65)}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printVerseCard(verse, index) {
  console.log(
    `    [${index + 1}] BG ${verse.chapterNumber}.${verse.verseNumber} | ` +
    `Chapter: "${verse.chapterName}" | ` +
    `Similarity: ${verse.similarity.toFixed(6)}`
  );
  const preview = verse.translation
    ? verse.translation.substring(0, 95).replace(/\n/g, " ") + (verse.translation.length > 95 ? "..." : "")
    : "(no translation)";
  console.log(`         Translation: "${preview}"`);
}

// ── Realistic user queries (Group B) ──────────────────────────────────────────
const REALISTIC_QUERIES = [
  {
    id: "Q1",
    label: "Career / life direction",
    query: "I am confused about my career and don't know which path to choose.",
  },
  {
    id: "Q2",
    label: "Discipline / procrastination",
    query: "How can I develop discipline and stop procrastinating?",
  },
  {
    id: "Q3",
    label: "Anger management",
    query: "I get angry very easily. What does the Bhagavad Gita teach about controlling anger?",
  },
  {
    id: "Q4",
    label: "Detachment from results",
    query: "How can I stop being attached to the results of my work?",
  },
  {
    id: "Q5",
    label: "Fear / anxiety about failure",
    query: "I am afraid of failure and constantly worry about the future.",
  },
  {
    id: "Q6",
    label: "Decision making",
    query: "How can I make the right decision when I am confused between two choices?",
  },
  {
    id: "Q7",
    label: "Lost motivation",
    query: "I have lost motivation and don't feel like doing anything.",
  },
  {
    id: "Q8",
    label: "Spiritual growth / peaceful mind",
    query: "How can I develop a more peaceful and spiritual mind?",
  },
  {
    id: "Q9",
    label: "Telugu — life path confusion",
    query: "నాకు నా జీవితంలో ఏ మార్గాన్ని ఎంచుకోవాలో అర్థం కావడం లేదు.",
  },
  {
    id: "Q10",
    label: "Hindi — anger & mind control",
    query: "मैं अपने मन और क्रोध पर नियंत्रण कैसे पा सकता हूँ?",
  },
];

// ── Semantic parallel queries across languages (Group E) ──────────────────────
// The same core semantic question in 4 linguistic representations:
const MULTILINGUAL_PARALLEL = [
  {
    lang: "English",
    code: "en",
    query: "How can I find peace of mind when everything is chaotic?",
  },
  {
    lang: "Telugu (Native)",
    code: "te",
    query: "అన్నీ అస్తవ్యస్తంగా ఉన్నప్పుడు నేను మనశ్శాంతిని ఎలా పొందగలను?",
  },
  {
    lang: "Hindi (Devanagari)",
    code: "hi",
    query: "जब सब कुछ अशांत हो तो मैं मन की शांति कैसे पा सकता हूँ?",
  },
  {
    lang: "Telugu (Transliteration)",
    code: "te-Latn",
    query: "Anni asthavyasthangaa unnappudu nenu manashanthini ela pondagalanu?",
  },
];

// ── Irrelevant negative control queries (Group F) ─────────────────────────────
const IRRELEVANT_CONTROLS = [
  {
    id: "CTRL1",
    label: "Culinary recipe",
    query: "What is the recipe to make Italian pasta carbonara with egg yolks and pancetta?",
  },
  {
    id: "CTRL2",
    label: "Plumbing repair",
    query: "How do I fix a leaking PVC pipe joint under the kitchen sink with pipe tape?",
  },
  {
    id: "CTRL3",
    label: "Stock market data",
    query: "What are the latest closing stock prices and market capitalizations of Apple and Microsoft?",
  },
  {
    id: "CTRL4",
    label: "Software tool config",
    query: "How do I configure Vite build rollup options in a React TypeScript project?",
  },
];

async function runSuite() {
  console.log(`\n${"═".repeat(65)}`);
  console.log("  PHASE 6B.2 — RETRIEVAL LAYER ENHANCED VERIFICATION");
  console.log(`${"═".repeat(65)}`);
  console.log(`  Defaults: threshold=${RETRIEVAL_DEFAULTS.MATCH_THRESHOLD}, count=${RETRIEVAL_DEFAULTS.MATCH_COUNT}, max_len=${RETRIEVAL_DEFAULTS.MAX_QUERY_LENGTH}`);

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP A: Input Validation & Client Checks
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP A — Input Validation & Client Checks");

  // A1: Missing Supabase client
  try {
    await retrieveRelevantVerses(null, "Test query");
    fail("A1: Reject missing Supabase client", "Should have thrown");
  } catch (e) {
    if (e.message.includes("Supabase client is required")) {
      pass("A1: Reject missing Supabase client", e.message);
    } else {
      fail("A1: Reject missing Supabase client", `Unexpected error: ${e.message}`);
    }
  }

  // A2: Reject null query
  try {
    await retrieveRelevantVerses(supabase, null);
    fail("A2: Reject null query", "Should have thrown");
  } catch (e) {
    if (e.message.includes("non-empty string")) {
      pass("A2: Reject null query", e.message);
    } else {
      fail("A2: Reject null query", `Unexpected error: ${e.message}`);
    }
  }

  // A3: Reject empty query
  try {
    await retrieveRelevantVerses(supabase, "");
    fail("A3: Reject empty string", "Should have thrown");
  } catch (e) {
    if (e.message.includes("non-empty string")) {
      pass("A3: Reject empty string", e.message);
    } else {
      fail("A3: Reject empty string", `Unexpected error: ${e.message}`);
    }
  }

  // A4: Reject whitespace query
  try {
    await retrieveRelevantVerses(supabase, "   \n\t  ");
    fail("A4: Reject whitespace-only query", "Should have thrown");
  } catch (e) {
    if (e.message.includes("blank or whitespace only")) {
      pass("A4: Reject whitespace-only query", e.message);
    } else {
      fail("A4: Reject whitespace-only query", `Unexpected error: ${e.message}`);
    }
  }

  // A5: Reject oversized query (> 1000 chars)
  try {
    await retrieveRelevantVerses(supabase, "x".repeat(RETRIEVAL_DEFAULTS.MAX_QUERY_LENGTH + 1));
    fail("A5: Reject oversized query", "Should have thrown");
  } catch (e) {
    if (e.message.includes("maximum length of 1000")) {
      pass("A5: Reject oversized query (>1000 chars)", `Correctly rejected at ${RETRIEVAL_DEFAULTS.MAX_QUERY_LENGTH + 1} chars`);
    } else {
      fail("A5: Reject oversized query", `Unexpected error: ${e.message}`);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP B: Live Retrieval Pipeline (10 queries, including Hindi & Telugu)
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP B — Live Retrieval Pipeline (10 Realistic Queries)");
  console.log("  Running sequentially with 1.5s delay to respect Gemini API limits...\n");

  const bResults = [];

  for (const item of REALISTIC_QUERIES) {
    console.log(`\n  → ${item.id}: ${item.label}`);
    console.log(`     Query: "${item.query}"`);

    try {
      const res = await retrieveRelevantVerses(supabase, item.query);
      bResults.push({ item, res, error: null });
      console.log(`     Results: ${res.count} verse(s)`);
      res.verses.forEach((v, i) => printVerseCard(v, i));
    } catch (err) {
      bResults.push({ item, res: null, error: err });
      console.log(`     ✗ Error: ${err.message}`);
    }

    await sleep(1500);
  }

  header("GROUP B — Assertions");

  const bSuccess = bResults.filter((r) => r.res !== null);
  const bErrors = bResults.filter((r) => r.error !== null);

  if (bErrors.length === 0) {
    pass(`B1: All ${REALISTIC_QUERIES.length} queries completed successfully`, `${bSuccess.length}/${REALISTIC_QUERIES.length}`);
  } else {
    fail("B1: Queries completed without error", `${bErrors.length} failed`);
  }

  const bEmpty = bSuccess.filter((r) => r.res.count === 0);
  if (bEmpty.length === 0) {
    pass("B2: All queries returned at least 1 verse (zero empty)", `${bSuccess.length}/${bSuccess.length} non-empty`);
  } else {
    fail("B2: Empty results returned", `Empty: ${bEmpty.map((r) => r.item.id).join(", ")}`);
  }

  // Ordering check
  let allSorted = true;
  for (const { item, res } of bSuccess) {
    if (res.verses.length > 1) {
      const sims = res.verses.map((v) => v.similarity);
      const isSorted = sims.every((v, i) => i === 0 || sims[i - 1] >= v);
      if (!isSorted) allSorted = false;
    }
  }
  if (allSorted) {
    pass("B3: All results ordered strictly by descending similarity");
  } else {
    fail("B3: Ordering violated in some results");
  }

  // Similarity range check
  let allInRange = true;
  for (const { res } of bSuccess) {
    for (const v of res.verses) {
      if (v.similarity < 0.0 || v.similarity > 1.0) allInRange = false;
    }
  }
  if (allInRange) {
    pass("B4: All similarity scores in valid range [0.0, 1.0]");
  } else {
    fail("B4: Similarity score out of bounds");
  }

  // Required fields check
  const requiredFields = [
    "id", "chapterNumber", "chapterName", "verseNumber",
    "sanskritText", "transliteration", "translation",
    "commentary", "similarity"
  ];
  let fieldsOk = true;
  for (const { res } of bSuccess) {
    for (const v of res.verses) {
      for (const f of requiredFields) {
        if (v[f] === undefined || v[f] === null) fieldsOk = false;
      }
    }
  }
  if (fieldsOk) {
    pass("B5: All required verse fields present on every result");
  } else {
    fail("B5: Missing required fields on verse results");
  }

  // Metadata check
  const metaOk = bSuccess.every((r) => r.res.meta && r.res.meta.embeddingModel === "gemini-embedding-001" && r.res.meta.embeddingDimensions === 768);
  if (metaOk) {
    pass("B6: Result metadata contains embedding model & dimensions (768)");
  } else {
    fail("B6: Metadata incomplete");
  }

  // Hindi query specific check
  const hindiResult = bSuccess.find((r) => r.item.id === "Q10");
  if (hindiResult && hindiResult.res.count > 0) {
    pass(
      "B7: Hindi query (Q10) returned results",
      `${hindiResult.res.count} verses, top: BG ${hindiResult.res.verses[0].chapterNumber}.${hindiResult.res.verses[0].verseNumber} (sim: ${hindiResult.res.verses[0].similarity.toFixed(4)})`
    );
  } else {
    fail("B7: Hindi query failed to return results");
  }

  // Telugu query specific check
  const teluguResult = bSuccess.find((r) => r.item.id === "Q9");
  if (teluguResult && teluguResult.res.count > 0) {
    pass(
      "B8: Telugu query (Q9) returned results",
      `${teluguResult.res.count} verses, top: BG ${teluguResult.res.verses[0].chapterNumber}.${teluguResult.res.verses[0].verseNumber} (sim: ${teluguResult.res.verses[0].similarity.toFixed(4)})`
    );
  } else {
    fail("B8: Telugu query failed to return results");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP C: Optional Filters & Theme Fallback
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP C — Optional Filters & Theme Fallback");

  // C1: Chapter filtering
  console.log("\n  → C1: filterChapter=2 restriction");
  try {
    const chRes = await retrieveRelevantVerses(supabase, "Sankhya yoga and the eternal soul", {
      filterChapter: 2,
      matchThreshold: 0.5,
      matchCount: 5,
    });
    const nonCh2 = chRes.verses.filter((v) => v.chapterNumber !== 2);
    if (nonCh2.length === 0 && chRes.count > 0) {
      pass("C1: filterChapter=2 restricts results to chapter 2", `${chRes.count} verse(s), all chapter 2`);
    } else {
      fail("C1: filterChapter=2 restriction", `${nonCh2.length} non-chapter-2 results or 0 count`);
    }
  } catch (err) {
    fail("C1: filterChapter=2 test error", err.message);
  }

  await sleep(1500);

  // C2a: Theme fallback ENABLED (default: true)
  // Since themes table is empty, filter_themes => 0 rows, so it should fallback and return verses!
  console.log("\n  → C2a: filterThemes=['Peace'] with fallbackWithoutThemes=true (default)");
  try {
    const themeFbRes = await retrieveRelevantVerses(supabase, "Finding inner peace and tranquility", {
      filterThemes: ["Peace"],
      fallbackWithoutThemes: true,
      matchThreshold: 0.5,
      matchCount: 5,
    });
    if (themeFbRes.count > 0 && themeFbRes.meta.usedThemeFallback === true) {
      pass(
        "C2a: Theme fallback activated when themes empty",
        `Retrieved ${themeFbRes.count} verses, usedThemeFallback=true`
      );
    } else {
      fail("C2a: Theme fallback failed", `count=${themeFbRes.count}, usedThemeFallback=${themeFbRes.meta.usedThemeFallback}`);
    }
  } catch (err) {
    fail("C2a: Theme fallback test error", err.message);
  }

  await sleep(1500);

  // C2b: Theme fallback DISABLED (fallbackWithoutThemes: false)
  // When fallback is disabled and themes table is empty, it MUST return 0 results and usedThemeFallback=false.
  console.log("\n  → C2b: filterThemes=['Peace'] with fallbackWithoutThemes=false");
  try {
    const themeNoFbRes = await retrieveRelevantVerses(supabase, "Finding inner peace and tranquility", {
      filterThemes: ["Peace"],
      fallbackWithoutThemes: false,
      matchThreshold: 0.5,
      matchCount: 5,
    });
    if (themeNoFbRes.count === 0 && themeNoFbRes.meta.usedThemeFallback === false) {
      pass(
        "C2b: Theme fallback disabled returns 0 results as expected",
        `count=0, usedThemeFallback=false`
      );
    } else {
      fail("C2b: Expected 0 results when fallback is disabled", `count=${themeNoFbRes.count}`);
    }
  } catch (err) {
    fail("C2b: Theme fallback disabled error", err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP D: Custom Retrieval Settings
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP D — Custom Retrieval Settings");
  await sleep(1500);

  console.log("\n  → D1: Sensitivity calibration (threshold=0.4 vs default 0.5)");
  try {
    const defaultRes = await retrieveRelevantVerses(supabase, "I am suffering and need guidance", {
      matchThreshold: 0.5,
      matchCount: 5,
    });
    await sleep(1500);
    const lowRes = await retrieveRelevantVerses(supabase, "I am suffering and need guidance", {
      matchThreshold: 0.4,
      matchCount: 10,
    });

    if (lowRes.count >= defaultRes.count) {
      pass(
        "D1: Lower threshold returns >= results vs default",
        `threshold=0.4 → ${lowRes.count} verses; threshold=0.5 → ${defaultRes.count} verses`
      );
    } else {
      fail("D1: Lower threshold failed to yield more/equal verses");
    }
  } catch (err) {
    fail("D1: Custom settings error", err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP E: Cross-Lingual Semantic Parallel Alignment
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP E — Cross-Lingual Semantic Parallel Alignment");
  console.log("  Testing the exact same semantic question across 4 language representations:\n");

  const multiResults = {};

  for (const item of MULTILINGUAL_PARALLEL) {
    console.log(`  → [${item.lang}]`);
    console.log(`     Query: "${item.query}"`);
    try {
      const res = await retrieveRelevantVerses(supabase, item.query, { matchCount: 5 });
      multiResults[item.code] = {
        lang: item.lang,
        query: item.query,
        res,
        verseIds: res.verses.map((v) => `BG ${v.chapterNumber}.${v.verseNumber}`),
      };
      console.log(`     Top-5 Verse IDs: ${multiResults[item.code].verseIds.join(", ")}`);
      res.verses.forEach((v, i) => {
        console.log(`       [${i + 1}] BG ${v.chapterNumber}.${v.verseNumber} (sim: ${v.similarity.toFixed(4)}) - "${v.translation.substring(0, 70)}..."`);
      });
    } catch (err) {
      console.log(`     ✗ Error: ${err.message}`);
    }
    await sleep(1500);
  }

  // Compare overlap across pairs
  console.log("\n  ── Cross-Lingual Top-5 Overlap Comparison ──");
  const pairs = [
    ["en", "te", "English vs Telugu (Native)"],
    ["en", "hi", "English vs Hindi (Devanagari)"],
    ["en", "te-Latn", "English vs Telugu (Transliteration)"],
    ["hi", "te-Latn", "Hindi vs Telugu (Transliteration)"],
    ["te", "te-Latn", "Telugu (Native) vs Telugu (Transliteration)"],
    ["hi", "te", "Hindi vs Telugu (Native)"],
  ];

  let anyCrossOverlap = false;

  console.log(`\n  ${"Pair".padEnd(45)} | ${"Shared Verses".padEnd(20)} | ${"Overlap Count".padEnd(15)} | Jaccard Index`);
  console.log(`  ${"─".repeat(45)} | ${"─".repeat(20)} | ${"─".repeat(15)} | ${"─".repeat(15)}`);

  for (const [codeA, codeB, label] of pairs) {
    if (multiResults[codeA] && multiResults[codeB]) {
      const setA = new Set(multiResults[codeA].verseIds);
      const setB = new Set(multiResults[codeB].verseIds);
      const intersection = [...setA].filter((x) => setB.has(x));
      const union = new Set([...setA, ...setB]);
      const jaccard = (intersection.length / union.size).toFixed(3);

      if (intersection.length > 0) anyCrossOverlap = true;

      console.log(
        `  ${label.padEnd(45)} | ` +
        `${(intersection.join(", ") || "none").padEnd(20)} | ` +
        `${(intersection.length + " / 5").padEnd(15)} | ` +
        `${jaccard}`
      );
    }
  }

  if (anyCrossOverlap) {
    pass(
      "E1: Cross-lingual queries retrieve semantically overlapping Gita verses",
      "Shared canonical verses identified across script boundaries"
    );
  } else {
    fail("E1: Zero cross-lingual verse overlap detected");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP F: Irrelevant Negative Control Queries
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP F — Negative Control Queries (Irrelevant Topics)");
  console.log("  Testing non-philosophical / unrelated queries against the Gita corpus:\n");

  const controlResults = [];

  for (const ctrl of IRRELEVANT_CONTROLS) {
    console.log(`  → ${ctrl.id}: ${ctrl.label}`);
    console.log(`     Query: "${ctrl.query}"`);
    try {
      const res = await retrieveRelevantVerses(supabase, ctrl.query, {
        matchThreshold: 0.0, // get top verses regardless of threshold to inspect raw scores
        matchCount: 5,
      });
      const topSim = res.verses.length > 0 ? res.verses[0].similarity : 0;
      controlResults.push({ ctrl, res, topSim });
      console.log(`     Top match: BG ${res.verses[0]?.chapterNumber}.${res.verses[0]?.verseNumber} (similarity: ${topSim.toFixed(4)})`);
    } catch (err) {
      console.log(`     ✗ Error: ${err.message}`);
    }
    await sleep(1500);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP G: Threshold Calibration Report
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP G — Threshold Calibration & Separation Analysis");

  // Compute calibration on realistic queries
  const calibrationRows = [];
  for (const { item, res } of bSuccess) {
    const top1 = res.verses[0]?.similarity || 0;
    const fifth = res.verses[4]?.similarity || res.verses[res.verses.length - 1]?.similarity || 0;
    const gap = top1 - fifth;
    calibrationRows.push({
      id: item.id,
      label: item.label,
      top1,
      fifth,
      gap,
    });
  }

  console.log("\n  ── Meaningful Query Score Distribution (Top-1 to Rank-5) ──");
  console.log(`  ${"Query ID".padEnd(8)} | ${"Topic".padEnd(30)} | ${"Top-1 Sim".padEnd(12)} | ${"Rank-5 Sim".padEnd(12)} | ${"Spread (Gap)".padEnd(12)}`);
  console.log(`  ${"─".repeat(8)} | ${"─".repeat(30)} | ${"─".repeat(12)} | ${"─".repeat(12)} | ${"─".repeat(12)}`);

  for (const row of calibrationRows) {
    console.log(
      `  ${row.id.padEnd(8)} | ` +
      `${row.label.substring(0, 30).padEnd(30)} | ` +
      `${row.top1.toFixed(4).padEnd(12)} | ` +
      `${row.fifth.toFixed(4).padEnd(12)} | ` +
      `${row.gap.toFixed(4).padEnd(12)}`
    );
  }

  const avgTop1 = calibrationRows.reduce((acc, r) => acc + r.top1, 0) / calibrationRows.length;
  const avgFifth = calibrationRows.reduce((acc, r) => acc + r.fifth, 0) / calibrationRows.length;
  const minFifth = Math.min(...calibrationRows.map((r) => r.fifth));

  console.log(`\n  Averages for Meaningful Queries:`);
  console.log(`    Average Top-1 Similarity:    ${avgTop1.toFixed(4)}`);
  console.log(`    Average Rank-5 Similarity:   ${avgFifth.toFixed(4)}`);
  console.log(`    Lowest Rank-5 Similarity:    ${minFifth.toFixed(4)}`);

  console.log("\n  ── Irrelevant Control Query Raw Scores ──");
  console.log(`  ${"Control ID".padEnd(10)} | ${"Topic".padEnd(25)} | ${"Top Sim (Raw)".padEnd(15)} | Below Default 0.5?`);
  console.log(`  ${"─".repeat(10)} | ${"─".repeat(25)} | ${"─".repeat(15)} | ${"─".repeat(20)}`);

  let maxControlScore = 0;
  for (const c of controlResults) {
    if (c.topSim > maxControlScore) maxControlScore = c.topSim;
    const belowDefault = c.topSim < RETRIEVAL_DEFAULTS.MATCH_THRESHOLD ? "YES (Filtered out)" : "NO (Borderline)";
    console.log(
      `  ${c.ctrl.id.padEnd(10)} | ` +
      `${c.ctrl.label.substring(0, 25).padEnd(25)} | ` +
      `${c.topSim.toFixed(4).padEnd(15)} | ` +
      `${belowDefault}`
    );
  }

  const safetyMargin = avgTop1 - maxControlScore;
  console.log(`\n  Calibration Summary:`);
  console.log(`    Highest Irrelevant Query Score:  ${maxControlScore.toFixed(4)}`);
  console.log(`    Meaningful Query Avg Top-1:      ${avgTop1.toFixed(4)}`);
  console.log(`    Separation Safety Margin:        ${safetyMargin.toFixed(4)}`);
  console.log(`    Configured Default MATCH_THRESHOLD: ${RETRIEVAL_DEFAULTS.MATCH_THRESHOLD}`);

  const allControlsBelowDefault = maxControlScore < RETRIEVAL_DEFAULTS.MATCH_THRESHOLD;
  if (allControlsBelowDefault && safetyMargin > 0.10) {
    pass(
      "G1: Healthy separation between meaningful queries and noise",
      `Max control: ${maxControlScore.toFixed(4)} (< ${RETRIEVAL_DEFAULTS.MATCH_THRESHOLD} threshold), separation margin: ${safetyMargin.toFixed(4)} (> 0.10)`
    );
  } else {
    fail(
      "G1: Insufficient separation margin between meaningful and irrelevant queries",
      `maxControlScore=${maxControlScore.toFixed(4)}, margin=${safetyMargin.toFixed(4)}`
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FINAL SUMMARY
  // ────────────────────────────────────────────────────────────────────────────
  header("VERIFICATION SUMMARY");
  console.log(`  Total:  ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`${"═".repeat(65)}`);

  if (failed === 0) {
    console.log("\n  ✓ ALL TESTS PASSED SUCCESSFULLY.\n");
  } else {
    console.log("\n  ✗ SOME TESTS FAILED. See details above.\n");
  }
}

runSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
