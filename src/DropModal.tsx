import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useDropModalStore } from "./store/dropModalStore";
import { useGameStore } from "./store/gameStore";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import NumberInput from "./NumberInput";
import { useGame } from "./useGame";

const titles = {
  root_beer: "Root Beer",
  weiner: "Weiner",
  burger: "Burger",
};

export function DropModal() {
  const dropType = useDropModalStore((state) => state.dropType);
  const dropAmount = useDropModalStore((state) => state.dropAmount);
  const dropAmountString = useDropModalStore((state) => state.dropAmountString);

  const dropAmountIsNumber =
    typeof dropAmount === "number" && !isNaN(dropAmount);

  const handleClose = () => {
    useDropModalStore.setState({ dropType: null });
  };

  const handleDrop = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dropType) return false;
    useDropModalStore.setState({ dropType: null });
    useGameStore.setState((state) => ({
      ...state,
      [dropType]: state[dropType] - Math.max(0, dropAmount || 0),
    }));

    return false;
  };

  return (
    <Dialog
      open={!!dropType}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) =>
          handleDrop(event),
      }}
    >
      <DialogTitle>Drop {dropType ? titles[dropType] : ""}</DialogTitle>
      <DialogContent>
        <TextField
          sx={{ mt: 2 }}
          value={dropAmountString}
          onChange={(e) => {
            const value = e.target.value;
            useDropModalStore.setState({ dropAmountString: value });

            const newNumber = parseFloat(value);

            if (isNaN(newNumber)) {
              useDropModalStore.setState({ dropAmount: null });
              return;
            } else {
              useDropModalStore.setState({ dropAmount: newNumber });
            }
          }}
          label="Amount"
          autoFocus
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button type="submit" disabled={!dropAmountIsNumber}>
          Drop
        </Button>
      </DialogActions>
    </Dialog>
  );
}
