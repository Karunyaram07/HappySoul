// * QUICK ACTIONS PANEL WIDGET
// ! This is a Client Component (rendered on the browser)
// ? It displays high-value features as interactive cards and displays a "Coming Soon" overlay on click.

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PenTool, Wind, BookOpen, Music, Film, BellRing, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ACTIONS = [
  {
    id: "krishna-ai",
    title: "Krishna AI",
    description: "Receive personalized guidance and spiritual wisdom from our AI assistant.",
    icon: Sparkles,
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    id: "journal",
    title: "Daily Journal",
    description: "Write down your thoughts, express gratitude, and reflect on your days.",
    icon: PenTool,
    color: "from-blue-500/10 to-teal-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    id: "meditation",
    title: "Guided Meditation",
    description: "Practice mindfulness and breathwork with guided session timers.",
    icon: Wind,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "stories",
    title: "Spiritual Stories",
    description: "Read uplifting tales and lessons of wisdom from ancient scriptures.",
    icon: BookOpen,
    color: "from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    id: "music",
    title: "Devotional Music",
    description: "Listen to relaxing mantras, bhajans, and calming frequency tunes.",
    icon: Music,
    color: "from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    badgeColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  {
    id: "movies",
    title: "Uplifting Movies",
    description: "Discover curated lists of spiritual and motivational cinematic tales.",
    icon: Film,
    color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
];

export default function QuickActions() {
  const [activeNotification, setActiveNotification] = useState(null);

  const handleActionClick = (title) => {
    setActiveNotification(`${title} will be fully integrated in the next phase! 🌿`);
    // Auto-clear notification after 4 seconds
    setTimeout(() => {
      setActiveNotification((prev) => {
        if (prev && prev.includes(title)) return null;
        return prev;
      });
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className="w-full relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-[-20px] left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl shadow-xl px-5 py-3.5 max-w-sm text-sm text-foreground">
              <BellRing className="h-5 w-5 text-accent animate-bounce shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">{activeNotification}</span>
              <button
                onClick={() => setActiveNotification(null)}
                className="text-muted-foreground hover:text-foreground shrink-0 ml-2"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACTIONS.map((action) => {
              const IconComp = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.title)}
                  className="group relative flex flex-col items-start p-5 rounded-2xl border border-border/60 bg-gradient-to-br from-card to-secondary/15 text-left transition-all duration-300 hover:border-primary/45 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] select-none overflow-hidden cursor-pointer"
                >
                  {/* Decorative background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br border mb-4 group-hover:scale-105 transition-transform duration-300 ${action.color}`}>
                    <IconComp className="h-5.5 w-5.5" />
                  </div>

                  <div className="flex items-center gap-2 mb-1.5 w-full">
                    <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <span className={`text-[9px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded-full shrink-0 ${action.badgeColor}`}>
                      Coming Soon
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
