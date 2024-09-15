import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import { GameState } from "../schema";

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log(name, "has been retrieved");
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.log(name, "with value", value, "has been saved");
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    console.log(name, "has been deleted");
    await del(name);
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) =>
      ({
        rootBeers: 0,
        weiners: 0,
        burgers: 0,
        hunger: 10,
        thirst: 10,
        speed: 1,
        weight: 0,
        walkingSkill: 0,
        carryingSkill: 0,
        location: null,
        cameraLocation: null,
        scene: "start",
      } as GameState),
    {
      name: "game-state", // unique name
      storage: createJSONStorage(() => storage),
    }
  )
);
