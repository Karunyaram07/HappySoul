// * GITA SEED PIPELINE - FETCH WITH RETRY HELPER
// ? Handles downloading external JSON resources with automatic retry policies.

/**
 * Fetches resource from URL, retrying on network/connection failures.
 * @param {string} url - Target resource URL
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Initial backoff delay in ms
 * @returns {Promise<any>} Response json payload
 */
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP Error response: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (retries <= 1) {
      throw new Error(`Failed to fetch ${url} after all retry attempts. Original error: ${err.message}`);
    }
    console.warn(`[Fetch Retry] Failed fetching ${url}. Retrying in ${delay}ms... (${retries - 1} attempts left). Error: ${err.message}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
}

module.exports = {
  fetchWithRetry,
};
