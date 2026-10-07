// * GITA CITATION BADGE COMPONENT - PHASE 6B.8
// ? Displays interactive scripture citation badges based on 6B.4 response contract
// ? ({ chapter, verse }). Navigates to dedicated verse detail view.
// ? If coordinates are invalid, gracefully falls back to non-interactive badge.

import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

/**
 * Validate chapter and verse coordinates:
 * - chapter: integer 1–18
 * - verse: positive integer >= 1
 */
function isValidCitation(citation) {
  if (!citation || typeof citation !== "object") return false;
  const { chapter, verse } = citation;
  return (
    Number.isInteger(chapter) &&
    chapter >= 1 &&
    chapter <= 18 &&
    Number.isInteger(verse) &&
    verse >= 1
  );
}

export default function GitaCitationBadge({ citation }) {
  if (!citation) {
    return null;
  }

  const { chapter, verse } = citation;
  const valid = isValidCitation(citation);
  const label = `Bhagavad Gita ${chapter}.${verse}`;

  // If coordinates are invalid, render non-interactive visual badge
  if (!valid) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 text-foreground text-[11px] font-semibold tracking-wide select-none opacity-80"
        aria-label={`Citation: ${label}`}
      >
        <BookOpen className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/dashboard/gita/${chapter}/${verse}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 text-foreground text-[11px] font-semibold tracking-wide select-none cursor-pointer transition-all duration-150 hover:bg-accent/30 hover:border-accent/60 hover:shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 group"
      aria-label={`Open Bhagavad Gita ${chapter}.${verse}`}
      title={`Read Bhagavad Gita ${chapter}.${verse} in detail`}
    >
      <BookOpen className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0 transition-transform group-hover:scale-110" />
      <span className="group-hover:underline underline-offset-2">{label}</span>
    </Link>
  );
}

