import * as z from "zod";

export const GameStateSchema = z.object({
  rootBeers: z.number(),
  weiners: z.number(),
  burgers: z.number(),
  hunger: z.number(),
  thirst: z.number(),
  speed: z.number(),
  weight: z.number(),
  walkingSkill: z.number(),
  carryingSkill: z.number(),
  updated_time: z.number().nullable(),
  location: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .nullable(),
  navigateToLocation: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .nullable(),
  navigateToObjectId: z.string().nullable(),
  cameraLocation: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .nullable(),
  scene: z.string().nullable(),
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

export type GotoAction = z.infer<typeof GotoActionSchema>;

const PickUpDescriptionSchema = z.object({
  type: z.union([
    z.literal("BURGER"),
    z.literal("WEINER"),
    z.literal("ROOT_BEER"),
  ]),
  quantity: z.number(),
});

export type PickUpDescription = z.infer<typeof PickUpDescriptionSchema>;

const PickUpActionSchema = z.object({
  type: z.literal("pick_up"),
  payload: PickUpDescriptionSchema,
});

export type PickUpAction = z.infer<typeof PickUpActionSchema>;

const EatBurgerMessageSchema = z.object({
  type: z.literal("eat_burger"),
  payload: z.number().optional(),
});

export type EatBurgerMessage = z.infer<typeof EatBurgerMessageSchema>;

const EatWeinerMessageSchema = z.object({
  type: z.literal("eat_weiner"),
  payload: z.number().optional(),
});

export type EatWeinerMessage = z.infer<typeof EatWeinerMessageSchema>;

const DrinkRootBeerMessageSchema = z.object({
  type: z.literal("drink_root_beer"),
  payload: z.number().optional(),
});

export type DrinkRootBeerMessage = z.infer<typeof DrinkRootBeerMessageSchema>;

const UpdateStateMessageSchema = z.object({
  type: z.literal("update_state"),
  payload: GameStateSchema,
});

export type UpdateStateMessage = z.infer<typeof UpdateStateMessageSchema>;

export const ActionMessageSchema = z.union([
  GotoActionSchema,
  PickUpActionSchema,
  EatBurgerMessageSchema,
  EatWeinerMessageSchema,
  DrinkRootBeerMessageSchema,
  UpdateStateMessageSchema,
]);

export type ActionMessage = z.infer<typeof ActionMessageSchema>;

const UpdateMessageSchema = z.object({
  type: z.literal("update"),
  payload: GameStateSchema,
});

const InitialStateMessageSchema = z.object({
  type: z.literal("initial_state"),
  payload: GameStateSchema,
});

export const WorkerMessageSchema = z.union([
  UpdateMessageSchema,
  InitialStateMessageSchema,
]);

export type WorkerMessage = z.infer<typeof WorkerMessageSchema>;

// {
//   "action": "pick_up",
//   "id": hover_controller.current_hover_target.get_instance_id()
// }

// {
// "action": "go_to",
// "point": {
//   "x": closest_point_on_navmesh.x,
//   "y": closest_point_on_navmesh.y,
//   "z": closest_point_on_navmesh.z
// }

// Define Godot context menu actions
const GodotPickupActionSchema = z.object({
  action: z.literal("pick_up"),
  id: z.string(),
});

const GodotGotoActionSchema = z.object({
  action: z.literal("go_to"),
  point: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
});

export const GodotActionSchema = z.union([
  GodotPickupActionSchema,
  GodotGotoActionSchema,
]);

export type GodotAction = z.infer<typeof GodotActionSchema>;
