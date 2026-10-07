"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * FluteMotif
 * Lightweight, accessible SVG decorative Krishna Bansuri (flute) line art.
 * Subtly captures the sacred flute with tone holes, thread wrappings, and hanging pearls.
 *
 * @param {string} className - Additional CSS positioning/sizing classes
 * @param {number} opacity - Master opacity factor (default 0.20)
 * @param {boolean} animated - Whether to apply subtle breathing shimmer (default true)
 */
export default function FluteMotif({
  className = "",
  opacity = 0.22,
  animated = true,
}) {
  const shouldReduceMotion = useReducedMotion();
  const isAnimated = animated && !shouldReduceMotion;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
    >
      <style>{`
        @keyframes hs-flute-glow {
          0%, 100% {
            opacity: 0.85;
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate3d(2px, -3px, 0) scale(1.015);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hs-flute-anim {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 420 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${isAnimated ? "hs-flute-anim" : ""}`}
        style={
          isAnimated
            ? { animation: "hs-flute-glow 16s ease-in-out infinite" }
            : undefined
        }
      >
        <defs>
          <linearGradient id="hs-flute-body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#d97706" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="hs-flute-thread" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          <linearGradient id="hs-flute-pearls" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f8fafc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Main Flute Body (Slightly tilted bamboo cylinder) */}
        <rect
          x="40"
          y="28"
          width="340"
          height="14"
          rx="7"
          fill="url(#hs-flute-body)"
          stroke="#78350f"
          strokeWidth="0.8"
        />

        {/* Highlight sheen along top edge */}
        <line
          x1="52"
          y1="31"
          x2="368"
          y2="31"
          stroke="#fef08a"
          strokeWidth="1.2"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />

        {/* Decorative thread binding (Left end) */}
        <rect
          x="48"
          y="26"
          width="10"
          height="18"
          rx="2"
          fill="url(#hs-flute-thread)"
          stroke="#f59e0b"
          strokeWidth="0.5"
        />
        <line x1="53" y1="26" x2="53" y2="44" stroke="#fbbf24" strokeWidth="0.8" />

        {/* Decorative thread binding (Right end) */}
        <rect
          x="362"
          y="26"
          width="10"
          height="18"
          rx="2"
          fill="url(#hs-flute-thread)"
          stroke="#f59e0b"
          strokeWidth="0.5"
        />

        {/* Embouchure (Blow hole near left) */}
        <ellipse
          cx="82"
          cy="35"
          rx="4"
          ry="3"
          fill="#451a03"
          stroke="#fbbf24"
          strokeWidth="0.8"
        />

        {/* 6 Sacred Tone Holes */}
        <circle cx="160" cy="35" r="3.2" fill="#451a03" stroke="#d97706" strokeWidth="0.7" />
        <circle cx="195" cy="35" r="3.2" fill="#451a03" stroke="#d97706" strokeWidth="0.7" />
        <circle cx="230" cy="35" r="3.2" fill="#451a03" stroke="#d97706" strokeWidth="0.7" />
        <circle cx="275" cy="35" r="3.2" fill="#451a03" stroke="#d97706" strokeWidth="0.7" />
        <circle cx="310" cy="35" r="3.2" fill="#451a03" stroke="#d97706" strokeWidth="0.7" />
        <circle cx="345" cy="35" r="3.2" fill="#451a03" stroke="#d97706" strokeWidth="0.7" />

        {/* Pearl & Bead Tassel Hanging from Left Binding */}
        <path
          d="M 53 44 C 52 52, 48 60, 46 72"
          stroke="url(#hs-flute-pearls)"
          strokeWidth="1.2"
          strokeDasharray="2.5 2.5"
          strokeLinecap="round"
        />
        <circle cx="49" cy="56" r="2" fill="#ffffff" stroke="#38bdf8" strokeWidth="0.5" />
        <circle cx="47" cy="65" r="2.2" fill="#ffffff" stroke="#38bdf8" strokeWidth="0.5" />
        <circle cx="46" cy="74" r="3" fill="#e11d48" stroke="#fbbf24" strokeWidth="0.7" />

        {/* Second pearl strand */}
        <path
          d="M 56 44 C 57 54, 59 62, 60 70"
          stroke="url(#hs-flute-pearls)"
          strokeWidth="1.2"
          strokeDasharray="2.5 2.5"
          strokeLinecap="round"
        />
        <circle cx="58" cy="54" r="1.8" fill="#ffffff" stroke="#38bdf8" strokeWidth="0.5" />
        <circle cx="59" cy="63" r="2" fill="#ffffff" stroke="#38bdf8" strokeWidth="0.5" />
        <circle cx="60" cy="71" r="2.8" fill="#059669" stroke="#fbbf24" strokeWidth="0.7" />
      </svg>
    </div>
  );
}
