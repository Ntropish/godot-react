import { Skill } from "./schema";
import { Box, Stack } from "@mui/material";

export function SkillTooltip({ skill }: { skill: Skill }) {
  return (
    <Stack>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        Level{" "}
        {Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(skill.level)}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        Progress:{" "}
        {Intl.NumberFormat("en-US", {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(skill.progress)}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        Remaining XP:{" "}
        {Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(skill.remainingXP)}
      </Box>
    </Stack>
  );
}
