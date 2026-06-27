// * PROFILE DOMAIN MODULE - PROVIDER
// ? Encapsulates database actions (CRUD) and utility profile metrics calculations.

/**
 * Retrieves a user profile by ID.
 * @param {object} supabase - Supabase client instance
 * @param {string} userId - Auth user UUID
 * @returns {Promise<object|null>} The user profile data, or null
 */
async function getProfile(supabase, userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
    
  if (error) {
    console.error(`[Profile Provider] Error fetching profile: ${error.message}`);
    return null;
  }
  return data;
}

/**
 * Updates a user profile.
 * @param {object} supabase - Supabase client instance
 * @param {string} userId - Auth user UUID
 * @param {object} data - Profile updates dictionary
 * @returns {Promise<object|null>} The updated user profile, or null
 */
async function updateProfile(supabase, userId, data) {
  if (!userId) return null;
  
  // Ensure we append the updated_at timestamp in JS just in case, though database trigger also handles it
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();
    
  if (error) {
    console.error(`[Profile Provider] Error updating profile: ${error.message}`);
    throw new Error(error.message);
  }
  return updated;
}

/**
 * Computes profile completion progress as an integer percentage.
 * @param {object} profile - Profile record
 * @returns {number} Completion percentage (0 - 100)
 */
function getProfileCompletion(profile) {
  if (!profile) return 0;
  
  const fields = [
    { key: "full_name", type: "string" },
    { key: "preferred_language", type: "string" },
    { key: "goals", type: "array" },
    { key: "interests", type: "array" },
    { key: "current_life_situation", type: "string" },
    { key: "primary_challenge", type: "string" },
    { key: "experience_level", type: "string" },
    { key: "daily_reminder_period", type: "string" },
    { key: "learning_style", type: "string" },
    { key: "music_mood_preference", type: "string" },
    { key: "avatar_type", type: "string" },
    { key: "avatar_color", type: "string" },
    { key: "spiritual_path", type: "string" },
  ];
  
  let filledCount = 0;
  fields.forEach(({ key, type }) => {
    const val = profile[key];
    if (val === null || val === undefined) return;
    if (type === "string" && typeof val === "string" && val.trim().length > 0) {
      filledCount++;
    } else if (type === "array" && Array.isArray(val) && val.length > 0) {
      filledCount++;
    } else if (type === "boolean" || typeof val === "boolean") {
      filledCount++;
    }
  });
  
  return Math.round((filledCount / fields.length) * 100);
}

/**
 * Determines whether the user has completed onboarding.
 * @param {object} profile - Profile record
 * @returns {boolean} True if onboarded
 */
function isOnboardingComplete(profile) {
  return !!(profile && profile.is_onboarded);
}

/**
 * Assembles a structured profile context object to pass as prompting background to Krishna AI.
 * @param {object} profile - Profile record
 * @returns {object} Cleaned AI profile context object
 */
function buildAIProfileContext(profile) {
  if (!profile) {
    return {
      name: "Seeker",
      language: "English",
      goals: "",
      interests: "",
      lifeSituation: "Not specified",
      primaryChallenge: "Not specified",
      experienceLevel: "Not specified",
      learningStyle: "Not specified",
      spiritualPath: "Balanced",
    };
  }
  
  const goalsStr = Array.isArray(profile.goals) && profile.goals.length > 0
    ? profile.goals.join(", ")
    : "";
    
  const interestsStr = Array.isArray(profile.interests) && profile.interests.length > 0
    ? profile.interests.join(", ")
    : "";
    
  return {
    name: profile.full_name || "Seeker",
    language: profile.preferred_language || "English",
    goals: goalsStr,
    interests: interestsStr,
    lifeSituation: profile.current_life_situation || "Not specified",
    primaryChallenge: profile.primary_challenge || "Not specified",
    experienceLevel: profile.experience_level || "Not specified",
    learningStyle: profile.learning_style || "Not specified",
    spiritualPath: profile.spiritual_path || "Balanced",
  };
}

module.exports = {
  getProfile,
  updateProfile,
  getProfileCompletion,
  isOnboardingComplete,
  buildAIProfileContext,
};
