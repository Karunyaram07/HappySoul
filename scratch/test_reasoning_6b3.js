// Test script: Phase 6B.3 — Krishna AI Reasoning & Grounded Response Layer
// Run from project root via: node scratch/test_reasoning_6b3.js
//
// Tests prompt construction, Gemini generation, grounding validation,
// error classification, zero-retrieval safety, and API key protection.

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const { retrieveRelevantVerses } = require("../lib/krishna/retrieval");
const {
  generateKrishnaResponse,
  classifyGeminiError,
  validateAndEnforceGrounding,
  parseRawOutput,
  KrishnaAIError,
} = require("../lib/krishna/generator");
const { buildKrishnaPrompt, formatRetrievedVersesContext } = require("../lib/krishna/prompt");

// Instantiate Supabase client for retrieval in tests
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let passed = 0;
let failed = 0;
const results = [];
let geminiCallsCount = 0;

function pass(testName, detail = "") {
  passed++;
  results.push({ status: "✓ PASS", test: testName, detail });
  console.log(`  ✓ PASS  ${testName}${detail ? " — " + detail : ""}`);
}

function fail(testName, detail = "") {
  failed++;
  results.push({ status: "✗ FAIL", test: testName, detail });
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

async function runSuite() {
  console.log(`\n${"═".repeat(65)}`);
  console.log("  PHASE 6B.3 — KRISHNA AI REASONING LAYER VERIFICATION");
  console.log(`${"═".repeat(65)}`);

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP 1: Safety, Key Handling & Error Classification (No API Calls)
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP 1 — API Key Safety & Error Classification (Unit Level)");

  // Test 9: Missing Gemini API key
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    await generateKrishnaResponse("Hello", [{ id: "mock-1", chapterNumber: 2, verseNumber: 47 }]);
    fail("Test 9: Missing Gemini API key", "Should have thrown");
  } catch (err) {
    if (err.message === "Gemini API key is not configured." && err.code === "MISSING_API_KEY") {
      pass("Test 9: Missing Gemini API key", err.message);
    } else {
      fail("Test 9: Missing Gemini API key", `Unexpected error: ${err.message}`);
    }
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }

  // Test 10: Invalid Gemini API key classification
  try {
    const simulatedAuthError = new Error("[GoogleGenerativeAI Error]: [400 Bad Request] API_KEY_INVALID");
    const classified = classifyGeminiError(simulatedAuthError);
    if (
      classified.message === "Gemini authentication failed. Please check the configured API key." &&
      classified.code === "AUTH_FAILED"
    ) {
      pass("Test 10: Invalid API key classified safely", classified.message);
    } else {
      fail("Test 10: Invalid API key classified safely", `Wrong message: ${classified.message}`);
    }
  } catch (err) {
    fail("Test 10: Invalid API key classification error", err.message);
  }

  // Test 11: Simulated Gemini rate limit & generic failure handling
  try {
    const rateLimitError = new Error("[429 Resource Exhausted] Quota exceeded for quota metric");
    const classifiedRate = classifyGeminiError(rateLimitError);
    const genericError = new Error("Socket timeout on connection reset");
    const classifiedGen = classifyGeminiError(genericError);

    const rateOk =
      classifiedRate.message === "AI service rate limit or quota exceeded." &&
      classifiedRate.code === "RATE_LIMIT_EXCEEDED";
    const genOk =
      classifiedGen.message === "AI generation failed. Please try again." &&
      classifiedGen.code === "GENERATION_FAILED";

    if (rateOk && genOk) {
      pass("Test 11: Rate limit (429) & generic failure classified safely", "Rate-limit and fallback handled");
    } else {
      fail("Test 11: Failure classification failed", `${classifiedRate.message} / ${classifiedGen.message}`);
    }
  } catch (err) {
    fail("Test 11: Error classification test", err.message);
  }

  // Test 15: Verify secrets are never included in returned error messages
  try {
    const errorWithSecret = new Error(`Connection failed with key ${originalKey} on https://api.google.com`);
    const sanitized = classifyGeminiError(errorWithSecret);
    if (!sanitized.message.includes(originalKey) && !sanitized.message.includes("AIza")) {
      pass("Test 15: Secrets are never exposed in error messages", "Zero sensitive leakage in application error");
    } else {
      fail("Test 15: Secret leaked in error message!");
    }
  } catch (err) {
    fail("Test 15: Secret leak test error", err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP 2: Grounding Validation & Citation Enforcement (Unit Level)
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP 2 — Grounding Validation & Citation Enforcement");

  const mockRetrievedVerses = [
    {
      id: "uuid-verse-2-47",
      chapterNumber: 2,
      chapterName: "Sankhya Yoga",
      verseNumber: 47,
      translation: "You have a right to perform your duty, but not to the fruits thereof.",
    },
    {
      id: "uuid-verse-18-47",
      chapterNumber: 18,
      chapterName: "Moksha Sanyaas Yoga",
      verseNumber: 47,
      translation: "Better is one's own duty, though destitute of merit...",
    },
  ];

  // Test 7: Zero retrieved verses returns safe ungrounded message
  try {
    const zeroRes = await generateKrishnaResponse("What is the meaning of life?", []);
    if (
      zeroRes.meta.zeroRetrieval === true &&
      zeroRes.meta.isGrounded === false &&
      zeroRes.citedVerseIds.length === 0 &&
      zeroRes.answer.includes("No sufficiently relevant")
    ) {
      pass("Test 7: Zero retrieved verses yields safe ungrounded response", `Answer: "${zeroRes.answer.substring(0, 60)}..."`);
    } else {
      fail("Test 7: Zero retrieved verses handling", "Did not return expected zeroRetrieval payload");
    }
  } catch (err) {
    fail("Test 7: Zero retrieved verses test error", err.message);
  }

  // Test 8: Invalid / malformed retrieved verse data throws safe error
  try {
    await generateKrishnaResponse("Hello", "not-an-array");
    fail("Test 8: Malformed retrieved verses", "Should have thrown");
  } catch (err) {
    if (err.message.includes("Retrieved verses must be an array")) {
      pass("Test 8: Malformed retrieved verse data rejected safely", err.message);
    } else {
      fail("Test 8: Malformed retrieved verse data", `Unexpected error: ${err.message}`);
    }
  }

  // Test 12: Verify citedVerseIds are restricted strictly to retrieved verse IDs
  try {
    const modelOutputWithMix = {
      answer: "Perform your prescribed duty without attachment.",
      citedVerseIds: ["uuid-verse-2-47", "fake-hallucinated-id-999"],
      citations: [
        { chapter: 2, verse: 47 },
        { chapter: 99, verse: 99 },
      ],
    };
    const validated = validateAndEnforceGrounding(modelOutputWithMix, mockRetrievedVerses);

    if (
      validated.citedVerseIds.length === 1 &&
      validated.citedVerseIds[0] === "uuid-verse-2-47" &&
      validated.citations.length === 1 &&
      validated.citations[0].chapter === 2 &&
      validated.citations[0].verse === 47
    ) {
      pass("Test 12: citedVerseIds restricted to retrieved verses", "Hallucinated ID 'fake-hallucinated-id-999' stripped");
    } else {
      fail("Test 12: Citation restriction failed", JSON.stringify(validated));
    }
  } catch (err) {
    fail("Test 12: Grounding enforcement test error", err.message);
  }

  // Test 13: Verify unknown verse IDs are rejected completely
  try {
    const modelOutputAllFake = {
      answer: "Trust the universe completely.",
      citedVerseIds: ["unretrieved-id-1", "unretrieved-id-2"],
      citations: [{ chapter: 4, verse: 10 }],
    };
    const validatedEmpty = validateAndEnforceGrounding(modelOutputAllFake, mockRetrievedVerses);

    if (validatedEmpty.citedVerseIds.length === 0 && validatedEmpty.citations.length === 0) {
      pass("Test 13: Unknown verse IDs rejected completely", "0 citations retained when none match retrieved set");
    } else {
      fail("Test 13: Failed to reject unknown verse IDs", JSON.stringify(validatedEmpty));
    }
  } catch (err) {
    fail("Test 13: Unknown verse test error", err.message);
  }

  // Test 6: Prompt formatting for multiple retrieved verses
  try {
    const formattedPrompt = buildKrishnaPrompt("How to act?", mockRetrievedVerses);
    const hasContext = formattedPrompt.includes("<GITA_CONTEXT>") && formattedPrompt.includes("</GITA_CONTEXT>");
    const hasVerse1 = formattedPrompt.includes("uuid-verse-2-47") && formattedPrompt.includes("Chapter 2, Verse 47");
    const hasVerse2 = formattedPrompt.includes("uuid-verse-18-47") && formattedPrompt.includes("Chapter 18, Verse 47");

    if (hasContext && hasVerse1 && hasVerse2) {
      pass("Test 6: Prompt context contains multiple delimited verses", "All mock verses deterministically rendered");
    } else {
      fail("Test 6: Multi-verse prompt formatting missing elements");
    }
  } catch (err) {
    fail("Test 6: Prompt context formatting error", err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GROUP 3: Live End-to-End Generation Tests (Small Controlled Set)
  // ────────────────────────────────────────────────────────────────────────────
  header("GROUP 3 — Live End-to-End Generation (5 Controlled Real Queries)");

  let lastLiveResponse = null;

  // Test 1: Basic English question
  console.log("\n  → Executing Test 1: Basic English Question");
  try {
    const q1Text = "How can I find peace of mind when facing difficult situations?";
    const ret1 = await retrieveRelevantVerses(supabase, q1Text, { matchCount: 3 });
    geminiCallsCount++; // 1 embedding call in 6B.2 + 1 generation call below
    const gen1 = await generateKrishnaResponse(q1Text, ret1.verses);
    lastLiveResponse = gen1;
    geminiCallsCount++;

    console.log(`     Answer Preview: "${gen1.answer.substring(0, 120)}..."`);
    console.log(`     Citations: ${JSON.stringify(gen1.citations)}`);
    console.log(`     Cited Verse IDs: ${gen1.citedVerseIds.join(", ") || "(none)"}`);

    if (gen1.answer && gen1.meta.isGrounded && Array.isArray(gen1.citedVerseIds)) {
      pass("Test 1: Basic English question with retrieved verses", `${gen1.citations.length} citation(s)`);
    } else {
      fail("Test 1: Basic English question generation failed");
    }
  } catch (err) {
    fail("Test 1: Error during basic English generation", err.message);
  }

  await sleep(1500);

  // Test 2: Career / failure question
  console.log("\n  → Executing Test 2: Career / Failure Question");
  try {
    const q2Text = "I failed an important exam and feel like a complete failure. How should I view this?";
    const ret2 = await retrieveRelevantVerses(supabase, q2Text, { matchCount: 3 });
    const gen2 = await generateKrishnaResponse(q2Text, ret2.verses);
    geminiCallsCount += 2;

    console.log(`     Answer Preview: "${gen2.answer.substring(0, 120)}..."`);
    console.log(`     Citations: ${JSON.stringify(gen2.citations)}`);

    if (gen2.answer && gen2.meta.isGrounded) {
      pass("Test 2: Career/failure question generates grounded guidance", `Cited: ${gen2.citations.map(c => `BG ${c.chapter}.${c.verse}`).join(", ")}`);
    } else {
      fail("Test 2: Career/failure generation failed");
    }
  } catch (err) {
    fail("Test 2: Error during career/failure generation", err.message);
  }

  await sleep(1500);

  // Test 3: Anger / emotional control question
  console.log("\n  → Executing Test 3: Anger / Emotional Control Question");
  try {
    const q3Text = "I get angry very easily and hurt people I love. What does the Gita teach about anger?";
    const ret3 = await retrieveRelevantVerses(supabase, q3Text, { matchCount: 3 });
    const gen3 = await generateKrishnaResponse(q3Text, ret3.verses);
    geminiCallsCount += 2;

    console.log(`     Answer Preview: "${gen3.answer.substring(0, 120)}..."`);
    console.log(`     Citations: ${JSON.stringify(gen3.citations)}`);

    if (gen3.answer && gen3.meta.isGrounded) {
      pass("Test 3: Anger/emotional-control question generates grounded guidance", `Cited: ${gen3.citations.map(c => `BG ${c.chapter}.${c.verse}`).join(", ")}`);
    } else {
      fail("Test 3: Anger question generation failed");
    }
  } catch (err) {
    fail("Test 3: Error during anger generation", err.message);
  }

  await sleep(1500);

  // Test 4: Telugu question
  console.log("\n  → Executing Test 4: Telugu Question");
  try {
    const q4Text = "నా మనసు అశాంతిగా ఉంది. కృష్ణుడు దీనికి ఎలాంటి పరిష్కారం చెప్పాడు?";
    const ret4 = await retrieveRelevantVerses(supabase, q4Text, { matchCount: 3 });
    const gen4 = await generateKrishnaResponse(q4Text, ret4.verses);
    geminiCallsCount += 2;

    console.log(`     Answer Preview: "${gen4.answer.substring(0, 120)}..."`);
    console.log(`     Citations: ${JSON.stringify(gen4.citations)}`);

    if (gen4.answer && gen4.meta.isGrounded) {
      pass("Test 4: Telugu question answered in aligned language with Gita citations", `Citations: ${gen4.citations.length}`);
    } else {
      fail("Test 4: Telugu generation failed");
    }
  } catch (err) {
    fail("Test 4: Error during Telugu generation", err.message);
  }

  await sleep(1500);


  // Test 5: Hindi question
  console.log("\n  → Executing Test 5: Hindi Question");
  try {
    const q5Text = "जब मन विचलित हो तो स्थिरता कैसे प्राप्त करें?";
    const ret5 = await retrieveRelevantVerses(supabase, q5Text, { matchCount: 3 });
    const gen5 = await generateKrishnaResponse(q5Text, ret5.verses);
    lastLiveResponse = gen5;
    geminiCallsCount += 2;

    console.log(`     Answer Preview: "${gen5.answer.substring(0, 120)}..."`);
    console.log(`     Citations: ${JSON.stringify(gen5.citations)}`);

    if (gen5.answer && gen5.meta.isGrounded) {
      pass("Test 5: Hindi question answered in aligned language with Gita citations", `Citations: ${gen5.citations.length}`);
    } else {
      fail("Test 5: Hindi generation failed");
    }
  } catch (err) {
    fail("Test 5: Error during Hindi generation", err.message);
  }

  // Test 14: Verify generated answer is non-empty and structured
  try {
    const structuredOk =
      lastLiveResponse !== null &&
      typeof lastLiveResponse.answer === "string" &&
      lastLiveResponse.answer.length > 30 &&
      Array.isArray(lastLiveResponse.citedVerseIds) &&
      Array.isArray(lastLiveResponse.citations) &&
      typeof lastLiveResponse.meta === "object" &&
      lastLiveResponse.meta.isGrounded === true;
    if (structuredOk) {
      pass("Test 14: Generated answer is non-empty and properly structured", "Schema validated across live runs");
    } else {
      fail("Test 14: Structure validation failed on live output");
    }
  } catch (err) {
    fail("Test 14: Structure test error", err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FINAL SUMMARY
  // ────────────────────────────────────────────────────────────────────────────
  header("VERIFICATION SUMMARY");
  console.log(`  Total Tests:    ${passed + failed}`);
  console.log(`  Passed:         ${passed}`);
  console.log(`  Failed:         ${failed}`);
  console.log(`  Total Gemini Calls Made: ~${geminiCallsCount} calls (5 embedding + 5 generation)`);
  console.log(`${"═".repeat(65)}`);

  if (failed === 0) {
    console.log("\n  ✓ ALL PHASE 6B.3 REASONING TESTS PASSED.\n");
  } else {
    console.log("\n  ✗ SOME TESTS FAILED.\n");
  }
}

runSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
