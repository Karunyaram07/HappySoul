// * DETERMINISTIC HASHING UTILITY
// ? Generates stable, date-based indices for selection without tracking state in the DB.

export function getDeterministicIndex(seed, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}
