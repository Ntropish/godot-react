import { useRef } from "react";

import {
  Box,
  Stack,
  Divider,
  Typography,
  Button,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import "./App.css";
import ContextMenu from "./ContextMenu";

import { useGameStore } from "./store/gameStore";
import { useGame } from "./useGame";
import theme from "./theme";
import { SkillTooltip } from "./SkillTooltip";
import { useDropModalStore } from "./store/dropModalStore";
import { DropModal } from "./DropModal";

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
  const speedMultiplier = useGameStore((state) => state.speedMultiplier);

  const minimumSpeed = useGameStore((state) => state.minimumSpeed);
  const maximumSpeed = useGameStore((state) => state.maximumSpeed);

  const weight = useGameStore((state) => state.weight);
  const maximumCarryWeight = useGameStore((state) => state.maximumCarryWeight);

  const hunger = useGameStore((state) => state.hunger);
  const thirst = useGameStore((state) => state.thirst);
  const walkingSkill = useGameStore((state) => state.walkingSkill);
  const carryingSkill = useGameStore((state) => state.carryingSkill);

  const cameraLocation = useGameStore((state) => state.cameraLocation);
  // This resets the camera height, otherwise it tends to drift
  if (cameraLocation) cameraLocation.y = 14;

  const playerLocation = useGameStore((state) => state.location);

  let weightColor = "primary" as "primary" | "secondary" | "error" | "warning";
  if (weight > maximumCarryWeight) {
    weightColor = "error";
  }
  if (weight / maximumCarryWeight > 0.2) {
    weightColor = "warning";
  }

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
          data-initial-player-speed={speed}
          data-initial-player-location={
            playerLocation ? JSON.stringify(playerLocation) : undefined
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

          <Stack direction="column">
            <Stack
              direction="row"
              alignItems={"baseline"}
              justifyContent={"space-between"}
            >
              <Typography>Weight</Typography>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  textAlign: "right",
                }}
              >
                {Intl.NumberFormat("en-IN", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                }).format(weight)}{" "}
                /{" "}
                {Intl.NumberFormat("en-IN", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                }).format(maximumCarryWeight)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min((weight / maximumCarryWeight) * 100, 100)}
              color={weightColor}
              sx={{ width: "100%" }}
            />
          </Stack>

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
            <IconButton
              onClick={() => {
                useDropModalStore.setState({
                  dropType: "root_beer",
                  dropAmount: 1,
                  dropAmountString: "1",
                });
              }}
            >
              <VerticalAlignBottomIcon />
            </IconButton>
          </Stack>
          <Stack direction="row" alignItems={"center"}>
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
            <IconButton
              onClick={() => {
                useDropModalStore.setState({
                  dropType: "weiner",
                  dropAmount: 1,
                  dropAmountString: "1",
                });
              }}
            >
              <VerticalAlignBottomIcon />
            </IconButton>
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
            <IconButton
              onClick={() => {
                useDropModalStore.setState({
                  dropType: "burger",
                  dropAmount: 1,
                  dropAmountString: "1",
                });
              }}
            >
              <VerticalAlignBottomIcon />
            </IconButton>
          </Stack>

          <h2>Stats</h2>
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
          <Tooltip title={speed}>
            <Stack direction="column">
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <Typography variant="caption">Speed</Typography>

                <Typography variant="caption">
                  {Intl.NumberFormat("en-IN", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }).format(speed)}{" "}
                  /{" "}
                  {Intl.NumberFormat("en-IN", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }).format(maximumSpeed)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={speedMultiplier * 100}
                sx={{ width: "100%" }}
              />
            </Stack>
          </Tooltip>

          <h2>Skills</h2>
          <Tooltip title={<SkillTooltip skill={walkingSkill} />}>
            <Stack direction="column">
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <Typography variant="caption">Walking</Typography>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {Intl.NumberFormat("en-IN", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    }).format(walkingSkill.remainingXP)}
                  </Typography>
                </Box>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={walkingSkill.progress * 100}
                sx={{ width: "100%" }}
              ></LinearProgress>
            </Stack>
          </Tooltip>

          <Tooltip title={<SkillTooltip skill={carryingSkill} />}>
            <Stack direction="column">
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <Typography variant="caption">Carrying</Typography>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {Intl.NumberFormat("en-IN", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    }).format(carryingSkill.remainingXP)}
                  </Typography>
                </Box>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={carryingSkill.progress * 100}
                sx={{ width: "100%" }}
              ></LinearProgress>
            </Stack>
          </Tooltip>
        </Box>
      </Stack>
      <DropModal />
    </Stack>
  );
}

export default App;
