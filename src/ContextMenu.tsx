import React from "react";
import { Menu, MenuItem } from "@mui/material";

import { Action } from "./schema";

interface ContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  onGoTo: (x: number, y: number, z: number) => void;
  onPickUp: (id: string) => void;
  actions: Action[];
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
          case "go_to":
            return (
              <MenuItem
                key={index}
                onClick={() => {
                  onGoTo(action.point.x, action.point.y, action.point.z);
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
