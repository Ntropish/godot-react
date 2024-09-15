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

import { GodotContextAction } from "./schema";
import { useInventoryStore } from "./inventoryStore";
import { useGameStore } from "./gameStore";
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

  const { sendActionToWorker } = useGame(iframeRef);

  const rootBeers = useGameStore((state) => state.rootBeers);
  const weiners = useGameStore((state) => state.weiners);
  const burgers = useGameStore((state) => state.burgers);

  const speed = useGameStore((state) => state.speed);
  const weight = useGameStore((state) => state.weight);

  const hunger = useGameStore((state) => state.hunger);
  const thirst = useGameStore((state) => state.thirst);
  const walkingSkill = useGameStore((state) => state.walkingSkill);
  const carryingSkill = useGameStore((state) => state.carryingSkill);

  const addToInventory = useInventoryStore((state) => state.addToInventory);

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
          // useGameStore.setState((state) => ({
          //   rootBeers: state.rootBeers + quantity,
          // }));
          sendActionToWorker({
            type: "pick_up",
            payload: {
              type: "ROOT_BEER",
              quantity,
            },
          });
        } else if (objectType === "WEINER") {
          // useGameStore.setState((state) => ({
          //   weiners: state.weiners + quantity,
          // }));

          sendActionToWorker({
            type: "pick_up",
            payload: {
              type: "WEINER",
              quantity,
            },
          });
        } else if (objectType === "BURGER") {
          // useGameStore.setState((state) => ({
          //   burgers: state.burgers + quantity,
          // }));

          sendActionToWorker({
            type: "pick_up",
            payload: {
              type: "BURGER",
              quantity,
            },
          });
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
  }, [setActions, setContextMenu, addToInventory, sendActionToWorker]);

  const handleGoTo = (x: number, y: number, z: number) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const message = {
      type: "godot_go_to",
      payload: { x, y, z },
    };

    const serializedMessage = JSON.stringify(message);
    iframeWindow.postMessage(serializedMessage, "*");
  };

  const handlePickUp = (id: string) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const message = {
      type: "godot_pick_up",
      payload: id,
    };

    const serializedMessage = JSON.stringify(message);
    iframeWindow.postMessage(serializedMessage, "*");
  };

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
          onGoTo={handleGoTo}
          onPickUp={handlePickUp}
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
              disabled={rootBeers < 1 || thirst < 10}
              onClick={() => {
                // useGameStore.setState((state) => ({
                //   rootBeers: state.rootBeers - 1,
                //   thirst: state.thirst - 10,
                // }));

                sendActionToWorker({
                  type: "drink_root_beer",
                  payload: 1,
                });
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
              disabled={weiners < 1 || hunger < 10}
              onClick={() => {
                // useGameStore.setState((state) => ({
                //   weiners: state.weiners - 1,
                //   hunger: state.hunger - 10,
                // }));

                sendActionToWorker({
                  type: "eat_weiner",
                  payload: 1,
                });
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
              disabled={burgers < 1 || hunger < 20}
              onClick={() => {
                // useGameStore.setState((state) => ({
                //   burgers: state.burgers - 1,
                //   hunger: state.hunger - 20,
                // }));
                sendActionToWorker({
                  type: "eat_burger",
                  payload: 1,
                });
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
