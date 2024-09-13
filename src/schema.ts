import * as z from "zod";

// export type GotoAction = {
//   type: "go_to";
//   payload: { x: number; y: number; z: number };
// };

// export type PickUpAction = {
//   type: "pick_up";
//   // the id of the item to pick up
//   payload: string;
// };

export const GameStateSchema = z.object({
  rootBeers: z.number(),
  weiners: z.number(),
  burgers: z.number(),
  hunger: z.number(),
  thirst: z.number(),
  glucose: z.number(),
  speed: z.number(),
  weight: z.number(),
  glucoseIntolerance: z.number(),
  walkingSkill: z.number(),
  carryingSkill: z.number(),
  location: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .nullable(),
  cameraLocation: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .nullable(),
  scene: z.string(),
});

export type GameState = z.infer<typeof GameStateSchema>;

const GotoActionSchema = z.object({
  type: z.literal("go_to"),
  payload: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
});

const PickUpActionSchema = z.object({
  type: z.literal("pick_up"),
  payload: z.string(),
});

const EatBurgerMessageSchema = z.object({
  type: z.literal("eatBurger"),
  payload: z.undefined().optional(),
});

const EatWeinerMessageSchema = z.object({
  type: z.literal("eatWeiner"),
  payload: z.undefined().optional(),
});

const DrinkRootBeerMessageSchema = z.object({
  type: z.literal("drinkRootBeer"),
  payload: z.undefined().optional(),
});

const UpdateStateMessageSchema = z.object({
  type: z.literal("update_state"),
  payload: GameStateSchema,
});

export const ActionMessageSchema = z.union([
  GotoActionSchema,
  PickUpActionSchema,
  EatBurgerMessageSchema,
  EatWeinerMessageSchema,
  DrinkRootBeerMessageSchema,
  UpdateStateMessageSchema,
]);

export type ActionMessage = z.infer<typeof ActionMessageSchema>;
