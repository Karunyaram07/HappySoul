// * DASHBOARD HEADER SECTION
// ! This is a Client Component (rendered on the browser)
// ? It displays the top title banner and quick navigation options.

"use client";

import React from "react";
import { Compass, Sparkles } from "lucide-react";
import { AVATAR_CONFIG } from "@/lib/profile";

export default function DashboardHeader({ profile }) {
  const name = profile?.full_name || "Seeker";
  
  // Custom Avatar styles resolver
  const avatarType = profile?.avatar_type || "lotus";
  const avatarColor = profile?.avatar_color || "indigo";
  const avatarEmoji = AVATAR_CONFIG[avatarType]?.emoji || "🌸";

  const colorBgMap = {
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    teal: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };
  const colorClass = colorBgMap[avatarColor] || "bg-primary/10 text-primary border-primary/20";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-border/40 gap-4 mb-6">
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2 text-primary">
          <Compass className="h-4.5 w-4.5 text-accent animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase">Sanctuary Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Welcome to Your Sanctuary
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          A dedicated space for reflection, meditation, and spiritual growth.
        </p>
      </div>

      {/* Mini Profile Indicator */}
      <div className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl px-4 py-2.5 shadow-sm max-w-xs self-start md:self-auto">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base font-black ${colorClass}`}>
          {avatarEmoji}
        </div>
        <div className="text-left min-w-0">
          <h4 className="font-bold text-xs text-foreground truncate max-w-[130px]">{name}</h4>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent shrink-0" />
            Happy Soul Seeker
          </span>
        </div>
      </div>
    </div>
  );
}
