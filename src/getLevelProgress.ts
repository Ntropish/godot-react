/**
 * Utility function to calculate the player's progress towards the next level.
 * Returns a value between 0 and 1 indicating the percentage progress within the current level.
 *
 * @param currentXP - The player's current experience points.
 * @returns A number between 0 and 1 representing the progress towards the next level.
 */
export function getLevelProgress(currentXP: number): number {
  const baseXP = 100;
  const exponent = 1.5;

  // Calculate the current level (integer)
  const level = Math.floor(Math.pow(currentXP / baseXP, 1 / exponent)) + 1;

  // XP required to reach the current level
  const xpForCurrentLevel = baseXP * Math.pow(level - 1, exponent);

  // XP required to reach the next level
  const xpForNextLevel = baseXP * Math.pow(level, exponent);

  // Calculate progress towards the next level
  const progress =
    (currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);

  // Ensure progress is between 0 and 1
  return Math.min(Math.max(progress, 0), 1);
}
