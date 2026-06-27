// * THOUGHT DATA PROVIDER
// ? Decouples frontend components from quotes source. Can be refactored to use AI later.

import { selectDailyThought } from "./selector";

export function getDailyThought(profile, offset = 0) {
  // * Initially return rule-based locally selected content.
  // * Later, this can fetch from Gemini API or other external AI systems.
  return selectDailyThought(profile, offset);
}
