export type GotoAction = {
  action: "go_to";
  point: { x: number; y: number; z: number };
};

export type PickUpAction = {
  action: "pick_up";
  id: string;
};

export type Action = GotoAction | PickUpAction;
