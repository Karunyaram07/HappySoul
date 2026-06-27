// * UPCOMING FEATURES / TIMELINE WIDGET
// ! This is a Client Component (rendered on the browser)
// ? It displays a modern vertical roadmap of features to be implemented in upcoming phases.

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Smile, BookOpen, Compass, Music, BrainCircuit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ROADMAP = [
  {
    id: "krishna-ai",
    title: "Krishna AI",
    description: "Get real-time answers and spiritual guidance based on sacred scriptures.",
    icon: Sparkles,
  },
  {
    id: "mood-tracker",
    title: "Mood Tracker",
    description: "Log your emotional states and view insights on what drives your inner peace.",
    icon: Smile,
  },
  {
    id: "journal",
    title: "Smart Journal",
    description: "An AI-guided journal that prompts self-discipline and reflection writing.",
    icon: BookOpen,
  },
  {
    id: "reflection",
    title: "Daily Reflection",
    description: "Curated daily scriptures and insights tailored to your wellness intentions.",
    icon: Compass,
  },
  {
    id: "music",
    title: "Personalized Music",
    description: "Relaxing devotional melodies and solfeggio ambient frequencies.",
    icon: Music,
  },
  {
    id: "recs",
    title: "AI Recommendations",
    description: "Dynamic feeds of content matching your real-time moods and interests.",
    icon: BrainCircuit,
  },
];

export default function ComingSoon() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
      className="w-full"
    >
      <Card className="border border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Upcoming Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 border-l border-border/80 space-y-6">
            {ROADMAP.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div key={item.id} className="relative text-left">
                  {/* Timeline dot */}
                  <div className="absolute -left-[35px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-secondary border border-border">
                    <div className="h-2 w-2 rounded-full bg-primary/60" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <IconComp className="h-3.5 w-3.5 text-primary" />
                      <h4 className="font-extrabold text-sm text-foreground">
                        {item.title}
                      </h4>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/80 border border-border/60 px-1.5 py-0.5 rounded-full">
                        Phase 5
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
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
