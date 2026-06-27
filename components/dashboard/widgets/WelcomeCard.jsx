// * PERSONALIZED WELCOME BANNER WIDGET
// ! This is a Client Component (rendered on the browser)
// ? It dynamically computes greetings based on local time and presents personalization parameters.

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function WelcomeCard({ profile }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // * Defer mounted state update to avoid synchronous cascading render warnings
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const displayName = profile?.full_name || "Seeker";
  const language = profile?.preferred_language || "English";

  // Prevent hydration layout shift
  if (!mounted) {
    return (
      <div className="h-48 w-full rounded-3xl border border-border bg-card animate-pulse" />
    );
  }

  // * 1. Compute time-based greeting (runs on client only)
  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }

  // * 2. Format current date nicely (runs on client only)
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const formattedDate = new Date().toLocaleDateString("en-US", options);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="relative overflow-hidden border border-border bg-gradient-to-br from-card via-card to-accent/5 p-6 sm:p-8 shadow-md">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        
        <CardContent className="p-0 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4.5 w-4.5 text-accent animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase">Your Sanctuary</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl leading-tight">
              {greeting}, <span className="text-primary">{displayName}</span> 🌿
            </h2>
            
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Continue your journey toward a peaceful, mindful, and positive life. We are here to support your daily spiritual growth.
            </p>
          </div>

          {/* Quick info columns */}
          <div className="flex flex-wrap gap-4 shrink-0 mt-2 md:mt-0">
            {/* Language info */}
            <div className="flex items-center gap-3 bg-secondary/30 border border-border/65 px-4.5 py-2.5 rounded-2xl shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                <Languages className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Language</span>
                <span className="text-xs font-bold text-foreground">{language}</span>
              </div>
            </div>

            {/* Date info */}
            <div className="flex items-center gap-3 bg-secondary/30 border border-border/65 px-4.5 py-2.5 rounded-2xl shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Today</span>
                <span className="text-xs font-bold text-foreground whitespace-nowrap">{formattedDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
