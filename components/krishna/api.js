// * CHAITANYAM AI API CLIENT HELPER - PHASE 6B.5
// ? Encapsulates HTTP calls to POST /api/krishna with timeout, abort signal support,
// ? and safe user-facing error message mapping according to 6B.4 response contracts.

const REQUEST_TIMEOUT_MS = 25000; // 25 seconds client timeout

export async function sendChaitanyamMessage({ message, conversationId = null, signal = null }) {
  // Create an internal timeout controller if external signal is not aborted
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
      const status = response.status;
      let userErrorMsg = "Something went wrong. Please try again.";

      switch (status) {
        case 400:
          userErrorMsg = "Please enter a valid message.";
          break;
        case 401:
          userErrorMsg = "Please sign in again to continue.";
          break;
        case 404:
          userErrorMsg = "This conversation is no longer available.";
          break;
        case 429:
          userErrorMsg = "Chaitanyam is busy right now. Please try again shortly.";
          break;
        case 500:
          userErrorMsg = "Something went wrong. Please try again.";
          break;
        case 503:
          userErrorMsg = "Chaitanyam is temporarily unavailable. Please try again later.";
          break;
        default:
          userErrorMsg = "Something went wrong. Please try again.";
          break;
      }

      return {
        ok: false,
        status,
        error: userErrorMsg,
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
