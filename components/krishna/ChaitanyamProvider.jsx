// * CHAITANYAM AI STATE PROVIDER & CONTEXT - PHASE 6B.5
// ! "use client" component encapsulating all state management for Chaitanyam AI
// ? Manages chat drawer visibility, optimistic message flow, request generation guards,
// ? abort controls, error handling, retry logic, and user sign-out state resets.

"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { sendChaitanyamMessage } from "./api";
import ChaitanyamTrigger from "./ChaitanyamTrigger";

const DynamicChaitanyamDrawer = dynamic(() => import("./ChaitanyamDrawer"), {
  ssr: false,
});

const ChaitanyamContext = createContext(null);
const MAX_MESSAGE_LENGTH = 1000;

export function ChaitanyamProvider({ children, userId = null, userFirstName = "Seeker" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedText, setLastFailedText] = useState(null);

  // Refs for concurrency & duplicate send guards
  const requestGenRef = useRef(0);
  const abortControllerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const currentUserIdRef = useRef(userId);

  // ── Reset All Chat State ───────────────────────────────────────────────────
  const resetAllState = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("USER_ABORT");
      abortControllerRef.current = null;
    }
    requestGenRef.current += 1;
    isSubmittingRef.current = false;

    setIsOpen(false);
    setMessages([]);
    setConversationId(null);
    setLoading(false);
    setError(null);
    setLastFailedText(null);
  }, []);

  // ── User Change & Sign-Out Listener ────────────────────────────────────────
  useEffect(() => {
    // Reset state if userId changes
    if (currentUserIdRef.current !== userId) {
      currentUserIdRef.current = userId;
      resetAllState();
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        resetAllState();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, resetAllState]);

  // ── Drawer Visibility Controls ─────────────────────────────────────────────
  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ── Start New Conversation ─────────────────────────────────────────────────
  const startNewConversation = useCallback(() => {
    // Abort active request and increment generation counter
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("USER_ABORT");
      abortControllerRef.current = null;
    }
    requestGenRef.current += 1;
    isSubmittingRef.current = false;

    setMessages([]);
    setConversationId(null);
    setLoading(false);
    setError(null);
    setLastFailedText(null);
  }, []);

  // ── Core Send Message Handler ──────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text, isRetry = false) => {
      if (!text || typeof text !== "string") return;
      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length > MAX_MESSAGE_LENGTH) return;
      if (isSubmittingRef.current || loading) return;

      isSubmittingRef.current = true;
      setError(null);
      setLastFailedText(null);

      // Setup generation & abort controller
      const currentGen = requestGenRef.current;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort("USER_ABORT");
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Optimistically append user message if not a retry
      const userMsgId = `user-opt-${Date.now()}`;
      if (!isRetry) {
        const optimisticUserMsg = {
          id: userMsgId,
          role: "user",
          content: trimmedText,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticUserMsg]);
      }

      setLoading(true);

      try {
        const res = await sendChaitanyamMessage({
          message: trimmedText,
          conversationId: conversationId,
          signal: controller.signal,
        });

        // Stale response guard check
        if (currentGen !== requestGenRef.current) {
          return;
        }

        if (res.isAborted) {
          setLoading(false);
          isSubmittingRef.current = false;
          return;
        }

        if (!res.ok) {
          setError(res.error);
          setLastFailedText(trimmedText);
          setLoading(false);
          isSubmittingRef.current = false;
          return;
        }

        // Successfully received assistant response
        if (res.conversationId) {
          setConversationId(res.conversationId);
        }

        const assistantMsg = {
          id: res.message.id || `asst-${Date.now()}`,
          role: "assistant",
          content: res.message.content,
          citedVerseIds: res.message.citedVerseIds || [],
          citations: res.message.citations || [],
          createdAt: res.message.createdAt || new Date().toISOString(),
          isGrounded: res.meta?.isGrounded !== false,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setError(null);
        setLastFailedText(null);
      } catch (err) {
        if (currentGen === requestGenRef.current) {
          setError("Something went wrong. Please try again.");
          setLastFailedText(trimmedText);
        }
      } finally {
        if (currentGen === requestGenRef.current) {
          setLoading(false);
          isSubmittingRef.current = false;
        }
      }
    },
    [loading, conversationId]
  );

  // ── Retry Last Failed Action ───────────────────────────────────────────────
  const retry = useCallback(() => {
    if (lastFailedText && !loading) {
      sendMessage(lastFailedText, true);
    }
  }, [lastFailedText, loading, sendMessage]);

  const value = {
    isOpen,
    messages,
    conversationId,
    loading,
    error,
    userId,
    userFirstName,
    lastFailedText,
    openChat,
    closeChat,
    startNewConversation,
    sendMessage,
    retry,
  };

  return (
    <ChaitanyamContext.Provider value={value}>
      {children}
      <ChaitanyamTrigger />
      <DynamicChaitanyamDrawer />
    </ChaitanyamContext.Provider>
  );
}

export function useChaitanyam() {
  const context = useContext(ChaitanyamContext);
  if (!context) {
    throw new Error("useChaitanyam must be used within a ChaitanyamProvider");
  }
  return context;
}
