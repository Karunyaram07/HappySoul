// * CHAITANYAM AI MESSAGE LIST & CHAT BODY - PHASE 6B.5
// ! "use client" component rendering empty state starter prompts, message bubbles,
// ? safe plain-text/bullet formatting (without dangerouslySetInnerHTML or markdown deps),
// ? Gita citation badges, grounding metadata labels, error alerts, and disclaimer footer.

"use client";

import React, { useRef, useEffect } from "react";
import { Sparkles, Bot, User, AlertCircle, RefreshCw, Loader2, Compass } from "lucide-react";
import { useChaitanyam } from "./ChaitanyamProvider";
import GitaCitationBadge from "./GitaCitationBadge";
import { Button } from "@/components/ui/button";

const STARTER_PROMPTS = [
  "How can I deal with overthinking?",
  "How can I stay calm during difficult times?",
  "What does the Bhagavad Gita say about fear?",
  "How can I stay focused on my goals?",
];

/**
 * Renders text safely preserving line breaks and basic bold (**text**) / bullet points
 * WITHOUT dangerouslySetInnerHTML or external markdown dependencies.
 */
function FormattedMessageContent({ content, isTelugu = false }) {
  if (!content || typeof content !== "string") return null;

  const lines = content.split("\n");

  return (
    <div
      className={
        isTelugu
          ? "space-y-2 font-telugu leading-[2.2] text-[15px]"
          : "space-y-1.5 leading-relaxed text-sm"
      }
    >
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Handle bullet points (- item or * item)
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const lineText = isBullet ? trimmed.substring(2) : line;

        // Parse **bold** substrings safely
        const parts = lineText.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className="font-bold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <React.Fragment key={partIdx}>{part}</React.Fragment>;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="text-accent font-bold select-none">•</span>
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        }

        // Empty line becomes vertical space
        if (trimmed === "") {
          return <div key={lineIdx} className="h-2" />;
        }

        return <div key={lineIdx}>{renderedLine}</div>;
      })}
    </div>
  );
}

export default function ChaitanyamMessageList() {
  const {
    messages,
    loading,
    error,
    userFirstName,
    sendMessage,
    retry,
    lastFailedText,
    preferredLanguage,
  } = useChaitanyam();
  const bottomRef = useRef(null);
  const isTelugu = preferredLanguage === "Telugu";

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, error]);

  const name = userFirstName || "Seeker";

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
      <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* ── Empty / Welcome State ────────────────────────────────────────── */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-6 px-3 space-y-6">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-amber-300 shadow-xl border border-accent/40">
              <Sparkles className="h-8 w-8 text-amber-300 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground border border-border shadow-sm">
              <Compass className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-lg font-extrabold tracking-tight text-foreground">
              Namaste, {name} 🙏
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              I am <strong className="text-foreground font-semibold">Chaitanyam AI</strong>, your companion for wisdom, reflection & inner peace inspired by the timeless teachings of the Bhagavad Gita.
            </p>
          </div>

          {/* Starter Prompts */}
          <div className="w-full max-w-sm space-y-2 pt-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block text-left px-1">
              Reflective Starter Prompts
            </span>
            <div className="grid grid-cols-1 gap-2 text-left">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="p-3 rounded-2xl border border-border/80 bg-card/60 hover:bg-secondary/40 hover:border-primary/40 text-xs font-medium text-foreground transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Messages Stream ─────────────────────────────────────────── */}
      {messages.map((msg, idx) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id || idx}
            className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-xs ${
                isUser
                  ? "bg-secondary text-foreground border-border"
                  : "bg-primary text-accent border-accent/30"
              }`}
            >
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Message Card / Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-left shadow-xs ${
                isUser
                  ? "bg-primary text-primary-foreground rounded-tr-xs"
                  : "bg-card border border-border/80 text-card-foreground rounded-tl-xs"
              }`}
            >
              <FormattedMessageContent content={msg.content} isTelugu={isTelugu} />

              {/* Citations & Grounding Metadata for Assistant Messages */}
              {!isUser && (
                <div className="mt-3 pt-2.5 border-t border-border/40 space-y-2">
                  {/* Citations list */}
                  {Array.isArray(msg.citations) && msg.citations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {msg.citations.map((cit, cIdx) => (
                        <GitaCitationBadge key={cIdx} citation={cit} />
                      ))}
                    </div>
                  )}

                  {/* General Guidance Label if not grounded */}
                  {msg.isGrounded === false && (
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      🌿 General guidance, not tied to a specific verse.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Skeleton Indicator */}
      {loading && (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-accent border border-accent/30 shadow-xs">
            <Bot className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 bg-card border border-border/80 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-muted-foreground shadow-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Chaitanyam is reflecting on Gita teachings...</span>
          </div>
        </div>
      )}

      {/* Error Alert & Retry Action */}
      {error && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-left text-xs text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold">{error}</p>
            {lastFailedText && (
              <Button
                variant="outline"
                size="sm"
                onClick={retry}
                disabled={loading}
                className="h-8 rounded-lg text-xs gap-1.5 border-destructive/40 hover:bg-destructive/20 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      {/* Static Disclaimer */}
      <div className="pt-4 text-center border-t border-border/30">
        <p className="text-[11px] text-muted-foreground/80 leading-relaxed px-2">
          Guidance inspired by the Bhagavad Gita — not therapy or medical advice.
        </p>
      </div>
      </div>
    </div>
  );
}
