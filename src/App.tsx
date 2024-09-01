import { useRef, useEffect, useState } from "react";

import { Box } from "@mui/material";
import "./App.css";
import ContextMenu from "./ContextMenu";

import { Action } from "./schema";

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    anchorPosition: { top: number; left: number } | null;
  }>({
    open: false,
    anchorPosition: null,
  });

  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;

      if (event.data.type === "godot_oncontextmenu") {
        console.log("Context Menu", event.data);

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
            top: event.data.screen_point.y,
            left: event.data.screen_point.x,
          },
        });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  console.log("context position", contextMenu.anchorPosition);

  // example of sending message to iframe
  useEffect(() => {
    // sends message to iframe every 5 seconds
    const interval = setInterval(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      const message = {
        type: "godot_message",
        payload: {
          message: "Hello from React",
        },
      };

      const serializedMessage = JSON.stringify(message);

      console.log("Sending message to iframe", serializedMessage);

      iframeWindow.postMessage(serializedMessage, "*");
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
    console.log("Sending go_to message to iframe", serializedMessage);
    iframeWindow.postMessage(serializedMessage, "*");
  };

  // show iframe of /public/game_build/index.html
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        ref={iframeRef}
        style={{ border: "none" }}
        src="/game_build/index.html"
        title="game"
        width="100%"
        height="80%"
      ></iframe>

      <ContextMenu
        open={contextMenu.open}
        anchorPosition={contextMenu.anchorPosition}
        onClose={() => setContextMenu({ ...contextMenu, open: false })}
        onGoTo={handleGoTo}
        actions={actions}
      />
    </Box>
  );
}

export default App;
