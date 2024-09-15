import { z } from "zod";
import { create } from "zustand";

export const DropModalStoreSchema = z.object({
  dropType: z
    .union([z.literal("root_beer"), z.literal("weiner"), z.literal("burger")])
    .nullable(),
  dropAmount: z.number().nullable(),
  dropAmountString: z.string(),
});

type DropModalStore = z.infer<typeof DropModalStoreSchema>;

export const useDropModalStore = create<DropModalStore>()(() => ({
  dropType: null,
  dropAmountString: "",
  dropAmount: 0,
}));
