import { useRef, useState } from "react";

import {
  Box,
  Stack,
  Divider,
  Typography,
  Button,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import "./App.css";
import ContextMenu from "./ContextMenu";

import { useGameStore } from "./store/gameStore";
import { useGame } from "./useGame";
import theme from "./theme";

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { goToPoint, consume, pickUp, actions, contextMenu, closeContextMenu } =
    useGame({
      iframeRef,
    });

  const rootBeers = useGameStore((state) => state.root_beer);
  const weiners = useGameStore((state) => state.weiner);
  const burgers = useGameStore((state) => state.burger);

  const speed = useGameStore((state) => state.speed);
  const weight = useGameStore((state) => state.weight);

  const hunger = useGameStore((state) => state.hunger);
  const thirst = useGameStore((state) => state.thirst);
  const walkingSkill = useGameStore((state) => state.walkingSkill);
  const carryingSkill = useGameStore((state) => state.carryingSkill);

  const cameraLocation = useGameStore((state) => state.cameraLocation);

  const gameUrl = "/godot-react/game_build/index.html";

  return (
    <Stack
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
      direction="row"
      divider={
        <Divider
          orientation="vertical"
          flexItem
          sx={{ backgroundColor: "rgba(0, 0, 0, 0.12)" }}
        />
      }
    >
      <Box
        onContextMenu={(e) => e.preventDefault()}
        sx={{
          flexGrow: 1,
        }}
      >
        <iframe
          ref={iframeRef}
          style={{ border: "none" }}
          // Have to add the base path here
          data-initial-camera-position={
            cameraLocation ? JSON.stringify(cameraLocation) : undefined
          }
          src={gameUrl}
          title="game"
          width="100%"
          height="100%"
        ></iframe>

        <ContextMenu
          open={contextMenu.open}
          anchorPosition={contextMenu.anchorPosition}
          onClose={closeContextMenu}
          onGoTo={goToPoint}
          onPickUp={pickUp}
          actions={actions}
        />
      </Box>

      <Stack sx={{ flex: "0 0 24rem" }}>
        <Box sx={{ m: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 300 }}>
            Cookout Creek
          </Typography>
        </Box>
        <Divider />
        <Box
          sx={{
            fontSize: "0.8rem",
            m: 2,
            color: theme.palette.text.secondary,
          }}
        >
          <p>Drag the screen to move the camera</p>
          <p>Right click to act</p>
        </Box>
        <Divider />

        <Box
          sx={{
            m: 4,
          }}
        >
          <h2>Inventory</h2>
          <p>
            Weight:&nbsp;
            {Intl.NumberFormat("en-IN", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }).format(weight)}
          </p>

          <Stack direction="row" alignItems={"baseline"}>
            <Typography
              sx={{
                flexBasis: "10rem",
              }}
            >
              Root Beers
            </Typography>
            <Typography
              sx={{
                flexBasis: "5rem",
                fontFamily: "monospace",
                textAlign: "right",
              }}
            >
              {Intl.NumberFormat("en-IN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(rootBeers)}
            </Typography>
            <Button
              disabled={rootBeers <= 0 || thirst < 1}
              onClick={() => {
                consume("root_beer", 1);
              }}
            >
              Drink
            </Button>
          </Stack>
          <Stack direction="row" alignItems={"baseline"}>
            <Typography
              sx={{
                flexBasis: "10rem",
              }}
            >
              Weiners
            </Typography>
            <Typography
              sx={{
                flexBasis: "5rem",
                fontFamily: "monospace",
                textAlign: "right",
              }}
            >
              {Intl.NumberFormat("en-IN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(weiners)}
            </Typography>
            <Button
              disabled={weiners <= 0 || hunger < 1}
              onClick={() => {
                consume("weiner", 1);
              }}
            >
              Eat
            </Button>
          </Stack>
          <Stack direction="row" alignItems={"baseline"}>
            <Typography
              sx={{
                flexBasis: "10rem",
              }}
            >
              Burgers
            </Typography>
            <Typography
              sx={{
                flexBasis: "5rem",
                fontFamily: "monospace",
                textAlign: "right",
              }}
            >
              {Intl.NumberFormat("en-IN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(burgers)}
            </Typography>
            <Button
              disabled={burgers <= 0 || hunger < 1}
              onClick={() => {
                consume("burger", 1);
              }}
            >
              Eat
            </Button>
          </Stack>

          <h2>Stats</h2>
          {/* <p>Hunger: {hunger}</p> */}
          <Stack direction="row" alignItems={"center"}>
            <Typography variant="caption" flexBasis="10rem">
              Hunger
            </Typography>

            <LinearProgress
              variant="determinate"
              value={hunger}
              sx={{ width: "100%" }}
            />
          </Stack>

          <Stack direction="row" alignItems={"center"}>
            <Typography variant="caption" flexBasis="10rem">
              Thirst
            </Typography>

            <LinearProgress
              variant="determinate"
              value={thirst}
              sx={{ width: "100%" }}
            />
          </Stack>
          <Stack direction="row" alignItems={"center"}>
            <Typography variant="caption" flexBasis="10rem">
              Speed
            </Typography>

            <Tooltip title={speed}>
              <LinearProgress
                variant="determinate"
                value={(speed * 100) / 10}
                sx={{ width: "100%" }}
              />
            </Tooltip>
          </Stack>

          <h2>Skills</h2>
          <Stack direction="row" alignItems={"center"} sx={{}}>
            <Typography variant="caption" sx={{ flexBasis: "10rem" }}>
              Walking
            </Typography>
            <LinearProgress
              variant="determinate"
              value={walkingSkill}
              sx={{ width: "100%" }}
            ></LinearProgress>
          </Stack>

          <Stack direction="row" alignItems={"center"}>
            <Typography variant="caption" sx={{ flexBasis: "10rem" }}>
              Carrying
            </Typography>
            <LinearProgress
              variant="determinate"
              value={carryingSkill}
              sx={{ width: "100%" }}
            ></LinearProgress>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}

export default App;
