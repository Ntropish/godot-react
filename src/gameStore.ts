import { create } from "zustand";

import { persist } from "zustand/middleware";

interface GameState {
  rootBeers: number;
  weiners: number;
  burgers: number;
  hunger: number;
  thirst: number;
  glucose: number;
  speed: number;
  weight: number;
  walkingSkill: number;
  carryingSkill: number;
  location: { x: number; y: number; z: number } | null;
  cameraLocation: { x: number; y: number; z: number } | null;
  scene: string;
}

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
