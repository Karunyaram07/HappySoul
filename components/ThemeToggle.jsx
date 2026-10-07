// * THEME TOGGLE BUTTON — PHASE 6C.2.2
// ! Client Component with accessible keyboard, focus, and screen-reader controls
// ? Toggles between light and dark themes using next-themes.
// ? Uses client-mounted guard to prevent SSR hydration mismatches.

"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle
 * Accessible button to switch between light and dark themes.
 *
 * @param {string} className - Optional styling classes
 * @param {boolean} compact - Compact size for dense headers / mobile bars
 */
export default function ThemeToggle({ className = "", compact = false }) {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Prevent hydration mismatch by mounting client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration-safe placeholder matching the rendered geometry
  if (!mounted) {
    return (
      <div
        className={
          compact
            ? `h-9 w-9 rounded-lg border border-border/80 bg-background/50 ${className}`
            : `h-[46px] w-[46px] rounded-2xl border border-border/80 bg-card ${className}`
        }
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={
        compact
          ? `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none ${className}`
          : `flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-card hover:bg-secondary/50 text-muted-foreground hover:text-foreground shadow-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none ${className}`
      }
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <Sun
          className={
            compact
              ? "h-4 w-4 text-amber-300 transition-transform duration-300 hover:rotate-45"
              : "h-5 w-5 text-amber-300 transition-transform duration-300 hover:rotate-45"
          }
          aria-hidden="true"
        />
      ) : (
        <Moon
          className={
            compact
              ? "h-4 w-4 text-muted-foreground transition-transform duration-300 hover:-rotate-12"
              : "h-5 w-5 text-muted-foreground transition-transform duration-300 hover:-rotate-12"
          }
          aria-hidden="true"
        />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
