// * PROFILE DOMAIN MODULE - CONSTANTS & CONFIGURATIONS
// ? Exports configurations, mapping tokens, and static defaults for user profiles.

const AVATAR_CONFIG = {
  lotus: { emoji: "🌸", label: "Lotus", color: "rose" },
  peacock_feather: { emoji: "🪶", label: "Peacock Feather", color: "sky" },
  om: { emoji: "🕉️", label: "Om", color: "amber" },
  conch: { emoji: "🐚", label: "Conch", color: "cyan" },
  flute: { emoji: "🎵", label: "Flute", color: "emerald" },
  sun: { emoji: "☀️", label: "Sun", color: "orange" },
  mountain: { emoji: "⛰️", label: "Mountain", color: "slate" },
  tree: { emoji: "🌳", label: "Tree", color: "green" },
};

const DEFAULT_PROFILE_VALUES = {
  preferred_language: "English",
  goals: [],
  interests: [],
  current_life_situation: null,
  primary_challenge: null,
  experience_level: null,
  daily_reminder_period: "morning",
  notifications_enabled: true,
  notification_frequency: "daily",
  content_format_preference: "balanced",
  learning_style: null,
  music_mood_preference: "peaceful",
  avatar_type: "lotus",
  avatar_color: "indigo",
  spiritual_path: "balanced",
  onboarding_version: 1,
  profile_version: 1,
  is_onboarded: false,
};

module.exports = {
  AVATAR_CONFIG,
  DEFAULT_PROFILE_VALUES,
};
