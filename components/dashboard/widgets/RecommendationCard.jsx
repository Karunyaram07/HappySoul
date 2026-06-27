// * RECOMMENDED FOR YOU PANEL WIDGET
// ! This is a Client Component (rendered on the browser)
// ? It displays static UI placeholder recommendations based on user preferences.

"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, PlayCircle, Trophy, ArrowUpRight } from "lucide-react";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
      className="w-full"
    >
      <Card className="border border-border bg-card shadow-md">
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
                    className="shrink-0 rounded-xl text-xs font-bold gap-1 cursor-pointer transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary mt-2 md:mt-0"
                    onClick={() => alert(`${rec.title} feature is coming soon in Phase 5! 🌿`)}
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
