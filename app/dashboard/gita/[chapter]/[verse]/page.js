// * BHAGAVAD GITA VERSE DETAIL PAGE - PHASE 6B.8
// ! Server Component (runs strictly on server)
// ? Displays verified verse details with Sanskrit, transliteration, translation,
// ? commentary, and contextual chapter metadata.
// ? Authenticated via existing Supabase server client.

import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Quote,
  Compass,
  Sun,
  Heart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import VerseEssence from "@/components/gita/VerseEssence";

/**
 * Generate metadata for the verse detail page.
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawChapter = resolvedParams?.chapter;
  const rawVerse = resolvedParams?.verse;

  const isDigitsOnly = (str) =>
    typeof str === "string" && /^\d+$/.test(str.trim());

  if (!isDigitsOnly(rawChapter) || !isDigitsOnly(rawVerse)) {
    return { title: "Verse Not Found – Happy Soul" };
  }

  const chapterNum = parseInt(rawChapter, 10);
  const verseNum = parseInt(rawVerse, 10);

  if (chapterNum < 1 || chapterNum > 18 || verseNum < 1) {
    return { title: "Verse Not Found – Happy Soul" };
  }

  return {
    title: `Bhagavad Gita ${chapterNum}.${verseNum} – Happy Soul`,
    description: `Read and reflect on Bhagavad Gita Chapter ${chapterNum}, Verse ${verseNum} with original Sanskrit text, English translation, and commentary.`,
  };
}

/**
 * Main Server Component for Verse Detail View
 */
export default async function VerseDetailPage({ params }) {
  // ── 1. Param Resolution & Strict Validation ────────────────────────────────
  const resolvedParams = await params;
  const rawChapter = resolvedParams?.chapter;
  const rawVerse = resolvedParams?.verse;

  const isDigitsOnly = (str) =>
    typeof str === "string" && /^\d+$/.test(str.trim());

  if (!isDigitsOnly(rawChapter) || !isDigitsOnly(rawVerse)) {
    notFound();
  }

  const chapterNum = parseInt(rawChapter, 10);
  const verseNum = parseInt(rawVerse, 10);

  if (
    !Number.isInteger(chapterNum) ||
    chapterNum < 1 ||
    chapterNum > 18 ||
    !Number.isInteger(verseNum) ||
    verseNum < 1
  ) {
    notFound();
  }

  // ── 2. Authenticated Server Data Access ────────────────────────────────────
  const supabase = await createClient();

  // Authentication Guard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // ── 3. Query Verse & Associated Chapter ────────────────────────────────────
  // Explicitly select only display fields — NEVER select embeddings.
  const { data: verse, error } = await supabase
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
    .eq("chapter_number", chapterNum)
    .eq("verse_number", verseNum)
    .maybeSingle();

  if (error) {
    // Internal log — do not expose raw database error to user
    console.error(
      `[Gita Verse Detail] Database query failed for ${chapterNum}.${verseNum}:`,
      error.message
    );
    notFound();
  }

  if (!verse) {
    notFound();
  }

  const chapter = Array.isArray(verse.gita_chapters)
    ? verse.gita_chapters[0]
    : verse.gita_chapters;

  // ── 4. Conditional Content Flags ───────────────────────────────────────────
  const hasWordMeanings = Boolean(
    verse.word_meanings && verse.word_meanings.trim().length > 0
  );
  const hasPracticalInsight = Boolean(
    verse.practical_insight && verse.practical_insight.trim().length > 0
  );
  const hasModernExplanation = Boolean(
    verse.modern_explanation && verse.modern_explanation.trim().length > 0
  );
  const hasMoodRelevance = Boolean(
    verse.mood_relevance && verse.mood_relevance.trim().length > 0
  );
  const hasCommentary = Boolean(
    verse.commentary && verse.commentary.trim().length > 0
  );

  return (
    <div className="relative min-h-screen bg-background py-8 sm:py-12">
      {/* Calm glowing backdrops matching sanctuary theme */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] left-[10%] h-[320px] w-[320px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[350px] w-[350px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* ── Back Navigation ──────────────────────────────────────────────── */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* ── Chapter Context & Verse Header ───────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-foreground text-xs font-semibold tracking-wide">
              <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Chapter {verse.chapter_number}</span>
            </span>

            {chapter?.name_translated && (
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                • {chapter.name_translated}
                {chapter.name_transliterated && ` (${chapter.name_transliterated})`}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Bhagavad Gita {verse.chapter_number}.{verse.verse_number}
            </h1>
            {chapter?.name && (
              <span className="text-lg sm:text-xl font-serif text-muted-foreground font-semibold">
                {chapter.name}
              </span>
            )}
          </div>

          {chapter?.name_meaning && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {chapter.name_meaning}
            </p>
          )}
        </div>

        {/* ── Sacred Sanskrit Section ──────────────────────────────────────── */}
        <Card className="border-accent/40 bg-card/90 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/40 bg-accent/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Original Sanskrit Verse</span>
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                {verse.chapter_number}.{verse.verse_number}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8">
            <div className="text-center px-2 sm:px-6">
              <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed sm:leading-loose tracking-wide whitespace-pre-line select-text">
                {verse.sanskrit_text?.trim()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Transliteration Section ──────────────────────────────────────── */}
        {verse.transliteration && (
          <Card className="border-border/80 bg-card/60 shadow-xs">
            <CardHeader className="pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Roman Transliteration
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground italic leading-relaxed text-center whitespace-pre-line select-text font-medium">
                {verse.transliteration.trim()}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── AI-Powered Verse Essence (Localized) ────────────────────────── */}
        <VerseEssence
          chapter={verse.chapter_number}
          verse={verse.verse_number}
        />

        {/* ── Word-by-Word Meanings (Conditional) ───────────────────────────── */}
        {hasWordMeanings && (
          <div className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Word-by-Word Meanings</span>
            </h4>
            <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed select-text font-mono">
              {verse.word_meanings.trim()}
            </p>
          </div>
        )}

        {/* ── Translation Section ──────────────────────────────────────────── */}
        <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Quote className="h-4 w-4 text-primary" />
                <span>Translation</span>
              </CardTitle>
              {verse.translation_author && (
                <span className="text-[11px] font-semibold text-muted-foreground px-2.5 py-0.5 rounded-full bg-secondary border border-border/60">
                  {verse.translation_author}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg text-foreground font-medium leading-relaxed italic select-text">
              &ldquo;{verse.translation?.trim()}&rdquo;
            </p>
          </CardContent>
        </Card>

        {/* ── Commentary Section (Conditional) ─────────────────────────────── */}
        {hasCommentary && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Commentary & Purport</span>
                </CardTitle>
                {verse.commentary_author && (
                  <span className="text-[11px] font-semibold text-muted-foreground px-2.5 py-0.5 rounded-full bg-secondary border border-border/60">
                    {verse.commentary_author}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line space-y-4 select-text">
                {verse.commentary.trim()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Optional Custom Insights ─────────────────────────────────────── */}
        {hasPracticalInsight && (
          <Card className="border-accent/40 bg-accent/5 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Practical Insight for Daily Life</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed select-text">
                {verse.practical_insight.trim()}
              </p>
            </CardContent>
          </Card>
        )}

        {hasModernExplanation && (
          <Card className="border-primary/30 bg-primary/5 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                <Sun className="h-4 w-4 text-primary" />
                <span>Modern Explanation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed select-text">
                {verse.modern_explanation.trim()}
              </p>
            </CardContent>
          </Card>
        )}

        {hasMoodRelevance && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Emotional & Mindful Resonance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed select-text">
                {verse.mood_relevance.trim()}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Footer Navigation ────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
          <span>Bhagavad Gita Wisdom</span>
          <Link
            href="/dashboard"
            className="text-primary hover:underline font-semibold"
          >
            Return to Sanctuary
          </Link>
        </div>
      </div>
    </div>
  );
}
