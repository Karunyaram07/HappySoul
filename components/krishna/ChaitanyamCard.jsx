// * CHAITANYAM AI DASHBOARD FEATURE CARD — PHASE 6C.2.2
// ! This is a Client Component (rendered on the browser)
// ? Provides a prominent, inviting entry point to the Chaitanyam AI spiritual companion
// ? directly on the main dashboard. Opens the existing ChaitanyamDrawer via the
// ? shared ChaitanyamProvider context. Does NOT create a second AI system.
// ?
// ? Prompt chips are discovery hints only. Clicking any chip opens the drawer so
// ? the user can type naturally. Pre-filling the input is deferred to a future phase.

"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight, MessageCircle, BookOpen, Heart, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AmbientGlow from "@/components/motion/AmbientGlow";
import { useChaitanyam } from "@/components/krishna/ChaitanyamProvider";

// ── Suggested Prompt Chips ──────────────────────────────────────────────────
// Discovery hints only — clicking opens the drawer; the user types naturally.
const SUGGESTED_PROMPTS = [
  {
    id: "detachment",
    text: "What does the Gita say about detachment?",
    icon: BookOpen,
  },
  {
    id: "peace",
    text: "How can I find inner peace today?",
    icon: Heart,
  },
  {
    id: "duty",
    text: "What is my dharma in daily life?",
    icon: Flame,
  },
];

export default function ChaitanyamCard() {
  const { openChat } = useChaitanyam();
  const shouldReduceMotion = useReducedMotion();
  const [activePromptId, setActivePromptId] = useState(null);

  const handlePromptClick = (promptId) => {
    setActivePromptId(promptId);
    // Brief press-feedback delay, then open the drawer
    setTimeout(() => {
      setActivePromptId(null);
      openChat();
    }, 180);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.5, ease: "easeOut", delay: 0.15 }
      }
      className="w-full"
    >
      <Card className="relative overflow-hidden border border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
        {/* Subtle ambient glow — primary (forest green) tone, bottom-left anchored */}
        <AmbientGlow
          size="md"
          intensity="gentle"
          variant="primary"
          position="bottom-left"
          duration={20}
        />

        <CardContent className="relative z-10 p-6 sm:p-7">
          {/* ── Header Row ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            {/* Icon + Branding */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 border border-primary/30 shadow-md">
                <Sparkles className="h-5 w-5 text-amber-300" aria-hidden="true" />
                {/* Soft breathing ring — disabled for reduced-motion users */}
                {!shouldReduceMotion && (
                  <span
                    className="absolute -inset-1 rounded-2xl border border-primary/25 opacity-60 pointer-events-none"
                    style={{ animation: "hs-chait-card-ring 3.5s ease-in-out infinite" }}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    Chaitanyam AI
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gita Wisdom · Spiritual Guidance
                </p>
              </div>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={openChat}
              className="shrink-0 self-start rounded-2xl gap-2 text-sm font-bold px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Open Chaitanyam AI spiritual companion"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask Chaitanyam
              <ArrowRight className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </Button>
          </div>

          {/* ── Tagline ────────────────────────────────────────────────── */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-prose">
            Receive personalized wisdom from the Bhagavad Gita. Ask about dharma, karma,
            detachment, or inner peace — or simply seek guidance for today&apos;s challenges.
          </p>

          {/* ── Suggested Prompt Chips ─────────────────────────────────── */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
              Try asking:
            </span>
            {SUGGESTED_PROMPTS.map((prompt) => {
              const IconComp = prompt.icon;
              const isActive = activePromptId === prompt.id;
              return (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt.id)}
                  className={`group flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full border transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-primary/10 border-primary/40 text-primary scale-95"
                      : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-foreground hover:scale-[1.02]"
                  }`}
                  aria-label={`Ask Chaitanyam: ${prompt.text}`}
                >
                  <IconComp
                    className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="line-clamp-1">{prompt.text}</span>
                </button>
              );
            })}
          </div>
        </CardContent>

        {/* Keyframe for the icon breathing ring */}
        <style>{`
          @keyframes hs-chait-card-ring {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50%       { transform: scale(1.15); opacity: 0.15; }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="hs-chait-card-ring"] { animation: none !important; }
          }
        `}</style>
      </Card>
    </motion.div>
  );
}
