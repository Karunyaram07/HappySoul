// * CHAITANYAM AI STATE PROVIDER & CONTEXT - PHASE 6B.5 / 6B.6
// ! "use client" component encapsulating all state management for Chaitanyam AI.
// ? Phase 6B.5: chat drawer visibility, optimistic message flow, request generation guards,
// ?             abort controls, error handling, retry logic, and user sign-out state resets.
// ? Phase 6B.6: conversation history list (conversationsList), per-conversation message
// ?             loading (loadConversation), and history-view toggle (showHistory).
// ?             History is fetched on demand when the drawer opens (once per open session).

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import {
  sendChaitanyamMessage,
  fetchConversations,
  fetchConversationMessages,
} from "./api";
import ChaitanyamTrigger from "./ChaitanyamTrigger";

const DynamicChaitanyamDrawer = dynamic(() => import("./ChaitanyamDrawer"), {
  ssr: false,
});

const ChaitanyamContext = createContext(null);
const MAX_MESSAGE_LENGTH = 1000;

export function ChaitanyamProvider({ children, userId = null, userFirstName = "Seeker" }) {
  // ── Phase 6B.5 Chat State ──────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedText, setLastFailedText] = useState(null);

  // ── Phase 6B.6 History State ───────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
  const [conversationsList, setConversationsList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [loadingConversationId, setLoadingConversationId] = useState(null); // which conv is being loaded

  // Tracks whether history has been fetched in this drawer open session
  const historyFetchedRef = useRef(false);

  // Refs for concurrency & duplicate send guards
  const requestGenRef = useRef(0);
  const abortControllerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const currentUserIdRef = useRef(userId);

  // Abort controller specifically for history/GET requests
  const historyAbortRef = useRef(null);

  // ── Reset All Chat State ───────────────────────────────────────────────────
  const resetAllState = useCallback(() => {
    // Abort active message request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("USER_ABORT");
      abortControllerRef.current = null;
    }
    // Abort active history request
    if (historyAbortRef.current) {
      historyAbortRef.current.abort("USER_ABORT");
      historyAbortRef.current = null;
    }
    requestGenRef.current += 1;
    isSubmittingRef.current = false;
    historyFetchedRef.current = false;

    setIsOpen(false);
    setMessages([]);
    setConversationId(null);
    setLoading(false);
    setError(null);
    setLastFailedText(null);

    // Clear history state too (user change or sign-out)
    setShowHistory(false);
    setConversationsList([]);
    setLoadingHistory(false);
    setHistoryError(null);
    setLoadingConversationId(null);
  }, []);

  // ── User Change & Sign-Out Listener ────────────────────────────────────────
  useEffect(() => {
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
    setShowHistory(false);
  }, []);

  // ── History View Toggle ────────────────────────────────────────────────────
  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  // ── Phase 6B.6: Fetch Conversations List ──────────────────────────────────
  // Fetches once per drawer open session. Subsequent toggles reuse cached list.
  const loadConversationsList = useCallback(async () => {
    if (loadingHistory) return;

    // Abort previous history request if any
    if (historyAbortRef.current) {
      historyAbortRef.current.abort("USER_ABORT");
    }
    const controller = new AbortController();
    historyAbortRef.current = controller;

    setLoadingHistory(true);
    setHistoryError(null);

    const result = await fetchConversations({ signal: controller.signal });

    // Ignore aborted requests
    if (result.isAborted) {
      setLoadingHistory(false);
      return;
    }

    if (!result.ok) {
      setHistoryError(result.error || "Unable to load your conversations right now. Please try again.");
      setLoadingHistory(false);
      return;
    }

    setConversationsList(result.conversations || []);
    setHistoryError(null);
    historyFetchedRef.current = true;
    setLoadingHistory(false);
  }, [loadingHistory]);

  // ── Phase 6B.6: Auto-fetch history when drawer opens ──────────────────────
  // Fetch on first open; skip if already fetched this session.
  useEffect(() => {
    if (isOpen && !historyFetchedRef.current && userId) {
      loadConversationsList();
    }
    // When drawer closes, reset history view but keep the list cached
    if (!isOpen) {
      setShowHistory(false);
    }
  }, [isOpen, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase 6B.6: Load a Conversation's Messages ────────────────────────────
  const loadConversation = useCallback(
    async (targetConversationId) => {
      if (!targetConversationId || typeof targetConversationId !== "string") return;
      if (loadingConversationId === targetConversationId) return; // already loading this one

      // Abort any in-progress message send to prevent state collision
      if (abortControllerRef.current) {
        abortControllerRef.current.abort("USER_ABORT");
        abortControllerRef.current = null;
      }
      // Increment generation to invalidate any stale in-flight requests
      requestGenRef.current += 1;
      isSubmittingRef.current = false;

      // Abort any prior history GET request
      if (historyAbortRef.current) {
        historyAbortRef.current.abort("USER_ABORT");
      }
      const controller = new AbortController();
      historyAbortRef.current = controller;

      const thisGen = requestGenRef.current;

      setLoadingConversationId(targetConversationId);
      setError(null);
      setLastFailedText(null);

      const result = await fetchConversationMessages(targetConversationId, {
        signal: controller.signal,
      });

      // Stale request guard: if another conversation was selected while this was loading,
      // discard the result so it cannot overwrite the newer selection.
      if (thisGen !== requestGenRef.current || result.isAborted) {
        setLoadingConversationId(null);
        return;
      }

      if (!result.ok) {
        let errMsg = result.error || "Unable to open this conversation. Please try again.";
        if (result.status === 401) errMsg = "Please sign in again to continue.";
        if (result.status === 404) errMsg = "This conversation is no longer available.";
        setError(errMsg);
        setLoadingConversationId(null);
        return;
      }

      // Replace visible messages with loaded history
      // Map API shape → provider shape (add isGrounded for assistant messages)
      const loadedMessages = (result.messages || []).map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        ...(msg.role === "assistant"
          ? {
              citedVerseIds: msg.citedVerseIds || [],
              citations: msg.citations || [],
              // Restored messages: treat as grounded if they have citations, else false
              isGrounded: Array.isArray(msg.citations) && msg.citations.length > 0,
            }
          : {}),
      }));

      // Clear unsent input by setting messages first, then updating conversationId.
      // The Input component reads from context; clearing lastFailedText also clears
      // any stored retry text.
      setMessages(loadedMessages);
      setConversationId(result.conversation?.id || targetConversationId);
      setLastFailedText(null);
      setLoadingConversationId(null);

      // Return to chat view after loading
      setShowHistory(false);
    },
    [loadingConversationId]
  );

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
    setShowHistory(false);
    // Previous DB conversation is NOT deleted — remains in history list
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

        // Invalidate history list so it will refresh on next view
        // (new conversation/message was added, list may be stale)
        historyFetchedRef.current = false;
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

  // ── Refresh History List (manual refresh) ─────────────────────────────────
  const refreshConversationsList = useCallback(() => {
    historyFetchedRef.current = false;
    loadConversationsList();
  }, [loadConversationsList]);

  const value = {
    // Phase 6B.5
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
    // Phase 6B.6
    showHistory,
    toggleHistory,
    conversationsList,
    loadingHistory,
    historyError,
    loadingConversationId,
    loadConversation,
    refreshConversationsList,
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
