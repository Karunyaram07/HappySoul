// * GITA SEED PIPELINE - UTILITIES HELPER
// ? Handles loading .env.local variables and calculating content hashes.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * Parses and loads environment variables from .env.local in the root directory.
 * @returns {object} Map of loaded environment variables
 */
function loadEnv() {
  const envPath = path.join(__dirname, "../../.env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local file not found at project root. Please define it.");
  }
  
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    
    const delimiterIndex = trimmed.indexOf("=");
    if (delimiterIndex === -1) return;
    
    const key = trimmed.slice(0, delimiterIndex).trim();
    let val = trimmed.slice(delimiterIndex + 1).trim();
    
    // Strip wrapping quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    
    env[key] = val;
    process.env[key] = val;
  });
  
  return env;
}

/**
 * Calculates a SHA256 checksum for a given object or string.
 * @param {any} data - Input data
 * @returns {string} SHA256 hex checksum
 */
function calculateChecksum(data) {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return crypto.createHash("sha256").update(str).digest("hex");
}

module.exports = {
  loadEnv,
  calculateChecksum,
};
