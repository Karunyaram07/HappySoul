// * CHAITANYAM AI HISTORY LIST - PHASE 6B.6
// ? Renders the user's recent conversation list inside the existing drawer.
// ? Selecting a conversation loads its messages and returns to the active chat view.
// ? Follows Happy Soul design language (glassmorphism, dark mode, Framer Motion).

"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { useChaitanyam } from "./ChaitanyamProvider";
import { Button } from "@/components/ui/button";

/** Format an ISO date string into a relative / readable label */
function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function ChaitanyamHistoryList() {
  const {
    conversationsList,
    loadingHistory,
    historyError,
    loadingConversationId,
    loadConversation,
    refreshConversationsList,
    conversationId: activeConversationId,
  } = useChaitanyam();

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loadingHistory && conversationsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12 gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Loading your conversations…</p>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (historyError && conversationsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-10 px-5 gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Unable to load history</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{historyError}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshConversationsList}
          disabled={loadingHistory}
          className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer"
          aria-label="Retry loading conversations"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
          Try Again
        </Button>
      </div>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────────
  if (!loadingHistory && conversationsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-10 px-5 gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary/60 text-muted-foreground border border-border/60">
          <MessageSquare className="h-7 w-7" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <p className="text-sm font-semibold text-foreground">No conversations yet</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Start a conversation with Chaitanyam to see it here.
          </p>
        </div>
      </div>
    );
  }

  // ── Conversation List ──────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Section Label */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Recent Conversations
        </span>
        {loadingHistory && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>

      <ul role="list" className="px-3 pb-4 space-y-1">
        {conversationsList.map((conv, idx) => {
          const isActive = conv.id === activeConversationId;
          const isLoadingThis = loadingConversationId === conv.id;
          const isLoadingOther =
            loadingConversationId !== null && loadingConversationId !== conv.id;

          return (
            <motion.li
              key={conv.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.18 }}
            >
              <button
                onClick={() => loadConversation(conv.id)}
                disabled={isLoadingThis || isLoadingOther}
                aria-label={`Open conversation: ${conv.title}`}
                aria-current={isActive ? "true" : undefined}
                className={`
                  w-full text-left px-3 py-3 rounded-xl border transition-all duration-200
                  flex items-start gap-3 group cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    isActive
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "bg-card/60 border-border/60 hover:bg-secondary/40 hover:border-primary/20 text-foreground"
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border mt-0.5 transition-colors ${
                    isActive
                      ? "bg-primary/20 border-primary/30 text-primary"
                      : "bg-secondary/60 border-border/60 text-muted-foreground group-hover:text-primary"
                  }`}
                >
                  {isLoadingThis ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-snug truncate pr-1">
                    {conv.title || "New Conversation"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDate(conv.updatedAt)}
                  </p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary self-center mt-0.5" />
                )}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
