// * CHAITANYAM AI DRAWER HEADER - PHASE 6B.5 / 6B.6
// ? Header section for Chaitanyam AI drawer featuring title, spiritual subtitle,
// ? History toggle button (Phase 6B.6), "New Conversation" reset trigger,
// ? and accessible single Close button.

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, X, History, Maximize2 } from "lucide-react";
import { useChaitanyam } from "./ChaitanyamProvider";
import { Button } from "@/components/ui/button";

export default function ChaitanyamHeader() {
  const router = useRouter();
  const { closeChat, startNewConversation, loading, showHistory, toggleHistory } = useChaitanyam();

  const handleFullscreen = () => {
    closeChat();
    router.push("/dashboard/chaitanyam");
  };

  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border/60 bg-card/90 backdrop-blur-md shrink-0 gap-3">
      {/* Title & Spiritual Subtitle */}
      <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 border border-accent/30 shadow-md shrink-0 overflow-hidden">
          <img
            src="/chaitanyam-assets/chaitanyam-ai-icon.png"
            alt="Chaitanyam AI"
            className="h-full w-full object-contain p-0.5"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <h2 className="text-sm font-bold tracking-tight text-foreground truncate">
              Chaitanyam AI
            </h2>
            <span className="text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground border border-accent/30 shrink-0 whitespace-nowrap">
              Gita Companion
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            Wisdom, reflection &amp; inner peace
          </p>
        </div>
      </div>

      {/* Action Controls: History | New Conversation | Fullscreen | Close */}
      <div className="flex items-center gap-1 shrink-0">
        {/* History toggle — Phase 6B.6 */}
        <Button
          variant={showHistory ? "secondary" : "ghost"}
          size="icon"
          onClick={toggleHistory}
          disabled={loading}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
          title={showHistory ? "Back to chat" : "View conversation history"}
          aria-label={showHistory ? "Back to active chat" : "View conversation history"}
          aria-pressed={showHistory}
        >
          <History className="h-4 w-4" />
        </Button>

        {/* New Conversation reset */}
        <Button
          variant="ghost"
          size="icon"
          onClick={startNewConversation}
          disabled={loading}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
          title="Start a new conversation"
          aria-label="Start a new conversation"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>

        {/* Fullscreen Expand — Phase 6C.2.3 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFullscreen}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
          title="Open in full page"
          aria-label="Open Chaitanyam AI in dedicated full page"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          onClick={closeChat}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
          title="Close assistant"
          aria-label="Close Chaitanyam AI assistant"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
