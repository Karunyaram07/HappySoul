// * PROFILE DOMAIN MODULE - SCHEMA DOCUMENTATION
// ? Documents the fields and shapes of the profiles database entity.

/**
 * @typedef {object} Profile
 * @property {string} id - UUID primary key linked to auth.users
 * @property {string} full_name - Display name of the user
 * @property {string} preferred_language - Primary language for content (default 'English')
 * @property {string[]} goals - Intended wellness goals (array)
 * @property {string[]} interests - Selected wellness interests (array)
 * @property {string|null} current_life_situation - Student, Working Professional, Homemaker, etc.
 * @property {string|null} primary_challenge - Stress, Anxiety, Self Discipline, etc.
 * @property {string|null} experience_level - New to spirituality, Some experience, Regular practitioner
 * @property {string} daily_reminder_period - morning, afternoon, evening, night
 * @property {boolean} notifications_enabled - True/false (default true)
 * @property {string} notification_frequency - daily, weekdays, weekly
 * @property {string} content_format_preference - quick_inspiration, balanced_reading, deep_reflection
 * @property {string|null} learning_style - Reading, Listening, Watching, Guided Practice, Mix of Everything
 * @property {string} music_mood_preference - peaceful, devotional, meditation, nature, motivational, instrumental
 * @property {string} avatar_type - lotus, peacock_feather, om, conch, flute, sun, mountain, tree
 * @property {string} avatar_color - indigo, emerald, amber, rose, teal, purple
 * @property {string} spiritual_path - bhakti, karma_yoga, jnana_yoga, meditation, mindfulness, balanced
 * @property {number} onboarding_version - Onboarding design version (default 1)
 * @property {number} profile_version - Profile database schema version (default 1)
 * @property {string|null} onboarding_completed_at - Timestamp of onboarding completion
 * @property {string|null} avatar_url - Legacy avatar URL
 * @property {string} created_at - Timestamp of record creation
 * @property {string} updated_at - Timestamp of last update
 */

module.exports = {};
