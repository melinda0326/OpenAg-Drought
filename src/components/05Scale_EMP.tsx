import { Box, Typography } from "@mui/material";
import { centeredStatSectionSx, textShadowSx } from "./ui/storyStyles";

export default function Scale_EMP() {
  return (
    <Box sx={centeredStatSectionSx}>
      <Typography
        variant="h4"
        sx={{
          ...textShadowSx,
          maxWidth: "60vw",
        }}
        gutterBottom
      >
        Agricultural commodities serve as inputs for robust
        <br />
        food and beverage processing and distribution industries.
        <br />
        Altogether, farms, ranches, and food and beverage
        <br />
        industries support around
      </Typography>

      <Typography
        variant="stat"
        sx={{
          ...textShadowSx,
          maxWidth: "90vw",
        }}
      >
        600,000 jobs
      </Typography>
    </Box>
  );
}
