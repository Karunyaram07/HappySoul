// * CHAITANYAM AI DRAWER HEADER - PHASE 6B.5
// ? Header section for Chaitanyam AI drawer featuring title, spiritual subtitle,
// ? "New conversation" reset trigger, and accessible single Close button.

"use client";

import React from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { useChaitanyam } from "./ChaitanyamProvider";
import { Button } from "@/components/ui/button";

export default function ChaitanyamHeader() {
  const { closeChat, startNewConversation, loading } = useChaitanyam();

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card/90 backdrop-blur-md shrink-0">
      {/* Title & Spiritual Subtitle */}
      <div className="flex items-center gap-3 text-left min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-accent border border-accent/30 shadow-md shrink-0">
          <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            Chaitanyam AI
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground border border-accent/30">
              Gita Companion
            </span>
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            Your companion for wisdom, reflection & inner peace.
          </p>
        </div>
      </div>

      {/* Action Controls: New Conversation & Close */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={startNewConversation}
          disabled={loading}
          className="h-9 px-2.5 rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
          title="Start a new conversation"
          aria-label="Start a new conversation"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">New Chat</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={closeChat}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
          title="Close assistant"
          aria-label="Close Chaitanyam AI assistant"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
