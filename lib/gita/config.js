// * BHAGAVAD GITA MODULE CONFIGURATION
// ? Centralizes dataset URLs, supported languages, default translators, and library variables.
// ! This file contains configuration constants only (no fetch logic).

export const GITA_CONFIG = {
  // * Ravi Siyer's Open Bhagavad Gita Dataset base URL
  DATASET_BASE_URL: "https://ravisiyer.github.io/gita-data/v1",

  // * Default translation reference parameter for importing in Phase 6A.2
  DEFAULT_TRANSLATOR: "Swami Sivananda",
  DEFAULT_TRANSLATOR_ID: "sivananda",

  // * Default commentary reference parameter for importing in Phase 6A.2
  DEFAULT_COMMENTARY: "Swami Sivananda",
  DEFAULT_COMMENTARY_ID: "sivananda",

  // * Gita library version tracking
  LIBRARY_VERSION: "1.0.0",

  // * Supported translation/commentary languages
  SUPPORTED_LANGUAGES: ["English", "Hindi", "Telugu"],
};
