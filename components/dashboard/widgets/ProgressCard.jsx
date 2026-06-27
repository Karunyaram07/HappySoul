// * DAILY PROGRESS METRICS WIDGET
// ! This is a Client Component (rendered on the browser)
// ? It displays placeholder indicators for current wellness streaks, meditation mins, journal entries, and AI conversations.

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Clock, BookMarked, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const METRICS = [
  {
    id: "streak",
    label: "Current Streak",
    value: "0 Days",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    id: "meditation",
    label: "Meditation Mins",
    value: "0 Mins",
    icon: Clock,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "journal",
    label: "Journal Entries",
    value: "0 Entries",
    icon: BookMarked,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "ai-chats",
    label: "AI Conversations",
    value: "0 Chats",
    icon: MessageSquare,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export default function ProgressCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
      className="w-full"
    >
      <Card className="border border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Visual circular indicator */}
          <div className="flex flex-col items-center justify-center p-4 border border-border/40 rounded-2xl bg-secondary/10">
            <div className="relative flex items-center justify-center h-28 w-28">
              {/* SVG circular track */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-muted-foreground/10"
                />
                {/* Progress circle (empty/0% for now) */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset="251.2"
                  className="text-primary"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 }} // 0% progress
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              {/* Inner content */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-foreground">0%</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
              </div>
            </div>
            
            <p className="mt-4 text-xs font-medium text-muted-foreground text-center max-w-xs">
              Your daily quest is ready. Start your first wellness activity to fill the progress ring!
            </p>
          </div>

          {/* Grid list of metrics */}
          <div className="grid grid-cols-2 gap-4">
            {METRICS.map((metric) => {
              const IconComp = metric.icon;
              return (
                <div
                  key={metric.id}
                  className="flex items-center gap-3 p-3.5 border border-border/50 rounded-2xl bg-card hover:bg-secondary/20 transition-colors duration-200"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${metric.bg} ${metric.color}`}>
                    <IconComp className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      {metric.label}
                    </span>
                    <span className="text-sm font-black text-foreground">
                      {metric.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
