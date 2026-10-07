"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * PeacockFeatherMotif
 * Lightweight, accessible SVG decorative peacock feather (mayura-pankh).
 * Tailored for Chaitanyam AI with peacock blue, emerald, and muted gold tones.
 *
 * @param {string} className - Additional CSS positioning/sizing classes
 * @param {number} opacity - Master opacity factor (default 0.22)
 * @param {boolean} animated - Whether to apply subtle floating animation (default true)
 */
export default function PeacockFeatherMotif({
  className = "",
  opacity = 0.25,
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
        @keyframes hs-feather-breathe {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          50% {
            transform: translate3d(-3px, -6px, 0) rotate(-1.5deg) scale(1.02);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hs-feather-anim {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 200 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${isAnimated ? "hs-feather-anim" : ""}`}
        style={
          isAnimated
            ? { animation: "hs-feather-breathe 14s ease-in-out infinite" }
            : undefined
        }
      >
        <defs>
          {/* Peacock Eye Radial Gradients */}
          <radialGradient
            id="hs-pf-eye-outer"
            cx="50%"
            cy="50%"
            r="50%"
            fx="45%"
            fy="45%"
          >
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#059669" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
          </radialGradient>

          <radialGradient
            id="hs-pf-eye-core"
            cx="50%"
            cy="50%"
            r="50%"
            fx="40%"
            fy="38%"
          >
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#0f172a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
          </radialGradient>

          <linearGradient id="hs-pf-shaft" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#047857" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.7" />
            <stop offset="85%" stopColor="#d97706" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="hs-pf-barb-l" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#0284c7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="hs-pf-barb-r" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#0284c7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Central Quill / Shaft */}
        <path
          d="M 100 350 C 98 280, 99 180, 100 65"
          stroke="url(#hs-pf-shaft)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Outer Halo Vanes / Barbs (Left) */}
        <path
          d="M 99 180 C 70 170, 35 150, 20 110 C 45 130, 75 155, 99 168
             M 99 150 C 65 140, 30 115, 15 75 C 45 95, 75 125, 99 140
             M 99 120 C 65 105, 35 75, 25 35 C 50 60, 80 90, 100 110
             M 100 95 C 75 75, 50 45, 45 15 C 65 38, 88 70, 100 88"
          stroke="url(#hs-pf-barb-l)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Outer Halo Vanes / Barbs (Right) */}
        <path
          d="M 101 180 C 130 170, 165 150, 180 110 C 155 130, 125 155, 101 168
             M 101 150 C 135 140, 170 115, 185 75 C 155 95, 125 125, 101 140
             M 101 120 C 135 105, 165 75, 175 35 C 150 60, 120 90, 100 110
             M 100 95 C 125 75, 150 45, 155 15 C 135 38, 112 70, 100 88"
          stroke="url(#hs-pf-barb-r)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Peacock Feather Eye Outer Ring */}
        <ellipse
          cx="100"
          cy="75"
          rx="38"
          ry="46"
          fill="url(#hs-pf-eye-outer)"
          stroke="#f59e0b"
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />

        {/* Peacock Feather Eye Mid Ring (Emerald-Sapphire) */}
        <ellipse
          cx="100"
          cy="78"
          rx="27"
          ry="33"
          fill="#065f46"
          fillOpacity="0.85"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeOpacity="0.6"
        />

        {/* Peacock Feather Eye Core Pupil (Deep Sapphire & Cyan Glint) */}
        <path
          d="M 100 60 C 114 60, 120 74, 116 88 C 112 100, 100 102, 100 102 C 100 102, 88 100, 84 88 C 80 74, 86 60, 100 60 Z"
          fill="url(#hs-pf-eye-core)"
        />

        {/* Divine Sparkle Highlight in Core */}
        <ellipse
          cx="96"
          cy="73"
          rx="3"
          ry="4"
          fill="#ffffff"
          fillOpacity="0.85"
        />
        <circle
          cx="103"
          cy="80"
          r="1.5"
          fill="#38bdf8"
          fillOpacity="0.9"
        />

        {/* Crest Tip Barbs */}
        <path
          d="M 100 35 C 95 20, 88 8, 80 0 M 100 35 C 100 16, 102 6, 104 0 M 100 35 C 105 20, 112 8, 120 0"
          stroke="#f59e0b"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
      </svg>
    </div>
  );
}
