// * DASHBOARD HEADER SECTION
// ! This is a Client Component (rendered on the browser)
// ? It displays the top title banner and quick navigation options.

"use client";

import React, { useState } from "react";
import { Compass, Sparkles, LogOut, Loader2 } from "lucide-react";
import { AVATAR_CONFIG } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardHeader({ profile }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const name = profile?.full_name || "Seeker";
  
  // Custom Avatar styles resolver
  const avatarType = profile?.avatar_type || "lotus";
  const avatarColor = profile?.avatar_color || "indigo";
  const avatarEmoji = AVATAR_CONFIG[avatarType]?.emoji || "🌸";

  const colorBgMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };
  const colorClass = colorBgMap[avatarColor] || "bg-primary/10 text-primary border-primary/20";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

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

      {/* Right Controls: Theme Toggle, Mini Profile Indicator & Logout */}
      <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
        <ThemeToggle />

        <div className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl px-4 py-2.5 shadow-sm max-w-xs">
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

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-2xl h-[46px] px-3.5 gap-2 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors cursor-pointer"
          title="Log out of your account"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </div>
  );
}
