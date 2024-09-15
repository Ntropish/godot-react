/**
 * Utility function that calculates the player's level, progress within the current level,
 * and remaining XP to reach the next level based on the current XP.
 *
 * @param currentXP - The player's current experience points.
 * @returns An object containing the level, progress ratio, and remaining XP.
 */
export function getXPStats(currentXP: number) {
  const baseXP = 100;
  const exponent = 1.5;

  // Calculate the exact level (can be fractional)
  const exactLevel = Math.pow(currentXP / baseXP, 1 / exponent) + 1;

  // Current level is the integer part of the exact level
  const level = Math.floor(exactLevel);

  // XP required to reach the current level
  const xpForCurrentLevel = baseXP * Math.pow(level - 1, exponent);

  // XP required to reach the next level
  const xpForNextLevel = baseXP * Math.pow(level, exponent);

  // Calculate progress within the current level (0 to 1)
  const progress =
    (currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);

  // XP remaining to reach the next level
  const remainingXP = xpForNextLevel - currentXP;

  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  // Ensure level is at least 1 and remainingXP is non-negative
  return {
    level: Math.max(level, 1),
    progress: clampedProgress,
    remainingXP: Math.max(remainingXP, 0),
  };
}
