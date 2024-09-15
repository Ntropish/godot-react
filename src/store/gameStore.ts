import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { GameState } from "../schema";

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      /** inventory */
      root_beer: 0,
      weiner: 0,
      burger: 0,

      /** dynamic stats */
      hunger: 10,
      thirst: 10,

      /** calculated stats */
      weight: 0,
      maximumCarryWeight: 20,

      speed: 1,

      minimumSpeed: 0,
      maximumSpeed: 0,

      speedMultiplier: 0,

      /** player stats */
      walkingSkill: {
        xp: 0,
        level: 1,
        progress: 0,
        remainingXP: 100,
      },

      carryingSkill: {
        xp: 0,
        level: 1,
        progress: 0,
        remainingXP: 100,
      },

      /** player state */
      location: null,
      task: null,

      /** camera state */
      cameraLocation: null,

      /** scene state */
      scene: "start",
    }),
    {
      name: "game-state", // unique name
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
