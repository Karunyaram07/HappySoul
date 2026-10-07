"use client";

import React, { useId } from "react";
import { useReducedMotion } from "framer-motion";
import AmbientParticles from "@/components/motion/AmbientParticles";

/**
 * CalmBreathAtmosphere
 * Pure mental-wellness ambient environment for the main dashboard (/dashboard).
 *
 * Visual Concept: "Calm Breath" (Pause → Breathe → Reset)
 * - Central/organic breathing orb with slow 18s expansion & contraction
 * - Soft secondary tranquil aura in opposing corner
 * - 3 minimal floating particles in quiet backdrop space
 * - Light palette: soft sage, warm cream, faint serene blue
 * - Dark palette: obsidian slate, deep forest, muted sage, tranquil slate-indigo
 * - Exclusively abstract mindfulness aesthetic.
 */
export default function CalmBreathAtmosphere({ className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const breathAnimId = `hs-breath-${rawId.replace(/:/g, "")}`;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none transition-colors duration-500 ${className}`}
    >
      <style>{`
        @keyframes ${breathAnimId}-pulse {
          0%, 100% {
            transform: scale(0.96) translate3d(0, 0, 0);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.06) translate3d(10px, -8px, 0);
            opacity: 1;
          }
        }
        @keyframes ${breathAnimId}-drift {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.65;
          }
          50% {
            transform: translate3d(-12px, 10px, 0) scale(1.04);
            opacity: 0.9;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .${breathAnimId}-orb, .${breathAnimId}-aura {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ── 1. PRIMARY BREATHING ORB (TOP-LEFT / CENTER) ─────────────────── */}
      {/* Soft sage & cream in light mode, deep obsidian forest in dark mode */}
      <div
        className={`absolute -top-16 left-6 sm:left-[12%] h-[380px] w-[380px] sm:h-[480px] sm:w-[480px] rounded-full blur-[110px] sm:blur-[135px] transition-all duration-700 ${breathAnimId}-orb bg-emerald-600/6 dark:bg-emerald-500/8`}
        style={
          shouldReduceMotion
            ? { animation: "none" }
            : { animation: `${breathAnimId}-pulse 18s ease-in-out infinite` }
        }
      />

      {/* ── 2. SECONDARY TRANQUIL AURA (LOWER-RIGHT) ────────────────────── */}
      {/* Muted lavender/sky in light mode, tranquil midnight slate in dark mode */}
      <div
        className={`absolute bottom-20 right-4 sm:right-[15%] h-[320px] w-[320px] sm:h-[440px] sm:w-[440px] rounded-full blur-[100px] sm:blur-[130px] transition-all duration-700 ${breathAnimId}-aura bg-sky-500/5 dark:bg-indigo-500/8`}
        style={
          shouldReduceMotion
            ? { animation: "none" }
            : {
                animation: `${breathAnimId}-drift 22s ease-in-out infinite`,
                animationDelay: "3s",
              }
        }
      />

      {/* ── 3. WARM SUNLIGHT HIGHLIGHT (SUBTLE TOP-RIGHT) ────────────────── */}
      <div className="absolute top-1/4 right-[8%] h-[240px] w-[240px] rounded-full bg-amber-400/5 dark:bg-amber-500/5 blur-[90px]" />

      {/* ── 4. QUIET AREA FLOATING PARTICLES (3 MINIMAL DOTS) ───────────── */}
      {/* Very low opacity, battery-safe; disabled automatically on reduced-motion */}
      <div className="absolute inset-0 opacity-40 dark:opacity-45">
        <AmbientParticles
          count={3}
          variant="dots"
          color="secondary"
          duration={18}
        />
      </div>
    </div>
  );
}
