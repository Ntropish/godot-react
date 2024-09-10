import { create } from "zustand";

import { persist } from "zustand/middleware";

interface InventoryState {
  rootBeers: number;
  weiners: number;
  burgers: number;
  addToInventory: (item: Item) => void;
}

type Item = {
  name: "ROOT_BEER" | "WEINER" | "BURGER";
  quantity: number;
};

const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      rootBeers: 0,
      weiners: 0,
      burgers: 0,
      addToInventory: (item) => {
        if (item.name === "ROOT_BEER") {
          set((state) => ({ rootBeers: state.rootBeers + item.quantity }));
        }
        if (item.name === "WEINER") {
          set((state) => ({ weiners: state.weiners + item.quantity }));
        }
        if (item.name === "BURGER") {
          set((state) => ({ burgers: state.burgers + item.quantity }));
        }
      },
    }),
    {
      name: "inventory",
    }
  )
);

export { useInventoryStore };
