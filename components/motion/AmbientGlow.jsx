"use client";

import React, { useId } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * AmbientGlow
 * Reusable low-opacity ambient radial glow / background element.
 * Pure CSS transform/opacity keyframes — 0 JS render loops, 0 layout shifts.
 *
 * @param {string} className - Additional CSS classes
 * @param {"sm"|"md"|"lg"|"xl"} size - Diameter preset for the radial glow
 * @param {"gentle"|"subtle"|"warm"} intensity - Opacity preset
 * @param {number} duration - Full cycle duration in seconds (default 16s)
 * @param {"accent"|"primary"|"secondary"|"emerald"|"time-aware"} variant - Color theme token
 * @param {"center"|"top-left"|"top-right"|"bottom-left"|"bottom-right"} position - Anchor position
 */
export default function AmbientGlow({
  className = "",
  size = "md",
  intensity = "subtle",
  duration = 16,
  variant = "accent",
  position = "center",
}) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  // Safe CSS identifier without colons
  const glowId = `hs-glow-${rawId.replace(/:/g, "")}`;

  // Time-aware tone resolution
  const resolvedVariant = React.useMemo(() => {
    if (variant !== "time-aware") return variant;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "accent";      // Morning: warm sunlight gold
    if (hour >= 12 && hour < 17) return "secondary";  // Afternoon: natural daylight sage
    if (hour >= 17 && hour < 21) return "primary";    // Evening: deep forest amber
    return "primary";                                 // Night: serene obsidian forest
  }, [variant]);

  // Map variants to existing Happy Soul design tokens
  const variantColorClasses = {
    accent: "bg-accent",
    primary: "bg-primary",
    secondary: "bg-secondary",
    emerald: "bg-emerald-500",
  };

  // Map intensity to base opacities
  const intensityClasses = {
    gentle: "opacity-[0.07] dark:opacity-[0.09]",
    subtle: "opacity-[0.13] dark:opacity-[0.16]",
    warm: "opacity-[0.20] dark:opacity-[0.22]",
  };

  // Map size presets
  const sizeClasses = {
    sm: "h-36 w-36 sm:h-44 sm:w-44",
    md: "h-64 w-64 sm:h-80 sm:w-80",
    lg: "h-96 w-96 sm:h-[420px] sm:w-[420px]",
    xl: "h-[450px] w-[450px] sm:h-[600px] sm:w-[600px]",
  };

  // Map position presets
  const positionClasses = {
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "top-left": "-top-12 -left-12",
    "top-right": "-top-12 -right-12",
    "bottom-left": "-bottom-12 -left-12",
    "bottom-right": "-bottom-12 -right-12",
  };

  const colorClass = variantColorClasses[resolvedVariant] || variantColorClasses.accent;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const intensityClass = intensityClasses[intensity] || intensityClasses.subtle;
  const positionClass = positionClasses[position] || positionClasses.center;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      <style>{`
        @keyframes ${glowId} {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: translate3d(4%, -4%, 0) scale(1.08);
            opacity: 1;
          }
        }
        @media (max-width: 640px) {
          @keyframes ${glowId} {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.9;
            }
            50% {
              transform: translate3d(2%, -2%, 0) scale(1.04);
              opacity: 1;
            }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .${glowId}-element {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
      <div
        className={`absolute rounded-full blur-[80px] sm:blur-[110px] will-change-transform ${colorClass} ${sizeClass} ${intensityClass} ${positionClass} ${glowId}-element`}
        style={
          shouldReduceMotion
            ? { animation: "none", transform: "none" }
            : {
                animation: `${glowId} ${duration}s ease-in-out infinite`,
              }
        }
      />
    </div>
  );
}
