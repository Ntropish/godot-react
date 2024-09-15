import { getXPStats } from "./getXPStats";
import { Skill } from "./schema";

export function addXP(skill: Skill, xp: number): Skill {
  const newXP = skill.xp + xp;
  const newLevelStats = getXPStats(newXP);

  return {
    xp: newXP,
    ...newLevelStats,
  };
}
