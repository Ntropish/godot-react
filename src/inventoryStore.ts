import { create } from "zustand";

import { persist } from "zustand/middleware";

interface InventoryState {
  rootBeers: number;
  addToInventory: (item: Item) => void;
}

type Item = {
  name: "ROOT_BEER";
  quantity: number;
};

const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      rootBeers: 0,
      addToInventory: (item) => {
        if (item.name === "ROOT_BEER") {
          set((state) => ({ rootBeers: state.rootBeers + item.quantity }));
        }
      },
    }),
    {
      name: "inventory",
    }
  )
);

export { useInventoryStore };
