// * CHAITANYAM AI INPUT CONTROL - PHASE 6B.5 / 6B.6
// ! "use client" input bar enforcing MAX_MESSAGE_LENGTH = 1000 validation,
// ? live character counter, duplicate submit guards, enter-to-send keyboard handler,
// ? and mobile safe-area inset positioning.
// ?
// ? Phase 6B.6: clears unsent draft text whenever conversationId changes
// ? (e.g. after loading a history conversation or starting a new chat).

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useChaitanyam } from "./ChaitanyamProvider";
import { Button } from "@/components/ui/button";

const MAX_MESSAGE_LENGTH = 1000;

export default function ChaitanyamInput() {
  const { sendMessage, loading, conversationId, preferredLanguage } = useChaitanyam();
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef(null);
  const isTelugu = preferredLanguage === "Telugu";

  // Focus textarea when component mounts
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Phase 6B.6: clear any unsent draft when the active conversation changes.
  // This fires when:
  //   - a history conversation is loaded (conversationId → new UUID)
  //   - New Conversation is started (conversationId → null)
  // We track the previous value so we only clear on an actual change.
  const prevConversationIdRef = useRef(conversationId);
  useEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [conversationId]);

  const currentLength = inputText.length;
  const isOverLimit = currentLength > MAX_MESSAGE_LENGTH;
  const isSendDisabled = loading || !inputText.trim() || isOverLimit;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isSendDisabled) return;

    const textToSend = inputText;
    setInputText("");
    sendMessage(textToSend);

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    // Auto-grow textarea height dynamically up to 120px
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-border/60 bg-card/90 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0"
    >
      <div className="relative flex flex-col gap-2 max-w-3xl mx-auto w-full">
        <div className="relative flex items-end gap-2 bg-secondary/30 border border-border rounded-2xl p-2 transition-all focus-within:border-primary focus-within:bg-background focus-within:ring-1 focus-within:ring-primary">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={isTelugu ? "చైతన్యం AI వద్ద నుండి మార్గదర్శకత్వం కోరండి..." : "Ask Chaitanyam AI for guidance..."}
            className={`flex-1 bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground/60 px-2.5 py-1.5 max-h-[120px] min-h-[38px] disabled:opacity-50 ${
              isTelugu ? "font-telugu leading-[2.0] text-[15px]" : "text-sm"
            }`}
            aria-label="Ask Chaitanyam AI for guidance"
          />

          <Button
            type="submit"
            size="icon"
            disabled={isSendDisabled}
            className="h-9 w-9 rounded-xl shrink-0 cursor-pointer transition-transform active:scale-95 disabled:opacity-40"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
            ) : (
              <Send className="h-4 w-4 text-primary-foreground" />
            )}
          </Button>
        </div>

        {/* Character Counter & Helper Text */}
        <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground select-none">
          <span>Shift + Enter for new line</span>
          <span className={isOverLimit ? "text-destructive font-bold" : ""}>
            {currentLength} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>
      </div>
    </form>
  );
}
