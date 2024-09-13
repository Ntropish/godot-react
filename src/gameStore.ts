import { create } from "zustand";

import { persist } from "zustand/middleware";

import { GameState } from "./schema";

const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      rootBeers: 0,
      weiners: 0,
      burgers: 0,
      hunger: 10,
      thirst: 10,
      glucose: 10,
      speed: 1,
      weight: 0,
      glucoseIntolerance: 0,
      walkingSkill: 0,
      carryingSkill: 0,
      location: null,
      cameraLocation: null,
      scene: "start",
    }),
    {
      name: "game",
    }
  )
);

export { useGameStore };
