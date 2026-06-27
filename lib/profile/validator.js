// * PROFILE DOMAIN MODULE - VALIDATOR
// ? Implements validation rules for onboarding and profile settings.

/**
 * Validates the basic user profile details.
 * @param {object} data - Form data containing full_name and preferred_language
 * @returns {string|null} Error message if invalid, or null if valid
 */
function validateBasicDetails(data) {
  if (!data) return "Invalid profile data.";
  
  const fullName = data.full_name || "";
  if (!fullName.trim()) {
    return "Please enter your full name.";
  }
  
  const language = data.preferred_language || "";
  if (!language.trim()) {
    return "Please select your preferred language.";
  }
  
  return null;
}

/**
 * Validates goals selection.
 * @param {string[]} goals - List of goals
 * @returns {string|null} Error message if invalid, or null if valid
 */
function validateGoals(goals) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return "Please select at least one wellness goal.";
  }
  return null;
}

/**
 * Validates interests selection.
 * @param {string[]} interests - List of interests
 * @returns {string|null} Error message if invalid, or null if valid
 */
function validateInterests(interests) {
  if (!Array.isArray(interests) || interests.length === 0) {
    return "Please select at least one area of interest.";
  }
  return null;
}

module.exports = {
  validateBasicDetails,
  validateGoals,
  validateInterests,
};
