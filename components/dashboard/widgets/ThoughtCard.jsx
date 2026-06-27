// * UPGRADED TODAY'S POSITIVE THOUGHT WIDGET
// ! This is a Client Component (rendered on the browser)
// ? It displays personalized quotes from the provider and supports copy, cycle, and favorites actions.

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RefreshCw, BookOpen, Wind, Sun, Heart, Target, Flame, Smile, Sparkles, Quote } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDailyThought } from "@/lib/thoughts/provider";
import { THOUGHT_UI } from "@/lib/thoughts/constants";
import ThoughtCategory from "@/components/thoughts/ThoughtCategory";
import ThoughtActions from "@/components/thoughts/ThoughtActions";
import ThoughtSkeleton from "@/components/thoughts/ThoughtSkeleton";

const getCategoryIcon = (category) => {
  switch (category) {
    case "Bhagavad Gita": return BookOpen;
    case "Peace": return Wind;
    case "Mindfulness": return Sun;
    case "Gratitude": return Heart;
    case "Self Discipline": return Target;
    case "Motivation": return Flame;
    case "Positivity": return Smile;
    case "Spiritual Growth": return Sparkles;
    default: return Quote;
  }
};

export default function ThoughtCard({ profile }) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // * Prevent hydration mismatch layout shifts by mounting client-side
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    // Cycle offset to next personalized thought
    setIndex((prevIndex) => prevIndex + 1);
  };

  if (!mounted) {
    return <ThoughtSkeleton />;
  }

  const currentQuoteObj = getDailyThought(profile, index);
  const icon = getCategoryIcon(currentQuoteObj.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut", delay: 0.1 }}
      className="w-full"
    >
      <Card className="h-full border border-border bg-gradient-to-br from-card via-card to-accent/5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        {/* Decorative background glow */}
        <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-primary/5 blur-xl pointer-events-none" />

        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            {React.createElement(icon, { className: "h-4.5 w-4.5 text-primary shrink-0" })}
            <span>{THOUGHT_UI.title}</span>
          </CardTitle>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title={THOUGHT_UI.refresh}
            aria-label={THOUGHT_UI.refresh}
            className="h-8 w-8 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-2 flex-grow flex flex-col justify-between gap-4">
          <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.02 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35 }}
              className="space-y-4 text-left flex-grow flex flex-col justify-center"
            >
              {/* Quote Category Badge */}
              <div>
                <ThoughtCategory category={currentQuoteObj.category} />
              </div>

              {/* Quote Block */}
              <div className="space-y-3">
                <blockquote className="text-lg sm:text-xl font-medium italic text-foreground leading-relaxed">
                  &ldquo;{currentQuoteObj.quote}&rdquo;
                </blockquote>
                
                {/* Author attribution with non-breaking spaces */}
                <cite className="block text-xs sm:text-sm font-bold text-primary not-italic text-right">
                  {THOUGHT_UI.attributionPrefix} {currentQuoteObj.author}
                </cite>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Row Component */}
          <ThoughtActions
            quoteText={currentQuoteObj.quote}
            authorText={currentQuoteObj.author}
            quoteId={currentQuoteObj.id}
            onNextThought={handleRefresh}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
