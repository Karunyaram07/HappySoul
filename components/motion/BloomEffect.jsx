"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * BloomEffect
 * Reusable discrete, short-lived decorative bloom/ripple effect.
 * Triggers once upon milestone interactions (e.g. step completion, "Begin Your Journey").
 *
 * @param {boolean|any} trigger - Activating signal (boolean flag or unique key)
 * @param {"emerald"|"accent"|"primary"} variant - Color theme token
 * @param {string} className - Extra classes for positioning
 * @param {number} duration - Animation duration in seconds (default: 0.6s)
 * @param {() => void} onComplete - Optional callback when the animation finishes
 */
export default function BloomEffect({
  trigger = false,
  variant = "emerald",
  className = "",
  duration = 0.6,
  onComplete,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (trigger) {
      const id = Date.now();
      setActiveId(id);

      const timeout = setTimeout(() => {
        setActiveId(null);
        if (onComplete) onComplete();
      }, (shouldReduceMotion ? 0.1 : duration) * 1000);

      return () => clearTimeout(timeout);
    }
  }, [trigger, duration, shouldReduceMotion, onComplete]);

  // Color mapping matching Happy Soul design tokens
  const colorMap = {
    emerald: "from-emerald-500/30 via-emerald-500/10 to-transparent border-emerald-500/30",
    accent: "from-accent/40 via-accent/15 to-transparent border-accent/40",
    primary: "from-primary/30 via-primary/10 to-transparent border-primary/30",
  };
  const activeColor = colorMap[variant] || colorMap.emerald;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      <AnimatePresence>
        {activeId && (
          <motion.div
            key={activeId}
            initial={
              shouldReduceMotion
                ? { opacity: 0.3 }
                : { opacity: 0.7, scale: 0.85 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.35 }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.15 : duration,
              ease: "easeOut",
            }}
            className={`absolute inset-0 m-auto h-full w-full rounded-2xl bg-gradient-radial ${activeColor} border`}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
