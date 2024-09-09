import { useRef, useEffect, useState } from "react";

import { Box, Stack, Slider, InputLabel, Divider } from "@mui/material";
import "./App.css";
import ContextMenu from "./ContextMenu";

import { Action } from "./schema";
import { useInventoryStore } from "./inventoryStore";
import { useGameStore } from "./gameStore";

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    anchorPosition: { top: number; left: number } | null;
  }>({
    open: false,
    anchorPosition: null,
  });

  const rootBeers = useInventoryStore((state) => state.rootBeers);
  const addToInventory = useInventoryStore((state) => state.addToInventory);

  const cameraLocation = useGameStore((state) => state.cameraLocation);

  const [actions, setActions] = useState<Action[]>([]);

  const [playerSpeed, setPlayerSpeed] = useState(5);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const message = {
      type: "godot_set_player_speed",
      payload: playerSpeed,
    };

    const serializedMessage = JSON.stringify(message);

    iframeWindow.postMessage(serializedMessage, "*");
  }, [playerSpeed]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;

      if (event.data.type === "godot_oncontextmenu") {
        // {
        //     "screen_point": {
        //         "x": 0.72882866859436,
        //         "y": 0.287664890289307
        //     },
        //     "actions": [
        //         {
        //             "action": "go_to",
        //             "point": {
        //                 "x": 0.72882866859436,
        //                 "y": 0.287664890289307,
        //                 "z": 4.71788883209229
        //             },
        //         }
        //     ]
        // }

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
        if (objectType === "ROOT_BEER") {
          addToInventory({
            name: "ROOT_BEER",
            quantity: 1,
          });
        }
      } else if (event.data.type === "godot_camera_position_update") {
        const { x, y, z } = event.data.position;

        useGameStore.setState({ cameraLocation: { x, y, z } });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setActions, setContextMenu, addToInventory]);

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
        <Box sx={{ m: 2 }}>
          <h1>Godot React Integration</h1>

          <p>
            Drag the screen to move the camera. Right click to see the context
            menu.
          </p>
        </Box>

        <Box
          sx={{
            m: 4,
          }}
        >
          <InputLabel id="player-speed">Player Speed</InputLabel>
          <Slider
            aria-label="Player Speed"
            value={playerSpeed}
            onChange={(_, value) => setPlayerSpeed(value as number)}
            min={1}
            max={10}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box
          sx={{
            m: 4,
          }}
        >
          <h2>Inventory</h2>
          <p>Root Beers: {rootBeers}</p>
        </Box>
      </Stack>
    </Stack>
  );
}

export default App;
