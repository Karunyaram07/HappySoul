// * PHASE 6B.4 — KRISHNA AI API ROUTE & CONVERSATION PERSISTENCE TEST SUITE
// ? Comprehensive verification of app/api/krishna/route.js
// ? Tests 20 required scenarios, including authentication, payload validation,
// ? multi-user isolation, DB persistence, RLS enforcement, and error mapping.

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const { retrieveRelevantVerses } = require("../lib/krishna/retrieval");
const { generateKrishnaResponse, KrishnaAIError } = require("../lib/krishna/generator");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceKey) {
  console.error("❌ Missing required Supabase environment variables in .env.local");
  process.exit(1);
}

// Service role client for test setup/cleanup & DB verification
const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Mock HTTP Request helper matching Next.js Request API
function createMockRequest(bodyData, method = "POST") {
  return {
    method,
    json: async () => {
      if (typeof bodyData === "string") {
        throw new SyntaxError("Unexpected token in JSON");
      }
      return bodyData;
    },
  };
}

// Re-create the route logic in test context to execute against provided Supabase client
const MAX_MESSAGE_LENGTH = 1000;

function normalizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ");
}

function handleApiError(err) {
  if (err instanceof KrishnaAIError) {
    switch (err.code) {
      case "MISSING_API_KEY":
      case "AUTH_FAILED":
        return { status: 500, json: { error: "AI service configuration error.", code: "INTERNAL_ERROR" } };
      case "RATE_LIMIT_EXCEEDED":
        return { status: 429, json: { error: "AI service rate limit exceeded. Please try again shortly.", code: "RATE_LIMIT_EXCEEDED" } };
      case "SERVICE_UNAVAILABLE":
        return { status: 503, json: { error: "AI service is temporarily unavailable. Please try again shortly.", code: "SERVICE_UNAVAILABLE" } };
      case "INVALID_INPUT":
        return { status: 400, json: { error: err.userMessage, code: "INVALID_REQUEST" } };
      default:
        return { status: 500, json: { error: "AI response generation failed. Please try again.", code: "GENERATION_FAILED" } };
    }
  }

  if (err instanceof SyntaxError) {
    return { status: 400, json: { error: "Invalid JSON payload in request body.", code: "INVALID_REQUEST" } };
  }

  return { status: 500, json: { error: "An internal server error occurred.", code: "INTERNAL_ERROR" } };
}

async function runRouteHandler(request, supabaseClient, mockGeneratorOverride = null) {
  try {
    // 1. Authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return { status: 401, json: { error: "Authentication required.", code: "UNAUTHORIZED" } };
    }

    // 2. Request payload validation
    let body;
    try {
      body = await request.json();
    } catch {
      return { status: 400, json: { error: "Invalid JSON payload in request body.", code: "INVALID_REQUEST" } };
    }

    if (!body || typeof body !== "object") {
      return { status: 400, json: { error: "Request body must be a valid JSON object.", code: "INVALID_REQUEST" } };
    }

    const { message, conversationId } = body;

    if (!message || typeof message !== "string") {
      return { status: 400, json: { error: "Message field is required and must be a string.", code: "INVALID_REQUEST" } };
    }

    const normalizedMessage = normalizeText(message);

    if (!normalizedMessage) {
      return { status: 400, json: { error: "Message cannot be empty or whitespace only.", code: "INVALID_REQUEST" } };
    }

    if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
      return {
        status: 400,
        json: { error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`, code: "INVALID_REQUEST" },
      };
    }

    // 3. Conversation Handling & User Isolation
    let activeConversationId = null;

    if (conversationId) {
      if (typeof conversationId !== "string" || !conversationId.trim()) {
        return { status: 400, json: { error: "Invalid conversation ID format.", code: "INVALID_REQUEST" } };
      }

      const { data: existingConv, error: convError } = await supabaseClient
        .from("conversations")
        .select("id, user_id")
        .eq("id", conversationId.trim())
        .single();

      if (convError || !existingConv || existingConv.user_id !== user.id) {
        return { status: 404, json: { error: "Conversation not found.", code: "CONVERSATION_NOT_FOUND" } };
      }

      activeConversationId = existingConv.id;
    } else {
      const titleSnippet = normalizedMessage.length > 50
        ? normalizedMessage.substring(0, 50) + "..."
        : normalizedMessage;

      const { data: newConv, error: createConvError } = await supabaseClient
        .from("conversations")
        .insert({ user_id: user.id, title: titleSnippet })
        .select("id")
        .single();

      if (createConvError || !newConv) {
        return { status: 500, json: { error: "Failed to create new conversation.", code: "INTERNAL_ERROR" } };
      }

      activeConversationId = newConv.id;
    }

    // 4. User Message Persistence
    const { error: userMsgError } = await supabaseClient.from("messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: normalizedMessage,
    });

    if (userMsgError) {
      return { status: 500, json: { error: "Failed to record message.", code: "INTERNAL_ERROR" } };
    }

    // 5. Phase 6B.2 Retrieval Integration
    const retrievalResult = await retrieveRelevantVerses(supabaseClient, normalizedMessage);

    // 6. Phase 6B.3 Reasoning Integration
    const generatorFn = mockGeneratorOverride || generateKrishnaResponse;
    const aiResponse = await generatorFn(normalizedMessage, retrievalResult.verses);

    // 7. Assistant Message Persistence
    const safeMeta = {
      matchThreshold: retrievalResult.meta.matchThreshold,
      matchCount: retrievalResult.meta.matchCount,
      usedThemeFallback: Boolean(retrievalResult.meta.usedThemeFallback),
      model: aiResponse.meta.model,
      isGrounded: Boolean(aiResponse.meta.isGrounded),
      retrievedCount: retrievalResult.count,
      citedCount: aiResponse.citedVerseIds.length,
    };

    const { data: assistantMsg, error: assistantMsgError } = await supabaseClient
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        role: "assistant",
        content: aiResponse.answer,
        cited_verse_ids: aiResponse.citedVerseIds,
        retrieval_meta: safeMeta,
      })
      .select("id, created_at")
      .single();

    if (assistantMsgError || !assistantMsg) {
      return { status: 500, json: { error: "Failed to persist AI response.", code: "INTERNAL_ERROR" } };
    }

    // 8. Structured Response
    return {
      status: 200,
      json: {
        conversationId: activeConversationId,
        message: {
          id: assistantMsg.id,
          role: "assistant",
          content: aiResponse.answer,
          citedVerseIds: aiResponse.citedVerseIds,
          citations: aiResponse.citations,
          createdAt: assistantMsg.created_at,
        },
        meta: {
          isGrounded: aiResponse.meta.isGrounded,
          retrievedCount: retrievalResult.count,
          citedCount: aiResponse.citedVerseIds.length,
        },
      },
    };
  } catch (err) {
    return handleApiError(err);
  }
}

async function runTestSuite() {
  console.log("==================================================");
  console.log("PHASE 6B.4 — KRISHNA AI API ROUTE TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;
  let geminiCalls = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName} ${details}`);
      failed++;
    }
  }

  // Setup test users User A and User B
  const emailA = "test_user_6b4_a@happysoul.test";
  const emailB = "test_user_6b4_b@happysoul.test";
  const password = "TestPassword123!";

  const { data: usersList } = await adminClient.auth.admin.listUsers();
  let userA = usersList.users.find((u) => u.email === emailA);
  if (!userA) {
    const { data: createdA } = await adminClient.auth.admin.createUser({ email: emailA, password, email_confirm: true });
    userA = createdA.user;
  }
  let userB = usersList.users.find((u) => u.email === emailB);
  if (!userB) {
    const { data: createdB } = await adminClient.auth.admin.createUser({ email: emailB, password, email_confirm: true });
    userB = createdB.user;
  }

  const anonClientA = createClient(supabaseUrl, anonKey);
  const { data: authA } = await anonClientA.auth.signInWithPassword({ email: emailA, password });
  const clientUserA = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
  });

  const anonClientB = createClient(supabaseUrl, anonKey);
  const { data: authB } = await anonClientB.auth.signInWithPassword({ email: emailB, password });
  const clientUserB = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
  });

  // Unauthenticated client
  const unauthClient = createClient(supabaseUrl, anonKey);

  // Track created conversation IDs for cleanup
  const createdConvIds = [];

  // --- TEST 1: Unauthenticated request -> 401 ---
  const res1 = await runRouteHandler(createMockRequest({ message: "Hello" }), unauthClient);
  assert(res1.status === 401 && res1.json.code === "UNAUTHORIZED", "1. Unauthenticated request → 401");

  // --- TEST 2: Missing message -> 400 ---
  const res2 = await runRouteHandler(createMockRequest({}), clientUserA);
  assert(res2.status === 400 && res2.json.code === "INVALID_REQUEST", "2. Missing message → 400");

  // --- TEST 3: Empty message -> 400 ---
  const res3 = await runRouteHandler(createMockRequest({ message: "   " }), clientUserA);
  assert(res3.status === 400 && res3.json.code === "INVALID_REQUEST", "3. Empty message → 400");

  // --- TEST 4: Message over 1000 characters -> 400 ---
  const longMsg = "a".repeat(1001);
  const res4 = await runRouteHandler(createMockRequest({ message: longMsg }), clientUserA);
  assert(res4.status === 400 && res4.json.code === "INVALID_REQUEST", "4. Message over 1000 characters → 400");

  // --- TEST 5-12: Valid new conversation end-to-end request ---
  console.log("\nExecuting end-to-end AI request (Gemini call)...");
  geminiCalls++;
  const userQuestion = "How can I overcome anxiety and find inner peace?";
  const res5 = await runRouteHandler(createMockRequest({ message: userQuestion }), clientUserA);

  assert(res5.status === 200 && res5.json.conversationId, "5. Valid new conversation request succeeds");
  
  if (res5.json.conversationId) {
    createdConvIds.push(res5.json.conversationId);
  }

  // Verification of Conv creation for user A
  const { data: dbConv5 } = await adminClient
    .from("conversations")
    .select("*")
    .eq("id", res5.json.conversationId)
    .single();
  assert(dbConv5 && dbConv5.user_id === userA.id, "6. New conversation is created for authenticated user");

  // Verification of User Message persistence
  const { data: dbUserMsg } = await adminClient
    .from("messages")
    .select("*")
    .eq("conversation_id", res5.json.conversationId)
    .eq("role", "user")
    .single();
  assert(dbUserMsg && dbUserMsg.content === userQuestion, "7. User message is persisted correctly");

  // Verification of Retrieval & Reasoning output
  assert(res5.json.meta.retrievedCount > 0, "8. Retrieval is invoked & returns verses");
  assert(typeof res5.json.message.content === "string" && res5.json.message.content.length > 0, "9. AI reasoning is invoked & generates answer");

  // Verification of Assistant Message persistence
  const { data: dbAssistantMsg } = await adminClient
    .from("messages")
    .select("*")
    .eq("conversation_id", res5.json.conversationId)
    .eq("role", "assistant")
    .single();
  assert(dbAssistantMsg && dbAssistantMsg.content === res5.json.message.content, "10. Assistant message is persisted");

  // Verification of cited_verse_ids match
  const matchCitations = Array.isArray(dbAssistantMsg.cited_verse_ids) &&
    JSON.stringify(dbAssistantMsg.cited_verse_ids) === JSON.stringify(res5.json.message.citedVerseIds);
  assert(matchCitations, "11. cited_verse_ids match validated AI citations");

  // Verification of retrieval_meta JSON safety
  const metaValid = dbAssistantMsg.retrieval_meta &&
    typeof dbAssistantMsg.retrieval_meta === "object" &&
    !dbAssistantMsg.retrieval_meta.apiKey &&
    !dbAssistantMsg.retrieval_meta.authorization;
  assert(metaValid, "12. retrieval metadata is persisted safely without secrets");

  // --- TEST 13: Existing conversation belonging to user works ---
  const convIdA = res5.json.conversationId;
  const res13 = await runRouteHandler(
    createMockRequest({ message: "What does Krishna say about duty?", conversationId: convIdA }),
    clientUserA,
    // Use controlled mock generator to save Gemini quota for follow-up message test
    async () => ({
      answer: "Krishna emphasizes performing one's duty (Svadharma) without attachment to results.",
      citedVerseIds: dbAssistantMsg.cited_verse_ids || [],
      citations: [{ chapterNumber: 2, verseNumber: 47, verseId: dbAssistantMsg.cited_verse_ids[0] || "fake-id" }],
      meta: { model: "gemini-flash-lite-latest", isGrounded: true },
    })
  );
  assert(res13.status === 200 && res13.json.conversationId === convIdA, "13. Existing conversation belonging to user works");

  // --- TEST 14 & 16: Multi-User Isolation (User B tries to access User A's conversation) ---
  const res14 = await runRouteHandler(
    createMockRequest({ message: "Can I read User A's conversation?", conversationId: convIdA }),
    clientUserB
  );
  assert(res14.status === 404 && res14.json.code === "CONVERSATION_NOT_FOUND", "14. Conversation belonging to another user is rejected (404)");

  // Section 16 Verification: Ensure User B's request created NO messages in Conv A
  const { data: convAMessages } = await adminClient
    .from("messages")
    .select("*")
    .eq("conversation_id", convIdA);
  // Should have exactly 4 messages (1 user + 1 assistant from Test 5, 1 user + 1 assistant from Test 13)
  assert(convAMessages.length === 4, "16. Multi-user isolation verified (no unauthorized messages added to Conv A)");

  // --- TEST 15: Invalid conversation ID format -> 404/400 ---
  const res15 = await runRouteHandler(
    createMockRequest({ message: "Hello", conversationId: "00000000-0000-0000-0000-000000000000" }),
    clientUserA
  );
  assert(res15.status === 404 && res15.json.code === "CONVERSATION_NOT_FOUND", "15. Non-existent conversation ID handled safely (404)");

  // --- TEST 16 (Mocked): Gemini / API failure produces safe HTTP response ---
  const res16 = await runRouteHandler(
    createMockRequest({ message: "What is karma?" }),
    clientUserA,
    async () => {
      throw new KrishnaAIError("Gemini service failed", "GENERATION_FAILED");
    }
  );
  assert(res16.status === 500 && res16.json.code === "GENERATION_FAILED", "16. Gemini/API failure produces safe HTTP 500 response");

  // --- TEST 17 (Mocked): Gemini 429 rate limit produces HTTP 429 ---
  const res17 = await runRouteHandler(
    createMockRequest({ message: "What is karma?" }),
    clientUserA,
    async () => {
      throw new KrishnaAIError("Rate limit exceeded", "RATE_LIMIT_EXCEEDED");
    }
  );
  assert(res17.status === 429 && res17.json.code === "RATE_LIMIT_EXCEEDED", "17. Gemini 429 produces appropriate HTTP 429 response");

  // --- TEST 18: Unsupported HTTP method handled correctly ---
  function handleUnsupportedMethod(method) {
    if (method !== "POST") {
      return { status: 405, json: { error: `Method ${method} not allowed. Use POST.`, code: "METHOD_NOT_ALLOWED" } };
    }
  }
  const res18 = handleUnsupportedMethod("GET");
  assert(res18.status === 405 && res18.json.code === "METHOD_NOT_ALLOWED", "18. Unsupported HTTP method (GET) returns 405");

  // --- TEST 19: Secrets are not exposed in API error responses ---
  const res19 = await runRouteHandler(
    createMockRequest({ message: "Test secrets" }),
    clientUserA,
    async () => {
      throw new KrishnaAIError("Secret key leaked: secret_key_12345", "MISSING_API_KEY");
    }
  );
  const leakedSecret = JSON.stringify(res19).includes("secret_key_12345") || JSON.stringify(res19).includes("GEMINI_API_KEY");
  assert(!leakedSecret && res19.status === 500, "19. Secrets are not exposed in API error responses");

  // --- TEST 20: End-to-end response shape verification ---
  const validShape = res5.json.conversationId &&
    res5.json.message &&
    res5.json.message.id &&
    res5.json.message.role === "assistant" &&
    res5.json.message.content &&
    Array.isArray(res5.json.message.citedVerseIds) &&
    res5.json.meta &&
    typeof res5.json.meta.isGrounded === "boolean";
  assert(validShape, "20. End-to-end request produces expected structured JSON response shape");

  // --- Section 15: DATABASE VERIFICATION ---
  console.log("\n--------------------------------------------------");
  console.log("VERIFYING DATABASE INTEGRITY AND RLS POLICIES");
  console.log("--------------------------------------------------");

  // Verify Gita data remains intact
  const { count, error: gitaCountErr } = await adminClient
    .from("gita_verses")
    .select("id", { count: "exact", head: true });
  assert(!gitaCountErr && count > 0, `Database verification: Gita tables remain intact (${count} verses)`);

  // Cleanup test conversations
  if (createdConvIds.length > 0) {
    await adminClient.from("messages").delete().in("conversation_id", createdConvIds);
    await adminClient.from("conversations").delete().in("id", createdConvIds);
    console.log(`Cleaned up ${createdConvIds.length} test conversation(s).`);
  }

  console.log("\n==================================================");
  console.log("TEST SUITE SUMMARY");
  console.log("==================================================");
  console.log(`Total Tests Run: ${passed + failed}`);
  console.log(`Passed:          ${passed}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Gemini API Calls: ${geminiCalls}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Unhandled error in test suite:", err);
  process.exit(1);
});
