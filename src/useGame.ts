import { useEffect, useRef } from "react";
import { useGameStore } from "./gameStore";
import { useStore } from "zustand";

export function useGame(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const portRef = useRef<MessagePort | null>(null);

  useEffect(() => {
    const worker = new SharedWorker(
      new URL("./gameWorker.js", import.meta.url)
    );
    const port = worker.port;
    port.start();
    portRef.current = port;

    port.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "update" || type === "initial_state") {
        // Update the store with the new game state
        useGameStore.setState(payload);
      }
    };

    return () => {
      port.close();
    };
  }, []);

  const playerSpeed = useStore(useGameStore, (state) => state.speed);

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
  }, [playerSpeed, iframeRef]);
}
