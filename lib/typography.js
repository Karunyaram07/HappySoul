// * LANGUAGE-AWARE TYPOGRAPHY UTILITIES — PHASE 6C.2.3
// ? Dynamically selects font families and line heights based on user's preferred_language.
// ? When Telugu:
// ?   - Ramabhadra for readable body, messages, and content with leading-[2.2]
// ?   - Chathura for decorative / display headers where appropriate
// ? When non-Telugu (English / others):
// ?   - Montserrat for major headings and titles
// ?   - Roboto Condensed for compact labels and metadata
// ?   - Standard readable typography for body text

/**
 * Resolves typographic classes according to the user's preferred language.
 *
 * @param {string} preferredLanguage - Profile preferred language string ("Telugu", "English", etc.)
 * @returns {object} Typographic classes for headings, body, display, and metadata
 */
export function getLanguageTypography(preferredLanguage) {
  const isTelugu = preferredLanguage === "Telugu";

  return {
    isTelugu,
    // Reading body font — Ramabhadra with ample line-height for Telugu script conjuncts
    bodyFont: isTelugu
      ? "font-telugu leading-[2.2] text-[15px]"
      : "leading-relaxed text-sm",
    // Primary page and section headings
    headingFont: isTelugu
      ? "font-telugu font-bold leading-[1.8]"
      : "font-heading font-extrabold tracking-tight",
    // Decorative spiritual display text — Chathura for Telugu
    displayFont: isTelugu
      ? "font-chathura font-bold leading-[1.4] text-2xl tracking-wide"
      : "font-heading font-black tracking-tight",
    // Compact dense metadata, pills, badges
    metaFont: "font-condensed tracking-wider uppercase",
    // UI input placeholder or button labels
    labelFont: isTelugu ? "font-telugu font-medium" : "font-sans",
  };
}
