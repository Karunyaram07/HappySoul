// * GITA VERSE ESSENCE CLIENT COMPONENT - PHASE 6B.9.2
// ! Client Component (runs in browser)
// ? Automatically requests localized verse essence from /api/gita/essence.
// ? Gracefully presents loading, success, and non-blocking failure states.

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerseEssence({ chapter, verse }) {
  const [essence, setEssence] = useState(null);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEssence = useCallback(async () => {
    if (!chapter || !verse) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/gita/essence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter, verse }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate essence.");
      }

      const data = await res.json();
      setEssence(data.essence);
      setLanguage(data.language || "English");
    } catch (err) {
      console.warn("[VerseEssence] Failed to fetch essence:", err.message);
      setError(err.message || "Essence reflection is temporarily resting.");
    } finally {
      setLoading(false);
    }
  }, [chapter, verse]);

  useEffect(() => {
    fetchEssence();
  }, [fetchEssence]);

  // ── 1. Loading State ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="border-accent/40 bg-card/80 shadow-xs overflow-hidden transition-all duration-200">
        <CardHeader className="pb-2 border-b border-border/30 bg-accent/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>Verse Essence</span>
            </span>
          </div>
        </CardHeader>
        <CardContent className="py-6 sm:py-7">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
            <p className="text-xs sm:text-sm font-medium tracking-wide">
              Reflecting on this verse...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── 2. Error / Degraded State (Non-Blocking) ───────────────────────────────
  if (error || !essence) {
    return (
      <Card className="border-border/60 bg-card/60 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Verse Essence</span>
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
            <p>
              Essence reflection is temporarily resting. The canonical translation and commentary are available below.
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEssence}
              className="h-8 px-3 text-xs gap-1.5 cursor-pointer hover:bg-secondary/60"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── 3. Success State ───────────────────────────────────────────────────────
  return (
    <Card className="border-accent/50 bg-gradient-to-br from-card via-card to-accent/5 shadow-xs hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3 border-b border-border/30 bg-accent/5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Verse Essence</span>
          </CardTitle>
          <span className="text-[11px] font-semibold text-foreground/80 px-2.5 py-0.5 rounded-full bg-accent/25 border border-accent/40 font-mono tracking-wide">
            {language}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-5 pb-5 sm:pb-6">
        <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-medium select-text whitespace-pre-line">
          {essence}
        </p>
      </CardContent>
    </Card>
  );
}
