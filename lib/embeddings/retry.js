// * EMBEDDING DOMAIN MODULE - RETRY POLICY
// ? Implements exponential backoff retry execution filtering for transient errors only.

/**
 * Retries a function with exponential backoff on transient errors.
 * @param {Function} fn - Async function returning a promise
 * @param {number} retries - Number of retries remaining
 * @param {number} delay - Current delay in milliseconds
 * @param {number} factor - Exponential backoff multiplier
 * @returns {Promise<any>} Response of fn
 */
async function retryWithBackoff(fn, retries = 3, delay = 1000, factor = 2) {
  try {
    return await fn();
  } catch (error) {
    const isTransient = checkIfTransient(error);
    if (!isTransient || retries <= 1) {
      throw error;
    }
    
    console.warn(`[Retry Warning] Transient error detected: ${error.message}. Retrying in ${delay}ms... (${retries - 1} attempts left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * factor, factor);
  }
}

/**
 * Checks if the error is a transient failure (network drop, rate limit, server down)
 * @param {Error} error - Error instance
 * @returns {boolean} True if retriable
 */
function checkIfTransient(error) {
  if (!error) return false;
  const msg = error.message ? error.message.toLowerCase() : "";
  
  // Non-transient errors: Authentication keys missing, client configuration faults, bad requests
  if (
    msg.includes("api_key") ||
    msg.includes("key_invalid") ||
    msg.includes("invalid api key") ||
    msg.includes("unauthorized") ||
    msg.includes("bad request") ||
    msg.includes("400") ||
    msg.includes("403") ||
    msg.includes("401")
  ) {
    return false;
  }
  
  // Transient errors: Rate limits (429), Server faults (500, 503), timeouts, connection drops
  return (
    msg.includes("429") ||
    msg.includes("500") ||
    msg.includes("503") ||
    msg.includes("rate limit") ||
    msg.includes("quota exceeded") ||
    msg.includes("timeout") ||
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("econnreset") ||
    msg.includes("socket") ||
    msg.includes("temporary") ||
    msg.includes("overloaded")
  );
}

module.exports = {
  retryWithBackoff,
};
