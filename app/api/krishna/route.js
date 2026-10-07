// * KRISHNA AI API ROUTE HANDLER - PHASE 6B.4
// ? Authenticated POST endpoint connecting user auth, request validation,
// ? 6B.2 semantic retrieval, 6B.3 grounded AI reasoning, and DB persistence.
//
// Endpoint: POST /api/krishna

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retrieveRelevantVerses } from "@/lib/krishna/retrieval";
import { generateKrishnaResponse, KrishnaAIError } from "@/lib/krishna/generator";

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Normalizes user input text by trimming and collapsing consecutive whitespace.
 * @param {string} text - Raw input string
 * @returns {string} Normalized string
 */
function normalizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Maps application errors to clean HTTP response payloads.
 * Prevents leaking secrets, API keys, database credentials, or stack traces.
 *
 * @param {Error|any} err - Caught error
 * @returns {NextResponse} Formatted JSON response with status code
 */
function handleApiError(err) {
  // Handle 6B.3 KrishnaAIError instances
  if (err instanceof KrishnaAIError) {
    switch (err.code) {
      case "MISSING_API_KEY":
      case "AUTH_FAILED":
        return NextResponse.json(
          { error: "AI service configuration error.", code: "INTERNAL_ERROR" },
          { status: 500 }
        );
      case "RATE_LIMIT_EXCEEDED":
        return NextResponse.json(
          { error: "AI service rate limit exceeded. Please try again shortly.", code: "RATE_LIMIT_EXCEEDED" },
          { status: 429 }
        );
      case "SERVICE_UNAVAILABLE":
        return NextResponse.json(
          { error: "AI service is temporarily unavailable. Please try again shortly.", code: "SERVICE_UNAVAILABLE" },
          { status: 503 }
        );
      case "INVALID_INPUT":
        return NextResponse.json(
          { error: err.userMessage, code: "INVALID_REQUEST" },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { error: "AI response generation failed. Please try again.", code: "GENERATION_FAILED" },
          { status: 500 }
        );
    }
  }

  // Handle standard JSON syntax errors or payload errors
  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Invalid JSON payload in request body.", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  // Generic fallback
  return NextResponse.json(
    { error: "An internal server error occurred.", code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}

export async function handleKrishnaRequest(request, supabaseOverride = null) {
  try {
    // ── 1. Authentication Check ──────────────────────────────────────────────
    // Must use user's session client — service-role client is NOT used for user requests.
    const supabase = supabaseOverride || (await createClient());
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // ── 2. Request Payload Validation ────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload in request body.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a valid JSON object.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const { message, conversationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message field is required and must be a string.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const normalizedMessage = normalizeText(message);

    if (!normalizedMessage) {
      return NextResponse.json(
        { error: "Message cannot be empty or whitespace only.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    // ── 3. Conversation Handling & User Isolation ─────────────────────────────
    let activeConversationId = null;

    if (conversationId) {
      if (typeof conversationId !== "string" || !conversationId.trim()) {
        return NextResponse.json(
          { error: "Invalid conversation ID format.", code: "INVALID_REQUEST" },
          { status: 400 }
        );
      }

      // Verify conversation belongs strictly to the authenticated user via RLS & explicit check
      const { data: existingConv, error: convError } = await supabase
        .from("conversations")
        .select("id, user_id")
        .eq("id", conversationId.trim())
        .single();

      if (convError || !existingConv || existingConv.user_id !== user.id) {
        // Return 404 without leaking whether another user's conversation exists
        return NextResponse.json(
          { error: "Conversation not found.", code: "CONVERSATION_NOT_FOUND" },
          { status: 404 }
        );
      }

      activeConversationId = existingConv.id;
    } else {
      // Create new conversation for authenticated user
      const titleSnippet = normalizedMessage.length > 50
        ? normalizedMessage.substring(0, 50) + "..."
        : normalizedMessage;

      const { data: newConv, error: createConvError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: titleSnippet,
        })
        .select("id")
        .single();

      if (createConvError || !newConv) {
        return NextResponse.json(
          { error: "Failed to create new conversation.", code: "INTERNAL_ERROR" },
          { status: 500 }
        );
      }

      activeConversationId = newConv.id;
    }

    // ── 4. User Message Persistence ──────────────────────────────────────────
    const { error: userMsgError } = await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: normalizedMessage,
    });

    if (userMsgError) {
      return NextResponse.json(
        { error: "Failed to record message.", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    // ── 5. Phase 6B.2 Retrieval Integration ──────────────────────────────────
    // Uses the user's authenticated Supabase client
    const retrievalResult = await retrieveRelevantVerses(
      supabase,
      normalizedMessage
    );

    // ── 6. Phase 6B.3 Reasoning Integration ──────────────────────────────────
    const aiResponse = await generateKrishnaResponse(
      normalizedMessage,
      retrievalResult.verses
    );

    // ── 7. Assistant Message Persistence ─────────────────────────────────────
    // Store only safe metadata and strictly validated verse UUIDs
    const safeMeta = {
      matchThreshold: retrievalResult.meta.matchThreshold,
      matchCount: retrievalResult.meta.matchCount,
      usedThemeFallback: Boolean(retrievalResult.meta.usedThemeFallback),
      model: aiResponse.meta.model,
      isGrounded: Boolean(aiResponse.meta.isGrounded),
      retrievedCount: retrievalResult.count,
      citedCount: aiResponse.citedVerseIds.length,
    };

    const { data: assistantMsg, error: assistantMsgError } = await supabase
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
      return NextResponse.json(
        { error: "Failed to persist AI response.", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    // ── 8. Structured Response ───────────────────────────────────────────────
    return NextResponse.json(
      {
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
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  return handleKrishnaRequest(request);
}

// ── Unsupported Method Handlers (HTTP 405) ──────────────────────────────────
export async function GET() {
  return NextResponse.json(
    { error: "Method GET not allowed. Use POST.", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method PUT not allowed. Use POST.", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method DELETE not allowed. Use POST.", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}
