/**
 * PHASE 6B.7 — CHAITANYAM AI CONTEXT WINDOW TEST SUITE
 *
 * Tests: 20 scenarios covering context trimming, message exclusion,
 *        security, field exclusion, prompt structure, and build.
 *
 * Usage:
 *   node --env-file=.env.local scratch/test_context_6b7.js
 *
 * Requirements:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   TEST_USER_A_EMAIL / TEST_USER_A_PASSWORD
 *   TEST_USER_B_EMAIL / TEST_USER_B_PASSWORD
 *
 * Notes:
 *   Tests 1–18 are unit / DB-level tests runnable without a live HTTP server.
 *   Test 19 (existing follow-up) is a DB-level integration test.
 *   Test 20 (build) is a child-process test.
 *   Manual browser tests are documented at the bottom of this file.
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// ── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const USER_A_EMAIL = process.env.TEST_USER_A_EMAIL;
const USER_A_PASSWORD = process.env.TEST_USER_A_PASSWORD;
const USER_B_EMAIL = process.env.TEST_USER_B_EMAIL;
const USER_B_PASSWORD = process.env.TEST_USER_B_PASSWORD;

if (!USER_A_EMAIL || !USER_A_PASSWORD || !USER_B_EMAIL || !USER_B_PASSWORD) {
  console.error("ERROR: Missing TEST_USER_A_EMAIL / _PASSWORD or TEST_USER_B_EMAIL / _PASSWORD");
  process.exit(1);
}

// Derive workspace root from this file's location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.join(__dirname, "..");

// ── Import modules under test ─────────────────────────────────────────────────

const { buildConversationContext, ContextFetchError, CONTEXT_MAX_TURNS, CONTEXT_MAX_CHARS } =
  await import("../lib/krishna/context.js");

const { buildKrishnaPrompt } = await import("../lib/krishna/prompt.js");

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function pass(label) {
  passed++;
  console.log(`✓ PASS: ${label}`);
}

function fail(label, reason) {
  failed++;
  failures.push({ label, reason });
  console.error(`✗ FAIL: ${label}`);
  console.error(`       ${reason}`);
}

async function signIn(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Sign-in failed for ${email}: ${error?.message}`);
  return { client, session: data.session, user: data.user };
}

/** Seed a conversation with N message pairs (user + assistant) */
async function seedConversation(supabase, userId, title, numPairs = 0) {
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .insert({ user_id: userId, title })
    .select("id")
    .single();
  if (convErr || !conv) throw new Error(`Seed conversation failed: ${convErr?.message}`);

  const messageIds = [];
  for (let i = 0; i < numPairs; i++) {
    const { data: um } = await supabase
      .from("messages")
      .insert({ conversation_id: conv.id, role: "user", content: `User message ${i + 1}` })
      .select("id")
      .single();
    const { data: am } = await supabase
      .from("messages")
      .insert({ conversation_id: conv.id, role: "assistant", content: `Assistant message ${i + 1}` })
      .select("id")
      .single();
    if (um) messageIds.push(um.id);
    if (am) messageIds.push(am.id);
  }

  return { conv, messageIds };
}

/** Insert one message and return its ID */
async function insertMessage(supabase, conversationId, role, content) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Insert message failed: ${error?.message}`);
  return data.id;
}

// ── Test Suite ────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("==================================================");
  console.log("PHASE 6B.7 — CONTEXT WINDOW TEST SUITE");
  console.log("==================================================\n");

  console.log(`CONTEXT_MAX_TURNS = ${CONTEXT_MAX_TURNS} (expected 10)`);
  console.log(`CONTEXT_MAX_CHARS = ${CONTEXT_MAX_CHARS} (expected 4000)\n`);

  let userA, userB;

  try {
    userA = await signIn(USER_A_EMAIL, USER_A_PASSWORD);
    userB = await signIn(USER_B_EMAIL, USER_B_PASSWORD);
  } catch (err) {
    console.error("FATAL: Could not sign in test users:", err.message);
    process.exit(1);
  }

  // ── Test 1: New conversation produces no history ──────────────────────────
  try {
    // For a brand-new conversation with only one (just-inserted) message,
    // buildConversationContext should return "" because all other messages
    // are excluded by the neq filter.
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 1 — new conv", 0);
    const currentId = await insertMessage(userA.client, conv.id, "user", "First message");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    if (block !== "") throw new Error(`Expected empty string, got: "${block}"`);
    pass("1. New conversation has no history (returns empty string)");
  } catch (err) {
    fail("1. New conversation has no history", err.message);
  }

  // ── Test 2: Existing conversation retrieves previous messages ─────────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 2 — history", 2);
    const currentId = await insertMessage(userA.client, conv.id, "user", "Follow-up question");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    if (!block.includes("<CONVERSATION_HISTORY>")) throw new Error("Missing <CONVERSATION_HISTORY> tag");
    if (!block.includes("User: User message 1")) throw new Error("Missing prior user message");
    if (!block.includes("Assistant: Assistant message 1")) throw new Error("Missing prior assistant message");
    pass("2. Existing conversation retrieves previous messages");
  } catch (err) {
    fail("2. Existing conversation retrieves previous messages", err.message);
  }

  // ── Test 3: Current message is excluded from history ─────────────────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 3 — exclusion", 1);
    const currentId = await insertMessage(userA.client, conv.id, "user", "CURRENT_MESSAGE_MARKER");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    if (block.includes("CURRENT_MESSAGE_MARKER")) {
      throw new Error("Current message was included in history — duplication detected");
    }
    pass("3. Current message is excluded from history");
  } catch (err) {
    fail("3. Current message is excluded from history", err.message);
  }

  // ── Test 4: CONTEXT_MAX_TURNS = 10 enforced ───────────────────────────────
  try {
    // Seed 8 pairs (16 messages) = more than the 10-message limit
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 4 — max turns", 8);
    const currentId = await insertMessage(userA.client, conv.id, "user", "Current question");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    // Count lines that start with "User:" or "Assistant:"
    const lines = block.split("\n").filter((l) => l.startsWith("User:") || l.startsWith("Assistant:"));
    if (lines.length > CONTEXT_MAX_TURNS) {
      throw new Error(`Expected ≤${CONTEXT_MAX_TURNS} history lines, got ${lines.length}`);
    }
    pass(`4. CONTEXT_MAX_TURNS (${CONTEXT_MAX_TURNS}) enforced — got ${lines.length} history lines`);
  } catch (err) {
    fail("4. CONTEXT_MAX_TURNS enforced", err.message);
  }

  // ── Test 5: CONTEXT_MAX_CHARS = 4000 enforced ────────────────────────────
  try {
    // Seed messages where each is ~300 chars to ensure budget pressure
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 5 — max chars", 0);
    for (let i = 0; i < 6; i++) {
      await insertMessage(userA.client, conv.id, "user", "U".repeat(290) + ` msg${i}`);
      await insertMessage(userA.client, conv.id, "assistant", "A".repeat(290) + ` msg${i}`);
    }
    const currentId = await insertMessage(userA.client, conv.id, "user", "Current question");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    const contentLength = block.length;
    if (contentLength > CONTEXT_MAX_CHARS + 300) {
      // Allow up to 300 chars overhead for the block tags and framing instruction
      throw new Error(`History block length ${contentLength} exceeds CONTEXT_MAX_CHARS + overhead`);
    }
    pass(`5. CONTEXT_MAX_CHARS (${CONTEXT_MAX_CHARS}) enforced — block length: ${contentLength}`);
  } catch (err) {
    fail("5. CONTEXT_MAX_CHARS enforced", err.message);
  }

  // ── Test 6: History is chronological after trimming ───────────────────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 6 — order", 0);
    await insertMessage(userA.client, conv.id, "user", "FIRST_USER");
    await insertMessage(userA.client, conv.id, "assistant", "FIRST_ASSISTANT");
    await insertMessage(userA.client, conv.id, "user", "SECOND_USER");
    await insertMessage(userA.client, conv.id, "assistant", "SECOND_ASSISTANT");
    const currentId = await insertMessage(userA.client, conv.id, "user", "Current question");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    const firstIdx = block.indexOf("FIRST_USER");
    const secondIdx = block.indexOf("SECOND_USER");
    if (firstIdx === -1 || secondIdx === -1) throw new Error("Expected messages not found in block");
    if (firstIdx > secondIdx) throw new Error("FIRST_USER appears AFTER SECOND_USER — wrong order");
    pass("6. History is chronological after trimming (oldest first)");
  } catch (err) {
    fail("6. History is chronological after trimming", err.message);
  }

  // ── Test 7: Message boundaries are preserved ──────────────────────────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 7 — boundaries", 2);
    const currentId = await insertMessage(userA.client, conv.id, "user", "Current");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    // Every content line in the block must start with "User:" or "Assistant:"
    const lines = block
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith("<") && !l.startsWith("The following"));
    for (const line of lines) {
      if (!line.startsWith("User:") && !line.startsWith("Assistant:")) {
        throw new Error(`Found line without role prefix: "${line}"`);
      }
    }
    pass("7. Message boundaries preserved (all content lines have role prefix)");
  } catch (err) {
    fail("7. Message boundaries preserved", err.message);
  }

  // ── Test 8: Long individual message handling ──────────────────────────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 8 — long msg", 0);
    // Insert a single user message that is longer than CONTEXT_MAX_CHARS
    const longContent = "X".repeat(CONTEXT_MAX_CHARS + 500);
    await insertMessage(userA.client, conv.id, "user", longContent);
    const currentId = await insertMessage(userA.client, conv.id, "user", "Current");
    const block = await buildConversationContext(userA.client, conv.id, currentId);

    if (!block) {
      // Acceptable: block is empty because the single long message exceeded all budget
      pass("8. Long message handling: block empty (all budget consumed by framing, skip)");
    } else {
      // Block is present; either the message was truncated or fit
      const hasMarker = block.includes("[...]");
      const blockLength = block.length;
      // Block should not vastly exceed CONTEXT_MAX_CHARS + overhead
      if (blockLength > CONTEXT_MAX_CHARS + 400) {
        throw new Error(`Block length ${blockLength} significantly exceeds budget`);
      }
      pass(`8. Long message handling: block length ${blockLength}${hasMarker ? ", truncated with [...]" : ""}`);
    }
  } catch (err) {
    fail("8. Long message handling", err.message);
  }

  // ── Test 9: User/assistant roles are preserved ────────────────────────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 9 — roles", 0);
    await insertMessage(userA.client, conv.id, "user", "ROLE_TEST_USER");
    await insertMessage(userA.client, conv.id, "assistant", "ROLE_TEST_ASSISTANT");
    const currentId = await insertMessage(userA.client, conv.id, "user", "Current");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    if (!block.includes("User: ROLE_TEST_USER")) throw new Error("User role label not found");
    if (!block.includes("Assistant: ROLE_TEST_ASSISTANT")) throw new Error("Assistant role label not found");
    pass("9. User/assistant roles preserved in history block");
  } catch (err) {
    fail("9. User/assistant roles preserved", err.message);
  }

  // ── Test 10: retrieval_meta never enters context ──────────────────────────
  try {
    // Seed a conversation where the assistant message has retrieval_meta in the DB
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 10 — no meta", 0);
    await insertMessage(userA.client, conv.id, "user", "Some question");
    // Insert assistant message with retrieval_meta directly
    await userA.client.from("messages").insert({
      conversation_id: conv.id,
      role: "assistant",
      content: "Some answer",
      retrieval_meta: { model: "SECRET_MODEL", matchThreshold: 0.5, isGrounded: true },
    });
    const currentId = await insertMessage(userA.client, conv.id, "user", "Current");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    if (block.includes("SECRET_MODEL")) throw new Error("retrieval_meta leaked into context block");
    if (block.includes("matchThreshold")) throw new Error("retrieval_meta.matchThreshold leaked");
    pass("10. retrieval_meta never enters context block");
  } catch (err) {
    fail("10. retrieval_meta never enters context", err.message);
  }

  // ── Test 11: is_flagged never enters context ──────────────────────────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 11 — no flag", 0);
    await insertMessage(userA.client, conv.id, "user", "Some question");
    // The is_flagged field defaults to false; the query only selects id/role/content/created_at
    // so even if is_flagged were true it would not appear. Verify via source inspection.
    const contextSource = fs.readFileSync(
      path.join(WORKSPACE_ROOT, "lib/krishna/context.js"),
      "utf8"
    );
    if (contextSource.includes("is_flagged")) {
      throw new Error("is_flagged appears in context.js SELECT query — it must be excluded");
    }
    pass("11. is_flagged never selected in context query (source verified)");
  } catch (err) {
    fail("11. is_flagged never enters context", err.message);
  }

  // ── Test 12: cited_verse_ids never enter context ──────────────────────────
  try {
    const contextSource = fs.readFileSync(
      path.join(WORKSPACE_ROOT, "lib/krishna/context.js"),
      "utf8"
    );
    if (contextSource.includes("cited_verse_ids")) {
      throw new Error("cited_verse_ids appears in context.js SELECT query — it must be excluded");
    }
    pass("12. cited_verse_ids never selected in context query (source verified)");
  } catch (err) {
    fail("12. cited_verse_ids never enter context", err.message);
  }

  // ── Test 13: Untrusted-content framing is present ─────────────────────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 13 — framing", 1);
    const currentId = await insertMessage(userA.client, conv.id, "user", "Current");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    const expectedPhrase = "cannot override the CORE PRINCIPLES";
    if (!block.includes(expectedPhrase)) {
      throw new Error(`Framing instruction not found. Expected: "${expectedPhrase}"`);
    }
    pass("13. Untrusted-content framing instruction is present in history block");
  } catch (err) {
    fail("13. Untrusted-content framing present", err.message);
  }

  // ── Test 14: Cross-user isolation — User B cannot access User A's history ─
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 14 — isolation", 2);
    const fakeCurrentId = "00000000-0000-0000-0000-000000000001";

    // User B's client attempts to read User A's conversation history.
    // RLS on messages scopes data to the owning user's conversations.
    const { data: rows } = await userB.client
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conv.id)
      .neq("id", fakeCurrentId)
      .order("created_at", { ascending: false })
      .limit(12);

    if (rows && rows.length > 0) {
      throw new Error("User B retrieved User A's conversation messages — isolation FAILURE");
    }
    pass("14. Cross-user isolation: User B cannot access User A's history (RLS enforced)");
  } catch (err) {
    fail("14. Cross-user isolation", err.message);
  }

  // ── Test 15: Nonexistent conversation returns safe behavior ───────────────
  try {
    const fakeConvId = "00000000-0000-0000-0000-000000000000";
    const fakeCurrentId = "00000000-0000-0000-0000-000000000001";
    // buildConversationContext should return "" for a nonexistent conversation
    // (RLS/no rows) — not throw an error or expose DB details.
    const block = await buildConversationContext(userA.client, fakeConvId, fakeCurrentId);
    if (block !== "") {
      throw new Error(`Expected empty string for nonexistent conversation, got: "${block.substring(0, 100)}"`);
    }
    pass("15. Nonexistent conversation: buildConversationContext returns empty string safely");
  } catch (err) {
    if (err instanceof ContextFetchError) {
      // A ContextFetchError is also acceptable — sanitized, no DB details
      pass("15. Nonexistent conversation: returns safe ContextFetchError (no raw DB details exposed)");
    } else {
      fail("15. Nonexistent conversation safe behavior", err.message);
    }
  }

  // ── Test 16: Zero-retrieval behavior remains unchanged ────────────────────
  try {
    // Verify generator.js zero-retrieval guard is still present in source
    const generatorSource = fs.readFileSync(
      path.join(WORKSPACE_ROOT, "lib/krishna/generator.js"),
      "utf8"
    );
    if (!generatorSource.includes("retrievedVerses.length === 0")) {
      throw new Error("Zero-retrieval guard removed from generator.js");
    }
    if (!generatorSource.includes("zeroRetrieval: true")) {
      throw new Error("zeroRetrieval meta flag removed from generator.js");
    }
    pass("16. Zero-retrieval guard remains intact in generator.js (source verified)");
  } catch (err) {
    fail("16. Zero-retrieval behavior unchanged", err.message);
  }

  // ── Test 17: Existing citation validation remains unchanged ───────────────
  try {
    const generatorSource = fs.readFileSync(
      path.join(WORKSPACE_ROOT, "lib/krishna/generator.js"),
      "utf8"
    );
    if (!generatorSource.includes("validateAndEnforceGrounding")) {
      throw new Error("validateAndEnforceGrounding removed from generator.js");
    }
    if (!generatorSource.includes("allowedIdMap")) {
      throw new Error("allowedIdMap removed — citation enforcement may be broken");
    }
    pass("17. Citation validation (validateAndEnforceGrounding) remains intact (source verified)");
  } catch (err) {
    fail("17. Citation validation unchanged", err.message);
  }

  // ── Test 18: Fallback model receives same prompt (source verification) ────
  try {
    const generatorSource = fs.readFileSync(
      path.join(WORKSPACE_ROOT, "lib/krishna/generator.js"),
      "utf8"
    );
    // Fallback must use the same `prompt` variable (assembled with history)
    if (!generatorSource.includes("fallbackModel.generateContent(prompt)")) {
      throw new Error("Fallback model does not use the same prompt variable");
    }
    // Verify PRIMARY_MODEL and FALLBACK_MODEL are still configured
    if (!generatorSource.includes("gemini-flash-lite-latest")) {
      throw new Error("PRIMARY_MODEL changed or removed");
    }
    if (!generatorSource.includes("gemini-3.1-flash-lite-preview")) {
      throw new Error("FALLBACK_MODEL changed or removed");
    }
    pass("18. Fallback model uses same assembled prompt (including history) — source verified");
  } catch (err) {
    fail("18. Fallback model receives same prompt", err.message);
  }

  // ── Test 19: Existing conversation follow-up succeeds (DB-level) ──────────
  try {
    const { conv } = await seedConversation(userA.client, userA.user.id, "Test 19 — follow-up", 2);
    const currentId = await insertMessage(userA.client, conv.id, "user", "Follow-up message");
    const block = await buildConversationContext(userA.client, conv.id, currentId);
    // Should have history, exclude current message, and be non-empty
    if (!block.includes("<CONVERSATION_HISTORY>")) {
      throw new Error("Expected history block not present");
    }
    if (block.includes("Follow-up message")) {
      throw new Error("Current user message appears in history — duplication detected");
    }
    pass("19. Existing conversation follow-up: history present, current message excluded");
  } catch (err) {
    fail("19. Existing conversation follow-up succeeds", err.message);
  }

  // ── Test 20: npm run build succeeds ───────────────────────────────────────
  try {
    console.log("\n[Test 20] Running: npm run build ...");
    execSync("npm run build", {
      cwd: WORKSPACE_ROOT,
      stdio: "inherit",
      timeout: 120_000,
    });
    pass("20. npm run build succeeds (exit code 0)");
  } catch (err) {
    fail("20. npm run build succeeds", err.message || "Build failed");
  }

  // ── Prompt structure verification (bonus) ─────────────────────────────────
  console.log("\n── Prompt Structure Verification ──────────────────────────────");

  // Verify history appears AFTER persona and BEFORE GITA_CONTEXT
  const mockHistory = "<CONVERSATION_HISTORY>\nUser: test\n</CONVERSATION_HISTORY>";
  const mockVerses = [{
    id: "test-uuid",
    chapterNumber: 2,
    chapterName: "Sankhya Yoga",
    verseNumber: 47,
    sanskritText: null,
    transliteration: null,
    translation: "Test translation",
    commentary: null,
    practicalInsight: null,
  }];

  const promptWithHistory = buildKrishnaPrompt("Test question", mockVerses, {}, mockHistory);
  const personaIdx = promptWithHistory.indexOf("CORE PRINCIPLES");
  const historyIdx = promptWithHistory.indexOf("<CONVERSATION_HISTORY>");
  const gitaIdx = promptWithHistory.indexOf("<GITA_CONTEXT>");
  const questionIdx = promptWithHistory.indexOf('USER QUESTION:');

  const orderCorrect = personaIdx < historyIdx && historyIdx < gitaIdx && gitaIdx < questionIdx;

  if (orderCorrect) {
    console.log("✓ BONUS: Prompt order verified: PERSONA → HISTORY → GITA → QUESTION");
  } else {
    console.warn("⚠ BONUS: Prompt order unexpected — check buildKrishnaPrompt structure");
    console.warn(`  personaIdx=${personaIdx}, historyIdx=${historyIdx}, gitaIdx=${gitaIdx}, questionIdx=${questionIdx}`);
  }

  // Verify no history block when empty
  const promptNoHistory = buildKrishnaPrompt("Test question", mockVerses, {}, "");
  if (promptNoHistory.includes("<CONVERSATION_HISTORY>")) {
    console.warn("⚠ BONUS: Empty history string still produces CONVERSATION_HISTORY block — check prompt.js");
  } else {
    console.log("✓ BONUS: Empty history string → no CONVERSATION_HISTORY block in prompt");
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n==================================================");
  console.log(`Total Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("==================================================");

  if (failures.length > 0) {
    console.log("\nFAILED TESTS:");
    failures.forEach(({ label, reason }) => {
      console.error(`  ✗ ${label}`);
      console.error(`    Reason: ${reason}`);
    });
  }

  console.log(`
NOTES:
  - Tests 11–12, 16–18 are verified at the source-code level (no live API calls).
  - Test 14 verifies RLS at the DB level using User B's client.
  - Test 15 verifies safe behavior for a nonexistent conversation.
  - Tests 8, 5 seed messages that push against budget limits.
  - Browser-only tests (A–M) are documented below and require manual verification.

BROWSER-ONLY MANUAL TESTS (NOT claimed as automated):
  A. Start new conversation → Send first message → verify no prior context.
  B. Send follow-up → verify Chaitanyam references earlier content.
  C. Open old conversation from History → send follow-up → verify context continuity.
  D. Start New Chat → ask a question → verify old conversation NOT referenced.
  E. Test multilingual continuity (prior Telugu → new English message).
  F. Long conversation (15+ messages) → verify response succeeds within latency bounds.
  G. Verify conversation context window does NOT produce cross-conversation memory.

PRE-EXISTING FALLBACK MODEL NOTE:
  The configured fallback model (gemini-3.1-flash-lite-preview) is a preview-lifecycle
  model. Its production readiness should be reviewed independently of Phase 6B.7.
  Phase 6B.7 does not change this configuration.
`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Unhandled error in test suite:", err);
  process.exit(1);
});
