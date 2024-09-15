import * as z from "zod";

export const Point3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type Point3 = z.infer<typeof Point3Schema>;

export const ConsumableSchema = z.union([
  z.literal("root_beer"),
  z.literal("weiner"),
  z.literal("burger"),
]);

export type Consumable = z.infer<typeof ConsumableSchema>;

/** The character can engage in one task at a time. */

export const TaskGoToPointSchema = z.object({
  type: z.literal("go_to_point"),
  point: Point3Schema,
});

export type TaskGoToPoint = z.infer<typeof TaskGoToPointSchema>;

export const TaskGoToObjectSchema = z.object({
  type: z.literal("go_to_object"),
  object: z.string(),
});

export type TaskGoToObject = z.infer<typeof TaskGoToObjectSchema>;

export const TaskPickUpSchema = z.object({
  type: z.literal("pick_up"),
  object: z.string(),
});

export type TaskPickUp = z.infer<typeof TaskPickUpSchema>;

export const TaskConsumeSchema = z.object({
  type: z.literal("consume"),
  consumable: ConsumableSchema,
  amount: z.number(),
});

export type TaskConsume = z.infer<typeof TaskConsumeSchema>;

export const TaskSchema = z.union([
  TaskGoToPointSchema,
  TaskGoToObjectSchema,
  TaskPickUpSchema,
  TaskConsumeSchema,
]);

export type Task = z.infer<typeof TaskSchema>;

// Define Godot context menu actions
const GodotPickupActionSchema = z.object({
  action: z.literal("pick_up"),
  id: z.string(),
});

const GodotGotoActionSchema = z.object({
  action: z.literal("go_to_point"),
  point: Point3Schema,
});

const GodotSetPlayerSpeed = z.object({
  action: z.literal("set_player_speed"),
  speed: z.number(),
});

const GodotConsumeSchema = z.object({
  action: z.literal("consume_consumable"),
  consumable: ConsumableSchema,
  amount: z.number(),
  time_remaining: z.number(),
});

export const GodotActionSchema = z.union([
  GodotPickupActionSchema,
  GodotGotoActionSchema,
  GodotSetPlayerSpeed,
  GodotConsumeSchema,
]);

export type GodotAction = z.infer<typeof GodotActionSchema>;

// Define Godot context menu actions

export const GodotContextActionSchema = z.union([
  GodotPickupActionSchema,
  GodotGotoActionSchema,
]);

export type GodotContextAction = z.infer<typeof GodotContextActionSchema>;

/**
 *
 */

export const SkillSchema = z.object({
  xp: z.number(),
  level: z.number(),
  progress: z.number(),
  remainingXP: z.number(),
});

export type Skill = z.infer<typeof SkillSchema>;

export const GameStateSchema = z.object({
  root_beer: z.number(),
  weiner: z.number(),
  burger: z.number(),
  hunger: z.number(),
  thirst: z.number(),
  minimumSpeed: z.number(),
  maximumSpeed: z.number(),
  speedMultiplier: z.number(),
  speed: z.number(),
  weight: z.number(),
  maximumCarryWeight: z.number(),
  walkingSkill: SkillSchema,
  carryingSkill: SkillSchema,
  location: Point3Schema.nullable(),
  task: TaskSchema.nullable(),
  cameraLocation: Point3Schema.nullable(),
  scene: z.string().nullable(),
});

export type GameState = z.infer<typeof GameStateSchema>;
