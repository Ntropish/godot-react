import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "./gameStore";
import { ActionMessage, WorkerMessageSchema, WorkerMessage } from "./schema";

export function useGame(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const portRef = useRef<MessagePort | null>(null);
  const updatePlayerSpeed = useCallback(
    function updatePlayerSpeed(speed: number) {
      const iframe = iframeRef.current;
      if (iframe) {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          const speedMessage = {
            type: "godot_set_player_speed",
            payload: speed,
          };
          const serializedMessage = JSON.stringify(speedMessage);
          iframeWindow.postMessage(serializedMessage, "*");
        }
      }
    },
    [iframeRef]
  );

  // Function to handle messages from the worker
  const handleWorkerMessage = useCallback(
    function handleWorkerMessage(message: WorkerMessage) {
      console.log("got message", message);
      switch (message.type) {
        case "update":
        case "initial_state":
          console.log("got update", message.payload);
          // Update the Zustand store with the new game state
          useGameStore.setState(message.payload);

          // Update the player speed in the iframe
          updatePlayerSpeed(message.payload.speed);
          break;
        default:
          console.error("Unknown message type from worker");
      }
    },
    [updatePlayerSpeed]
  );
  useEffect(() => {
    const worker = new SharedWorker(
      new URL("./worker/gameWorker.ts", import.meta.url),
      {
        name: "gameWorker",
        type: "module",
      }
    );

    const port = worker.port;
    port.start();
    portRef.current = port;

    port.addEventListener("message", (event) => {
      try {
        const message = WorkerMessageSchema.parse(event.data);
        handleWorkerMessage(message);
      } catch (error) {
        console.error("Invalid message received from worker:", error);
      }
    });

    return () => {
      port.close();
    };
  }, [handleWorkerMessage]);

  const sendActionToWorker = (action: ActionMessage) => {
    const port = portRef.current;
    if (port) {
      port.postMessage(action);
    }
  };

  return { sendActionToWorker };
}
