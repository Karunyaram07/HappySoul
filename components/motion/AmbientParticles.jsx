"use client";

import React, { useId } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * AmbientParticles
 * Reusable lightweight decorative particle layer for spiritual ambient accents.
 * Pure CSS transform/opacity keyframes with staggered delays.
 *
 * @param {number} count - Total particle count (default 4, max capped at 6)
 * @param {string} className - Extra classes for the container
 * @param {number} duration - Animation cycle duration in seconds (default 12s)
 * @param {"dots"|"notes"|"petals"} variant - Visual shape of particles
 * @param {"accent"|"primary"|"secondary"} color - Happy Soul color token
 */
export default function AmbientParticles({
  count = 4,
  className = "",
  duration = 12,
  variant = "dots",
  color = "accent",
}) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const particleId = `hs-particles-${rawId.replace(/:/g, "")}`;

  // Keep DOM particle count strictly minimal (3 to 6 items max)
  const safeCount = Math.min(Math.max(count, 2), 6);
  const particles = Array.from({ length: safeCount }, (_, i) => i);

  // Color mapping using existing Happy Soul tokens
  const colorClasses = {
    accent: "bg-accent/70 text-accent/70 border-accent/40",
    primary: "bg-primary/50 text-primary/50 border-primary/30",
    secondary: "bg-secondary/60 text-secondary/60 border-secondary/40",
  };
  const activeColorClass = colorClasses[color] || colorClasses.accent;

  // Stagger configurations (x-offset %, delay factor, float amplitude)
  const configs = [
    { left: "20%", top: "70%", delay: 0, size: "h-2 w-2", driftX: "18px", driftY: "-40px" },
    { left: "45%", top: "80%", delay: duration * 0.25, size: "h-2.5 w-2.5", driftX: "-14px", driftY: "-50px" },
    { left: "70%", top: "75%", delay: duration * 0.5, size: "h-2 w-2", driftX: "22px", driftY: "-45px" },
    { left: "32%", top: "85%", delay: duration * 0.75, size: "h-1.5 w-1.5", driftX: "-10px", driftY: "-35px" },
    { left: "60%", top: "68%", delay: duration * 0.35, size: "h-2 w-2", driftX: "12px", driftY: "-42px" },
    { left: "82%", top: "82%", delay: duration * 0.65, size: "h-2 w-2", driftX: "-16px", driftY: "-48px" },
  ];

  // Render particle icon/shape depending on variant
  const renderShape = (v, index) => {
    if (v === "notes") {
      // Subtle flute-note / frequency wave outline
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current opacity-60"
          aria-hidden="true"
        >
          <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      );
    }
    if (v === "petals") {
      // Small soft petal / leaf contour
      return (
        <div
          className={`h-2.5 w-2 sm:h-3 sm:w-2.5 rounded-full rounded-tr-none rotate-45 ${activeColorClass}`}
        />
      );
    }
    // Default: Soft rounded dot
    return (
      <div
        className={`rounded-full shadow-sm ${configs[index % configs.length].size} ${activeColorClass}`}
      />
    );
  };

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      <style>{`
        @keyframes ${particleId}-float {
          0% {
            transform: translate3d(0, 0, 0) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.65;
          }
          75% {
            opacity: 0.55;
          }
          100% {
            transform: translate3d(var(--hs-drift-x, 15px), var(--hs-drift-y, -45px), 0) scale(1.1);
            opacity: 0;
          }
        }
        @media (max-width: 640px) {
          @keyframes ${particleId}-float {
            0% {
              transform: translate3d(0, 0, 0) scale(0.8);
              opacity: 0;
            }
            25% {
              opacity: 0.5;
            }
            80% {
              opacity: 0.4;
            }
            100% {
              transform: translate3d(calc(var(--hs-drift-x, 15px) * 0.5), calc(var(--hs-drift-y, -45px) * 0.5), 0) scale(1.0);
              opacity: 0;
            }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .${particleId}-node {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>

      {particles.map((_, i) => {
        const cfg = configs[i % configs.length];
        // On small mobile screens, only show the first 2 particles to preserve battery
        const isMobileHidden = i >= 2 ? "hidden sm:block" : "block";

        return (
          <div
            key={i}
            className={`absolute will-change-transform ${isMobileHidden} ${particleId}-node`}
            style={{
              left: cfg.left,
              top: cfg.top,
              "--hs-drift-x": cfg.driftX,
              "--hs-drift-y": cfg.driftY,
              animation: `${particleId}-float ${duration}s ease-in-out infinite`,
              animationDelay: `${cfg.delay}s`,
            }}
          >
            {renderShape(variant, i)}
          </div>
        );
      })}
    </div>
  );
}
