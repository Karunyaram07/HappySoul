// * THOUGHT CATEGORY BADGE COMPONENT
// ! This is a Client Component (rendered on the browser)
// ? It displays the category of the thought with styled colors matching the brand identity.

"use client";

import React from "react";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES = {
  "Bhagavad Gita": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Peace": "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  "Mindfulness": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Gratitude": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  "Positivity": "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  "Self Discipline": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Motivation": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  "Spiritual Growth": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

export default function ThoughtCategory({ category }) {
  const styles = CATEGORY_STYLES[category] || CATEGORY_STYLES["Peace"];

  return (
    <span
      className={cn(
        "inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border transition-colors select-none tracking-wider uppercase",
        styles
      )}
    >
      {category}
    </span>
  );
}
