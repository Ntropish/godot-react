import React from "react";
import { Menu, MenuItem } from "@mui/material";

import { GodotAction, Point3 } from "./schema";

interface ContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  onGoTo: (point: Point3) => void;
  onPickUp: (id: string) => void;
  actions: GodotAction[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  open,
  anchorPosition,
  onClose,
  onGoTo,
  onPickUp: handlePickUp,
  actions,
}) => {
  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? undefined}
      transitionDuration={0}
    >
      {actions.map((action, index) => {
        switch (action.action) {
          case "go_to_point":
            return (
              <MenuItem
                key={index}
                onClick={() => {
                  onGoTo(action.point);
                  onClose();
                }}
              >
                Go to {action.point.x.toFixed(2)}, {action.point.y.toFixed(2)},{" "}
                {action.point.z.toFixed(2)}
              </MenuItem>
            );
          case "pick_up":
            return (
              <MenuItem
                key={index}
                onClick={() => {
                  handlePickUp(action.id);
                  onClose();
                }}
              >
                Pick up {action.id}
              </MenuItem>
            );
          default:
            return null;
        }
      })}
    </Menu>
  );
};

export default ContextMenu;
