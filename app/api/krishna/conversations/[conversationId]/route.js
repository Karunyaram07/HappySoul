// * CHAITANYAM AI SINGLE CONVERSATION API ROUTE - PHASE 6B.6
// ? Authenticated GET endpoint returning a specific conversation's messages.
// ? Verifies conversation ownership explicitly against authenticated user.id
// ? (defense-in-depth on top of Supabase RLS). Returns 404 for any
// ? ownership mismatch so as not to reveal whether another user's conversation exists.
//
// Endpoint: GET /api/krishna/conversations/[conversationId]
// Returns:  { conversation: { id, title }, messages: [...] }
// Limits:   100 messages, created_at ASC (oldest first for chronological display)

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse a verse UUID from cited_verse_ids into a citation shape { chapter, verse }
 *  by joining the gita_verses table. We do this with a separate query after fetching
 *  messages so we stay within the strict "no schema change" boundary — we never touch
 *  the messages table and never add a join column. Instead we map citedVerseIds through
 *  a lightweight verse lookup for the citation badges.
 *
 *  NOTE: If cited_verse_ids is empty we skip the lookup entirely.
 */
async function buildCitationsFromVerseIds(supabase, verseIds) {
  if (!Array.isArray(verseIds) || verseIds.length === 0) return [];

  const { data: verses, error } = await supabase
    .from("gita_verses")
    .select("id, chapter_number, verse_number")
    .in("id", verseIds);

  if (error || !verses) return [];

  // Map each stored verse ID to the citation shape the UI expects.
  // Preserve original order from cited_verse_ids so badges appear in insertion order.
  const verseMap = new Map(verses.map((v) => [v.id, v]));

  return verseIds
    .map((id) => {
      const v = verseMap.get(id);
      if (!v) return null;
      return { chapter: v.chapter_number, verse: v.verse_number };
    })
    .filter(Boolean);
}

// ── Main Handler (exported separately for testability) ────────────────────────

export async function handleGetConversation(request, { params }) {
  try {
    const supabase = await createClient();

    // 1. Authentication
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

    // 2. Resolve and validate conversationId param
    const { conversationId } = await params;

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json(
        { error: "Conversation not found.", code: "CONVERSATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Basic UUID format guard — prevents malformed input from hitting the DB
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      return NextResponse.json(
        { error: "Conversation not found.", code: "CONVERSATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 3. Fetch conversation with explicit ownership check (defense-in-depth on top of RLS)
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, title, user_id, created_at, updated_at")
      .eq("id", conversationId)
      .single();

    // Return 404 for any DB error, missing row, or ownership mismatch.
    // Do NOT distinguish "not found" from "belongs to another user" to avoid enumeration.
    if (convError || !conversation || conversation.user_id !== user.id) {
      return NextResponse.json(
        { error: "Conversation not found.", code: "CONVERSATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 4. Fetch messages — max 100, chronological order (oldest first for UI display)
    // If a conversation has > 100 messages we return the OLDEST 100 first so that
    // the conversation history still reads chronologically from the beginning.
    // The most recent messages beyond 100 are silently truncated. This behaviour is
    // documented in docs/6b6.md under "Known Limitations".
    const { data: rawMessages, error: msgError } = await supabase
      .from("messages")
      .select("id, role, content, cited_verse_ids, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (msgError) {
      return NextResponse.json(
        { error: "Failed to retrieve conversation messages.", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    // 5. Build citation shapes for assistant messages
    // Collect all unique verse IDs across all assistant messages in one DB round-trip.
    const allVerseIds = [
      ...new Set(
        (rawMessages || [])
          .filter((m) => m.role === "assistant")
          .flatMap((m) => m.cited_verse_ids || [])
      ),
    ];

    // One lookup for all verses (or empty if no citations)
    let verseMap = new Map();
    if (allVerseIds.length > 0) {
      const { data: verses } = await supabase
        .from("gita_verses")
        .select("id, chapter_number, verse_number")
        .in("id", allVerseIds);

      if (verses) {
        verses.forEach((v) => verseMap.set(v.id, v));
      }
    }

    // 6. Shape messages for the frontend
    const messages = (rawMessages || []).map((msg) => {
      const base = {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at,
      };

      if (msg.role === "assistant") {
        const citedVerseIds = msg.cited_verse_ids || [];
        const citations = citedVerseIds
          .map((id) => {
            const v = verseMap.get(id);
            if (!v) return null;
            return { chapter: v.chapter_number, verse: v.verse_number };
          })
          .filter(Boolean);

        return {
          ...base,
          citedVerseIds,
          citations,
        };
      }

      return base;
    });

    // 7. Return safe response — no user_id, no retrieval_meta, no is_flagged
    return NextResponse.json(
      {
        conversation: {
          id: conversation.id,
          title: conversation.title || "New Conversation",
        },
        messages,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "An internal server error occurred.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// ── Next.js App Router Export ─────────────────────────────────────────────────

export async function GET(request, context) {
  return handleGetConversation(request, context);
}

// ── Unsupported Methods (405) ─────────────────────────────────────────────────

export async function POST() {
  return NextResponse.json(
    { error: "Method POST not allowed. Use GET.", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method PUT not allowed. Use GET.", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method DELETE not allowed. Use GET.", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}
