import { useRef, useEffect, useState } from "react";

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

import { GodotAction, GodotContextAction } from "./schema";
import { useGameStore } from "./store/gameStore";
import { useGame } from "./useGame";

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    anchorPosition: { top: number; left: number } | null;
  }>({
    open: false,
    anchorPosition: null,
  });

  const sendMessageToGodot = (message: GodotAction) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const serializedMessage = JSON.stringify(message);
    iframeWindow.postMessage(serializedMessage, "*");
  };

  const { goToPoint, consume, pickUp } = useGame({ sendMessageToGodot });

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

  const [actions, setActions] = useState<GodotContextAction[]>([]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;

      if (event.data.type === "godot_oncontextmenu") {
        setActions(event.data.actions);
        setContextMenu({
          open: true,
          anchorPosition: {
            top: event.data.screen_point.y / 1.5,
            left: event.data.screen_point.x / 1.5,
          },
        });
      } else if (event.data.type === "godot_onpickup") {
        const objectType = event.data.object_type;
        const quantity = event.data.quantity || 1;

        if (objectType === "ROOT_BEER") {
          useGameStore.setState((state) => ({
            root_beer: state.root_beer + quantity,
          }));
        } else if (objectType === "WEINER") {
          useGameStore.setState((state) => ({
            weiner: state.weiner + quantity,
          }));
        } else if (objectType === "BURGER") {
          useGameStore.setState((state) => ({
            burger: state.burger + quantity,
          }));
        }
      } else if (event.data.type === "godot_camera_position_update") {
        const { x, y, z } = event.data.position;

        useGameStore.setState({ cameraLocation: { x, y, z } });
      } else if (event.data.type === "godot_location_update") {
        const { x, y, z } = event.data.position;

        useGameStore.setState({ location: { x, y, z } });
      } else if (event.data.type === "godot_travel") {
        const distance = event.data.distance;

        // TODO: increase hunger and thirst based on distance traveled
        console.log("traveled", distance);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setActions, setContextMenu]);

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
          onClose={() => setContextMenu({ ...contextMenu, open: false })}
          onGoTo={goToPoint}
          onPickUp={pickUp}
          actions={actions}
        />
      </Box>

      <Stack sx={{ flex: "0 0 24rem" }}>
        <p>Drag the screen to move the camera</p>
        <p>Right click to act</p>
        <Divider />
        <Box sx={{ m: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 300 }}>
            Cookout Creek
          </Typography>
        </Box>
        <Divider />

        <Box
          sx={{
            m: 4,
          }}
        >
          <h2>Inventory</h2>
          <p>Weight: {weight}</p>

          <Stack direction="row" alignItems={"center"}>
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
              }}
            >
              {rootBeers}
            </Typography>
            <Button
              disabled={rootBeers <= 0 || thirst < 1}
              onClick={() => {
                consume("ROOT_BEER", 1);
              }}
            >
              Drink
            </Button>
          </Stack>
          <Stack direction="row">
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
              }}
            >
              {weiners}
            </Typography>
            <Button
              disabled={weiners <= 0 || hunger < 1}
              onClick={() => {
                consume("WEINER", 1);
              }}
            >
              Eat
            </Button>
          </Stack>
          <Stack direction="row">
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
              }}
            >
              {burgers}
            </Typography>
            <Button
              disabled={burgers <= 0 || hunger < 1}
              onClick={() => {
                consume("BURGER", 1);
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
          {/* <p>Thirst: {thirst}</p>
           */}
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
          {/* <p>Speed: {speed}</p> */}
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
          {/* <p>Walking Skill: {walkingSkill}</p> */}
          {/* <p>Carrying Skill: {carryingSkill}</p> */}
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
