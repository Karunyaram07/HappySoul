// * CHAITANYAM AI SLIDE-OVER DRAWER - PHASE 6B.5
// ! "use client" accessible hand-rolled drawer built with Framer Motion (z-[60])
// ? Implements WAI-ARIA dialog patterns (role="dialog", aria-modal="true", Esc key listener,
// ? focus management, body scroll locking, and mobile responsive glassmorphism presentation).

"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useChaitanyam } from "./ChaitanyamProvider";
import ChaitanyamHeader from "./ChaitanyamHeader";
import ChaitanyamMessageList from "./ChaitanyamMessageList";
import ChaitanyamInput from "./ChaitanyamInput";

export default function ChaitanyamDrawer() {
  const { isOpen, closeChat } = useChaitanyam();
  const drawerRef = useRef(null);
  const previousActiveElement = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // ── Focus & Body Scroll Locking ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      // Save previously focused element to restore focus on close
      previousActiveElement.current = document.activeElement;

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus drawer container for accessibility
      setTimeout(() => {
        drawerRef.current?.focus();
      }, 50);

      // Escape key listener
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          closeChat();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);

        // Restore focus to previous element when closing
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === "function") {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, closeChat]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={closeChat}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Chaitanyam AI spiritual companion"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: shouldReduceMotion ? "tween" : "spring",
              damping: 30,
              stiffness: 300,
              duration: shouldReduceMotion ? 0.1 : undefined,
            }}
            className="relative z-[60] w-full sm:w-[440px] h-full bg-background/95 border-l border-border/80 shadow-2xl backdrop-blur-xl flex flex-col focus:outline-none overflow-hidden"
          >
            <ChaitanyamHeader />
            <ChaitanyamMessageList />
            <ChaitanyamInput />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
