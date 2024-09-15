/**
 * Efficient utility function to calculate player level based on current XP.
 * Assumes an exponential XP progression system commonly used in games.
 *
 * @param currentXP - The player's current experience points.
 * @returns The player's level.
 */
export function getLevelFromXP(currentXP: number): number {
  const baseXP = 100;
  const exponent = 1.5;

  // Calculate the level directly using the inverse of the XP formula
  const level = Math.floor(Math.pow(currentXP / baseXP, 1 / exponent));

  // Ensure the level is at least 1
  return Math.max(level, 1);
}
