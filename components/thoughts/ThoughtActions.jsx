// * THOUGHT ACTIONS TOOLBAR COMPONENT
// ! This is a Client Component (rendered on the browser)
// ? It displays action buttons for copying, sharing, and favoriting quotes, plus a dev-only skip button.

"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Share2, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THOUGHT_UI } from "@/lib/thoughts/constants";

export default function ThoughtActions({ quoteText, authorText, quoteId, onNextThought }) {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const isDev = process.env.NODE_ENV !== "production";

  const handleCopy = async () => {
    try {
      const formatted = `"${quoteText}" — ${authorText}`;
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed: ", err);
    }
  };

  const handleShare = () => {
    alert(`${THOUGHT_UI.share}: ${THOUGHT_UI.comingSoon}`);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Placeholder hook log
    console.log(`Favorite status toggled for thought ${quoteId}: ${!isFavorite}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40 mt-4 w-full">
      {/* Screen Reader Live Region for copy feedback */}
      <span className="sr-only" aria-live="polite">
        {copied ? THOUGHT_UI.copied : ""}
      </span>

      {/* Main Actions Panel */}
      <div className="flex items-center gap-2">
        {/* Copy Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label={THOUGHT_UI.copy}
          className="rounded-xl text-xs font-bold gap-2 cursor-pointer h-9 px-3.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-300"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400">{THOUGHT_UI.copied}</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>{THOUGHT_UI.copy}</span>
            </>
          )}
        </Button>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteToggle}
          aria-label={THOUGHT_UI.favorite}
          title={THOUGHT_UI.favoriteTooltip}
          className="rounded-lg h-9 w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-300"
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          aria-label={THOUGHT_UI.share}
          title={THOUGHT_UI.shareTooltip}
          className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-300"
        >
          <Share2 className="h-4.5 w-4.5" />
        </Button>
      </div>

      {/* Developer Skip Action */}
      {isDev && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextThought}
          aria-label={THOUGHT_UI.nextThought}
          className="rounded-xl text-xs font-bold gap-1 text-primary hover:bg-primary/10 h-9 px-3.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-300"
        >
          <span>{THOUGHT_UI.nextThought}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
