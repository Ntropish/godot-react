import { useState, useRef, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import { Box, Container, Stack } from "@mui/material";
import "./App.css";

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  console.log(iframeRef.current?.contentWindow);

  // const handleMouseMove = (e: React.MouseEvent<HTMLIFrameElement>) => {
  //   const { clientX, clientY } = e;
  //   console.log(clientX, clientY);
  //   iframeRef.current?.contentWindow?.ongamehover({ clientX, clientY });
  // };

  const handleCursorMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // const { clientX, clientY } = e
    // console.log(e, clientX, clientY);

    const clientX = e.clientX || e.nativeEvent.detail.clientX;

    // iframeRef.current?.contentWindow?.ongamehover({ clientX, clientY });
  };

  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    const iframe = iframeRef.current;
    const contentWindow = iframe.contentWindow;

    if (!contentWindow) return;

    function handleMouseMove(event: MouseEvent) {
      const boundingClientRect = iframe.getBoundingClientRect();

      iframe.contentWindow?.ongamehover({
        clientX: event.clientX - boundingClientRect.left,
        clientY: event.clientY - boundingClientRect.top,
      });

      // iframe.dispatchEvent(evt);
    }

    contentWindow.addEventListener("mousemove", handleMouseMove);

    return () => {
      contentWindow.removeEventListener("mousemove", handleMouseMove);
    };
  });

  // show iframe of /public/game_build/index.html
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <iframe
        onMouseMove={handleCursorMove}
        ref={iframeRef}
        style={{ border: "none" }}
        src="/game_build/index.html"
        title="game"
        width="100%"
        height="80%"
      ></iframe>
    </Box>
  );
}

export default App;
