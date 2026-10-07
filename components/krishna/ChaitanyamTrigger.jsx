// * CHAITANYAM AI FLOATING LAUNCHER TRIGGER - PHASE 6B.5
// ! "use client" floating action button positioned fixed at bottom-right (z-40)
// ? Toggles the Chaitanyam AI drawer open. Features smooth Framer Motion animations
// ? that respect user prefers-reduced-motion accessibility preferences.

"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useChaitanyam } from "./ChaitanyamProvider";

export default function ChaitanyamTrigger() {
  const { openChat, isOpen } = useChaitanyam();
  const shouldReduceMotion = useReducedMotion();

  // Hide trigger when drawer is already open to prevent clutter
  if (isOpen) return null;

  return (
    <motion.button
      onClick={openChat}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-xl border border-accent/40 backdrop-blur-md cursor-pointer group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 select-none"
      aria-label="Open Chaitanyam AI spiritual companion"
      title="Ask Chaitanyam AI for Gita wisdom & guidance"
    >
      {/* Animated Glowing Aura (disabled if reduced motion) */}
      {!shouldReduceMotion && (
        <span className="absolute -inset-1 rounded-full bg-accent/20 blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
      )}

      <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent border border-accent/40 shadow-inner shrink-0">
        <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
      </div>

      <div className="relative text-left hidden sm:flex flex-col">
        <span className="text-xs font-bold tracking-tight leading-tight text-primary-foreground">
          Chaitanyam AI
        </span>
        <span className="text-[10px] text-accent/90 font-medium leading-none">
          Gita Wisdom
        </span>
      </div>
    </motion.button>
  );
}
