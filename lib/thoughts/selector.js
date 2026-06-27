// * RULE-BASED PERSONALIZED THOUGHT SELECTOR
// ? Evaluates user goals/interests and applies a rule-based algorithm to select matching quotes.

import { CURATED_THOUGHTS } from "./dataset";
import { getDeterministicIndex } from "./hash";

export function selectDailyThought(profile, dateOffset = 0) {
  const language = profile?.preferred_language || "English";
  const goals = profile?.goals || [];
  const interests = profile?.interests || [];
  const userId = profile?.id || "anonymous-seeker";

  // * Establish target tags based on user onboarding goals and interests
  const targetTags = new Set();
  goals.forEach(goal => {
    if (goal === "Peace of Mind" || goal === "Reduce Stress") {
      targetTags.add("peace");
      targetTags.add("mindfulness");
      targetTags.add("meditation");
    }
    if (goal === "Better Focus" || goal === "Self Discipline") {
      targetTags.add("discipline");
      targetTags.add("mind");
      targetTags.add("focus");
    }
    if (goal === "Motivation") {
      targetTags.add("motivation");
      targetTags.add("positivity");
      targetTags.add("joy");
    }
    if (goal === "Spiritual Growth") {
      targetTags.add("spiritual");
      targetTags.add("wisdom");
    }
    if (goal === "Better Decision Making") {
      targetTags.add("wisdom");
      targetTags.add("focus");
      targetTags.add("discipline");
    }
    if (goal === "Build Positive Habits") {
      targetTags.add("habit");
      targetTags.add("gratitude");
      targetTags.add("discipline");
    }
  });

  interests.forEach(interest => {
    if (interest === "Bhagavad Gita" || interest === "Krishna Teachings") {
      targetTags.add("spiritual");
      targetTags.add("wisdom");
      targetTags.add("action");
    }
    if (interest === "Yoga" || interest === "Meditation") {
      targetTags.add("meditation");
      targetTags.add("peace");
      targetTags.add("mindfulness");
      targetTags.add("breathing");
    }
    if (interest === "Inspirational Quotes" || interest === "Motivational Stories" || interest === "Motivational Songs") {
      targetTags.add("motivation");
      targetTags.add("positivity");
      targetTags.add("joy");
    }
    if (interest === "Devotional Music") {
      targetTags.add("spiritual");
      targetTags.add("peace");
    }
  });

  // * Score candidates across the entire dataset to support the three-level fallback
  const scoredThoughts = CURATED_THOUGHTS.map(thought => {
    let score = 0;

    // 1. Three-Level Language Fallback Score Boosts
    if (thought.language.toLowerCase() === language.toLowerCase()) {
      score += 20; // Level 1: Matches Preferred Language
    } else if (thought.language.toLowerCase() === "english") {
      score += 10; // Level 2: Matches English Fallback
    } else {
      score += 0;  // Level 3: Matches Any Language
    }

    // 2. Category Match: Boost thoughts in category matching interests/goals
    if (interests.includes(thought.category) || (goals.includes(thought.category))) {
      score += 3;
    }

    // 3. Goal/Interest Tags Match
    thought.tags.forEach(tag => {
      if (targetTags.has(tag)) {
        score += 1;
      }
    });

    return { thought, score };
  });

  // Sort candidates by score descending
  scoredThoughts.sort((a, b) => b.score - a.score);

  // Take candidate items with the highest scores
  const maxScore = scoredThoughts[0]?.score || 0;
  const topCandidates = scoredThoughts
    .filter(item => item.score >= Math.max(0, maxScore - 1))
    .map(item => item.thought);

  // * 4. Date-based deterministic hash selection
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const seed = `${userId}-${dateStr}-${dateOffset}`;
  const index = getDeterministicIndex(seed, topCandidates.length || CURATED_THOUGHTS.length);

  return topCandidates[index] || CURATED_THOUGHTS[index] || CURATED_THOUGHTS[0];
}
