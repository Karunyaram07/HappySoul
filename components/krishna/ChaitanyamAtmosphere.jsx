"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";
import AmbientParticles from "@/components/motion/AmbientParticles";
import PeacockFeatherMotif from "./PeacockFeatherMotif";
import FluteMotif from "./FluteMotif";

/**
 * ChaitanyamAtmosphere
 * Dedicated Krishna-inspired atmospheric background layer for /dashboard/chaitanyam.
 *
 * Layers:
 * 1. Base container with theme transitions (Obsidian/forest dark, warm cream light).
 * 2. Provided asset (chaitanyam-bg-light.png) with tailored light/dark blending.
 * 3. Soft cream/forest veil & gradient wash (ensures 100% chat contrast & focus).
 * 4. Sacred radial glowing auroras (Peacock blue, restrained gold, deep forest).
 * 5. Subtle SVG feather & flute watermark motifs.
 * 6. Vrindavan forest starlight / golden particles (3 particles max, battery-friendly).
 */
export default function ChaitanyamAtmosphere({ className = "" }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none transition-colors duration-700 ${className}`}
    >
      {/* ── 1. BASE COLOR LAYER ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[#fbf9f4] dark:bg-[#0b120f] transition-colors duration-700" />

      {/* ── 2. PROVIDED ARTWORK LAYER (chaitanyam-bg-light.png) ─────────── */}
      {/*
        Light mode: Soft atmospheric presence on the right (opacity ~65-75%), letting
        the serene flute and peacock feather show without distracting from chat.
        Dark mode: Blended subtly into obsidian forest with mix-blend-luminosity and
        low opacity (~15%) so the artwork feels natively illuminated by moonlight.
      */}
      <div
        className="absolute inset-0 bg-no-repeat bg-right bg-cover md:bg-contain opacity-70 dark:opacity-15 dark:mix-blend-luminosity dark:contrast-125 dark:brightness-90 transition-opacity duration-700"
        style={{
          backgroundImage: "url('/chaitanyam-assets/chaitanyam-bg-light.png')",
        }}
      />

      {/* ── 3. SOFT CREAM/FOREST OVERLAYS & CONTRAST GRADIENT ───────────── */}
      {/* Ensures chat stream, citations, and sidebar have pristine contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#fbf9f4]/95 via-[#fbf9f4]/80 to-transparent dark:from-[#0b120f]/95 dark:via-[#0b120f]/80 dark:to-[#0b120f]/40 transition-colors duration-700" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbf9f4]/70 via-transparent to-[#fbf9f4]/90 dark:from-[#0b120f]/75 dark:via-transparent dark:to-[#0b120f]/90 transition-colors duration-700" />

      {/* ── 4. RADIAL GLOWS (PEACOCK BLUE, GOLD, DEEP FOREST) ───────────── */}
      {/* Peacock Blue Aurora (top right, behind artwork) */}
      <div
        className="absolute -top-10 right-0 sm:right-12 h-[340px] w-[340px] sm:h-[460px] sm:w-[460px] rounded-full bg-sky-500/10 dark:bg-teal-500/15 blur-[120px] transition-all duration-700"
      />

      {/* Restrained Sacred Gold Warmth (center right) */}
      <div
        className="absolute top-1/3 right-1/4 h-[280px] w-[280px] sm:h-[360px] sm:w-[360px] rounded-full bg-amber-400/12 dark:bg-amber-500/10 blur-[110px] transition-all duration-700"
      />

      {/* Vrindavan Deep Forest Mist (bottom left) */}
      <div
        className="absolute bottom-0 left-10 h-[320px] w-[320px] rounded-full bg-emerald-700/8 dark:bg-emerald-950/30 blur-[130px] transition-all duration-700"
      />

      {/* ── 5. WATERMARK MOTIFS (PEACOCK FEATHER & FLUTE) ───────────────── */}
      {/* Subtle Feather watermark in top-right atmosphere */}
      <div className="absolute -top-4 right-6 sm:right-20 w-36 sm:w-56 h-64 sm:h-96 opacity-20 dark:opacity-30">
        <PeacockFeatherMotif />
      </div>

      {/* Delicate Flute watermark floating in background */}
      <div className="hidden lg:block absolute bottom-16 right-16 w-80 h-20 opacity-15 dark:opacity-20 rotate-[-8deg]">
        <FluteMotif />
      </div>

      {/* ── 6. VRINDAVAN STARLIGHT / GOLDEN FLOATING PARTICLES ───────────── */}
      {/* 3 tiny golden particles drifting gently; automatically disabled on prefers-reduced-motion */}
      <div className="absolute inset-0 opacity-70 dark:opacity-80">
        <AmbientParticles
          count={3}
          variant="dots"
          color="accent"
          duration={16}
        />
      </div>
    </div>
  );
}
