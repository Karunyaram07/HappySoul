// * GITA CITATION BADGE COMPONENT - PHASE 6B.5
// ? Displays non-clickable scripture citation badges based on 6B.4 response contract
// ? ({ chapter, verse }). Does not perform any direct database calls or act like a link.

import React from "react";
import { BookOpen } from "lucide-react";

export default function GitaCitationBadge({ citation }) {
  if (!citation || typeof citation.chapter !== "number" || typeof citation.verse !== "number") {
    return null;
  }

  const label = `Bhagavad Gita ${citation.chapter}.${citation.verse}`;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 text-foreground text-[11px] font-semibold tracking-wide select-none"
      aria-label={`Citation: ${label}`}
    >
      <BookOpen className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
      <span>{label}</span>
    </div>
  );
}
