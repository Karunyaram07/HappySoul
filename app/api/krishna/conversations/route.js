// * CHAITANYAM AI CONVERSATIONS LIST API ROUTE - PHASE 6B.6
// ? Authenticated GET endpoint returning up to 20 recent conversation threads
// ? owned by the currently logged-in user, ordered by updated_at DESC.
//
// Endpoint: GET /api/krishna/conversations

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function handleGetConversations(request, supabaseOverride = null) {
  try {
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

    // Explicit defense-in-depth ownership check + RLS enforcement
    const { data: conversations, error: dbError } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to retrieve conversation history.", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    const formattedConversations = (conversations || []).map((conv) => ({
      id: conv.id,
      title: conv.title || "New Conversation",
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    }));

    return NextResponse.json(
      { conversations: formattedConversations },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "An internal server error occurred.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return handleGetConversations(request);
}

// ── Unsupported Method Handlers (HTTP 405) ──────────────────────────────────
export async function POST() {
  return NextResponse.json(
    { error: "Method POST not allowed on this endpoint. Use GET.", code: "METHOD_NOT_ALLOWED" },
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
