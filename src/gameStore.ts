import { create } from "zustand";

import { persist } from "zustand/middleware";

interface GameState {
  location: { x: number; y: number; z: number } | null;
  cameraLocation: { x: number; y: number; z: number } | null;
  scene: string;
  setScene: (scene: string) => void;
  setLocation: (location: { x: number; y: number; z: number }) => void;
  setCameraLocation: (location: { x: number; y: number; z: number }) => void;
}

const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      location: null,
      cameraLocation: null,
      scene: "start",
      setScene: (scene) => set({ scene }),
      setLocation: (location) => set({ location }),
      setCameraLocation: (location) => set({ cameraLocation: location }),
    }),
    {
      name: "game",
    }
  )
);

export { useGameStore };
