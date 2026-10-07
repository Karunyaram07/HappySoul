// * CHAITANYAM AI DEDICATED FULL-PAGE WORKSPACE — PHASE 6C.2.3
// ! Client Component implementing a premium conversational workspace
// ? Reuses shared ChaitanyamProvider context without duplicating AI or history logic.
// ? Responsive: desktop fixed/collapsible sidebar, mobile slide-over history drawer.
// ? Theme-aware: light & dark mode support.
// ? Language-aware: adapts typography according to preferred_language.

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { useChaitanyam } from "./ChaitanyamProvider";
import ChaitanyamMessageList from "./ChaitanyamMessageList";
import ChaitanyamInput from "./ChaitanyamInput";
import ChaitanyamHistoryList from "./ChaitanyamHistoryList";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { getLanguageTypography } from "@/lib/typography";

export default function ChaitanyamWorkspace({ profile }) {
  const {
    startNewConversation,
    loading,
    preferredLanguage: contextLang,
    userFirstName,
  } = useChaitanyam();

  const preferredLanguage = profile?.preferred_language || contextLang || "English";
  const typo = getLanguageTypography(preferredLanguage);
  const shouldReduceMotion = useReducedMotion();

  // Desktop sidebar collapsed/expanded state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Mobile drawer open state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen]);

  const handleNewChat = () => {
    startNewConversation();
    if (mobileDrawerOpen) setMobileDrawerOpen(false);
  };

  return (
    <div
      className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden"
      data-language={preferredLanguage}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="h-16 shrink-0 border-b border-border/60 bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20">
        {/* Left: Back Link & Navigation Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile history toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Open conversation history"
            title="Open conversation history"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop sidebar collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="hidden md:flex h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>

          {/* Return to Dashboard Sanctuary */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-xl border border-transparent hover:border-border/60 hover:bg-secondary/40 transition-colors"
            title="Return to Dashboard Sanctuary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sanctuary</span>
          </Link>

          <div className="h-4 w-px bg-border/60 hidden sm:block" />

          {/* Title & Spiritual Subtitle */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 border border-primary/30 shadow-xs">
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={`text-sm sm:text-base ${typo.headingFont} text-foreground truncate`}>
                  Chaitanyam AI
                </h1>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 ${typo.metaFont}`}>
                  Gita Companion
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate hidden lg:block">
                Your companion for wisdom, reflection &amp; inner peace.
              </p>
            </div>
          </div>
        </div>

        {/* Right: New Chat CTA & Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            disabled={loading}
            className="rounded-xl h-9 px-3 gap-1.5 text-xs font-semibold bg-card hover:bg-secondary border-border/80 text-foreground cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            aria-label="Start a new conversation"
            title="Start a new conversation"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>

          <ThemeToggle compact />
        </div>
      </header>

      {/* ── WORKSPACE BODY (SIDEBAR + MAIN CHAT) ───────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col border-r border-border/60 bg-card/60 backdrop-blur-md transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
            sidebarOpen ? "w-72 lg:w-80" : "w-0 border-r-0"
          }`}
          aria-label="Conversation history sidebar"
        >
          {sidebarOpen && (
            <div className="flex flex-col h-full w-72 lg:w-80">
              {/* New Chat Primary Button */}
              <div className="p-3 border-b border-border/40">
                <Button
                  onClick={handleNewChat}
                  disabled={loading}
                  className="w-full justify-start gap-2 rounded-xl text-xs font-semibold h-10 px-3 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Start New Conversation</span>
                </Button>
              </div>

              {/* History list content */}
              <div className="flex-1 overflow-y-auto">
                <ChaitanyamHistoryList />
              </div>

              {/* Sidebar bottom indicator */}
              <div className="p-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  Happy Soul Sanctuary
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-secondary/80 px-2 py-0.5 rounded-full border border-border/60">
                  {preferredLanguage}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* MOBILE DRAWER (SLIDE-OVER) */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              {/* Backdrop Scrim */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                aria-hidden="true"
              />

              {/* Drawer Sheet */}
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Conversations"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{
                  type: shouldReduceMotion ? "tween" : "spring",
                  damping: 25,
                  stiffness: 250,
                  duration: shouldReduceMotion ? 0.1 : undefined,
                }}
                className="relative z-50 w-72 max-w-[85vw] h-full bg-background border-r border-border shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-border/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Conversations
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label="Close conversation history"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* New Chat Button */}
                <div className="p-3 border-b border-border/40">
                  <Button
                    onClick={handleNewChat}
                    disabled={loading}
                    className="w-full justify-start gap-2 rounded-xl text-xs font-semibold h-10 px-3 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Start New Conversation</span>
                  </Button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto">
                  <ChaitanyamHistoryList />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MAIN CHAT COLUMN */}
        <main
          className="flex-1 flex flex-col h-full overflow-hidden bg-background relative"
          role="main"
        >
          {/* Subtle ambient light backdrops */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-1/4 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-20 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px]" />
          </div>

          {/* Scrollable messages container */}
          <div className="flex-1 overflow-hidden flex flex-col relative z-10">
            <ChaitanyamMessageList />
          </div>

          {/* Bottom input composer */}
          <div className="relative z-10">
            <ChaitanyamInput />
          </div>
        </main>
      </div>
    </div>
  );
}
