// * GITA VERSE ESSENCE API ROUTE HANDLER - PHASE 6B.9.2
// ? Authenticated POST endpoint that securely resolves the user's preferred language,
// ? retrieves trusted canonical verse text, and generates a concise localized essence.
//
// Endpoint: POST /api/gita/essence
// Request Body: { chapter: number, verse: number }

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateVerseEssence,
  ALLOWED_LANGUAGES,
} from "@/lib/gita/essenceGenerator";

export async function POST(request) {
  try {
    // ── 1. Authentication ────────────────────────────────────────────────────
    const supabase = await createClient();
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

    // ── 2. Request Parsing & Strict Validation ───────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request payload.", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { chapter, verse } = body || {};

    const chapterNum = Number(chapter);
    const verseNum = Number(verse);

    if (
      !Number.isInteger(chapterNum) ||
      chapterNum < 1 ||
      chapterNum > 18 ||
      !Number.isInteger(verseNum) ||
      verseNum < 1
    ) {
      return NextResponse.json(
        {
          error: "Invalid chapter or verse parameter.",
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    // ── 3. Fetch User Language Server-Side (Never Trust Client) ──────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user.id)
      .maybeSingle();

    const rawLang = profile?.preferred_language;
    const targetLanguage =
      rawLang && ALLOWED_LANGUAGES.includes(rawLang) ? rawLang : "English";

    // ── 4. Fetch Trusted Canonical Verse (No Embeddings) ─────────────────────
    const { data: verseRow, error: verseError } = await supabase
      .from("gita_verses")
      .select("id, chapter_number, verse_number, sanskrit_text, transliteration, translation")
      .eq("chapter_number", chapterNum)
      .eq("verse_number", verseNum)
      .maybeSingle();

    if (verseError) {
      console.error(
        `[Gita Essence API] Database fetch error for ${chapterNum}.${verseNum}:`,
        verseError.message
      );
      return NextResponse.json(
        { error: "Failed to retrieve verse data.", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    if (!verseRow) {
      return NextResponse.json(
        { error: "Verse not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // ── 5. Generate Essence via Isolated Gemini Engine ───────────────────────
    let result;
    try {
      result = await generateVerseEssence({
        chapter: verseRow.chapter_number,
        verse: verseRow.verse_number,
        sanskrit: verseRow.sanskrit_text,
        translation: verseRow.translation,
        targetLanguage,
      });
    } catch (genError) {
      console.error(
        `[Gita Essence API] Generation failure for ${chapterNum}.${verseNum}:`,
        genError.message || genError
      );

      if (genError.statusCode === 429) {
        return NextResponse.json(
          {
            error: "AI service rate limit exceeded. Please try again shortly.",
            code: "RATE_LIMIT_EXCEEDED",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to generate verse essence.",
          code: "GENERATION_FAILED",
        },
        { status: 502 }
      );
    }

    // ── 6. Structured Safe Response ──────────────────────────────────────────
    return NextResponse.json(
      {
        chapter: verseRow.chapter_number,
        verse: verseRow.verse_number,
        language: targetLanguage,
        essence: result.essence,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Gita Essence API] Unhandled server error:", error);
    return NextResponse.json(
      { error: "Internal server error.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
