export type GotoAction = {
  action: "go_to";
  point: { x: number; y: number; z: number };
  screen_point: { x: number; y: number };
};

export type Action = GotoAction;
