// * RECOMMENDED FOR YOU PANEL WIDGET — PHASE 6C.2.2
// ! This is a Client Component (rendered on the browser)
// ? Displays static placeholder recommendations. CTA buttons now use an in-component
// ? toast notification instead of alert() (accessibility fix from 6C.2.1 audit).

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, PlayCircle, Trophy, ArrowUpRight, BellRing, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RECOMMENDATIONS = [
  {
    id: "gita-wisdom",
    type: "Scriptural Wisdom",
    title: "Bhagavad Gita Wisdom",
    description: "Delve into timeless teachings on self-mastery, action, and finding inner peace amidst noise.",
    duration: "5 min read",
    icon: BookOpen,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    actionLabel: "Read Now",
  },
  {
    id: "morning-meditation",
    type: "Mindful Practice",
    title: "Morning Meditation",
    description: "Centering breathing session designed to anchor your mind and invite calm focus to your day.",
    duration: "10 min practice",
    icon: PlayCircle,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    actionLabel: "Listen Now",
  },
  {
    id: "habit-challenge",
    type: "Daily Growth",
    title: "Positive Habit Challenge",
    description: "Write down three things you are grateful for today and share a kind word with a loved one.",
    duration: "Daily habit",
    icon: Trophy,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    actionLabel: "Start Challenge",
  },
];

export default function RecommendationCard() {
  const [activeNotification, setActiveNotification] = useState(null);

  const handleActionClick = (rec) => {
    setActiveNotification(`${rec.title} is coming soon in an upcoming phase! 🌿`);
    setTimeout(() => {
      setActiveNotification((prev) => {
        if (prev && prev.includes(rec.title)) return null;
        return prev;
      });
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
      className="w-full"
    >
      <Card className="border border-border bg-card shadow-md relative">
        {/* Toast Notification */}
        <AnimatePresence>
          {activeNotification && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className="absolute top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3"
            >
              <div className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl shadow-xl px-5 py-3 max-w-sm text-sm text-foreground w-full">
                <BellRing className="h-4 w-4 text-accent shrink-0" />
                <span className="font-semibold text-xs flex-1">{activeNotification}</span>
                <button
                  onClick={() => setActiveNotification(null)}
                  className="text-muted-foreground hover:text-foreground shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECOMMENDATIONS.map((rec) => {
              const IconComp = rec.icon;
              return (
                <div
                  key={rec.id}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-border/50 rounded-2xl bg-card hover:bg-secondary/15 transition-all duration-300 gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform duration-300 ${rec.color}`}>
                      <IconComp className="h-5.5 w-5.5" />
                    </div>
                    
                    <div className="text-left space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {rec.type} • {rec.duration}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                        {rec.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-xl text-xs font-bold gap-1 cursor-pointer transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary mt-2 md:mt-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={() => handleActionClick(rec)}
                    aria-label={`${rec.actionLabel}: ${rec.title}`}
                  >
                    {rec.actionLabel}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
