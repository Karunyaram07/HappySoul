// * CHAITANYAM AI API CLIENT HELPER - PHASE 6B.5 / 6B.6
// ? Encapsulates HTTP calls to:
// ?   POST /api/krishna               — send a message (6B.5)
// ?   GET  /api/krishna/conversations — list recent conversations (6B.6)
// ?   GET  /api/krishna/conversations/[id] — load one conversation's messages (6B.6)
// ?
// ? All functions use safe error mapping (no raw Supabase/DB errors exposed to UI).
// ? All GET helpers accept an optional AbortSignal for concurrency control.

const REQUEST_TIMEOUT_MS = 25000; // 25-second client timeout (matches 6B.5 contract)
const HISTORY_TIMEOUT_MS = 10000; // 10-second timeout for lighter GET history requests

// ── Internal: safe error message mapping ─────────────────────────────────────

function mapHttpError(status) {
  switch (status) {
    case 400:
      return "Please enter a valid message.";
    case 401:
      return "Please sign in again to continue.";
    case 404:
      return "This conversation is no longer available.";
    case 429:
      return "Chaitanyam is busy right now. Please try again shortly.";
    case 500:
      return "Something went wrong. Please try again.";
    case 503:
      return "Chaitanyam is temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ── sendChaitanyamMessage ─────────────────────────────────────────────────────
// POST /api/krishna
// Phase 6B.5 — send a user message and receive an AI response.

export async function sendChaitanyamMessage({ message, conversationId = null, signal = null }) {
  // Create an internal timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort("TIMEOUT"), REQUEST_TIMEOUT_MS);

  // Combine external abort signal if provided
  const activeSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch("/api/krishna", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        conversationId: conversationId || undefined,
      }),
      signal: activeSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: mapHttpError(response.status),
      };
    }

    const data = await response.json();
    return {
      ok: true,
      status: 200,
      conversationId: data.conversationId,
      message: data.message,
      meta: data.meta,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err?.name === "AbortError" || activeSignal.aborted) {
      if (timeoutController.signal.aborted && activeSignal.reason !== "USER_ABORT") {
        return {
          ok: false,
          status: 408,
          error: "Chaitanyam is taking longer than expected. Please try again.",
        };
      }
      return {
        ok: false,
        status: 0,
        isAborted: true,
        error: null,
      };
    }

    return {
      ok: false,
      status: 500,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ── fetchConversations ────────────────────────────────────────────────────────
// GET /api/krishna/conversations
// Phase 6B.6 — retrieve the authenticated user's recent conversation list (max 20).

export async function fetchConversations({ signal = null } = {}) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort("TIMEOUT"), HISTORY_TIMEOUT_MS);

  const activeSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch("/api/krishna/conversations", {
      method: "GET",
      signal: activeSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      let error = "Unable to load your conversations right now. Please try again.";
      if (status === 401) error = "Please sign in again to continue.";
      return { ok: false, status, error };
    }

    const data = await response.json();
    return {
      ok: true,
      status: 200,
      conversations: data.conversations || [],
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err?.name === "AbortError" || activeSignal.aborted) {
      return { ok: false, status: 0, isAborted: true, error: null };
    }

    return {
      ok: false,
      status: 500,
      error: "Unable to load your conversations right now. Please try again.",
    };
  }
}

// ── fetchConversationMessages ─────────────────────────────────────────────────
// GET /api/krishna/conversations/[conversationId]
// Phase 6B.6 — retrieve messages for a specific conversation (max 100).

export async function fetchConversationMessages(conversationId, { signal = null } = {}) {
  if (!conversationId || typeof conversationId !== "string") {
    return { ok: false, status: 400, error: "Invalid conversation ID." };
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort("TIMEOUT"), HISTORY_TIMEOUT_MS);

  const activeSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(`/api/krishna/conversations/${encodeURIComponent(conversationId)}`, {
      method: "GET",
      signal: activeSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      let error = "Unable to open this conversation. Please try again.";
      if (status === 401) error = "Please sign in again to continue.";
      if (status === 404) error = "This conversation is no longer available.";
      if (status === 500) error = "Something went wrong. Please try again.";
      return { ok: false, status, error };
    }

    const data = await response.json();
    return {
      ok: true,
      status: 200,
      conversation: data.conversation,
      messages: data.messages || [],
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err?.name === "AbortError" || activeSignal.aborted) {
      return { ok: false, status: 0, isAborted: true, error: null };
    }

    return {
      ok: false,
      status: 500,
      error: "Unable to open this conversation. Please try again.",
    };
  }
}
