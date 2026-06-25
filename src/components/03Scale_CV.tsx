import { Box, Typography } from "@mui/material";
import { centeredStatSectionSx, textShadowSx } from "./ui/storyStyles";

export default function Scale_CV() {
  return (
    <Box sx={{ ...centeredStatSectionSx, pointerEvents: "none" }}>
      <Box
        sx={{
          width: "100%",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="stat"
          sx={{
            ...textShadowSx,
            mx: "auto",
            maxWidth: "min(90%, 1200px)",
          }}
          gutterBottom
        >
          8.5 million irrigated land
        </Typography>

        <Typography
          variant="h4"
          sx={{
            ...textShadowSx,
            maxWidth: "min(90%, 760px)",
          }}
        >
          used for agriculture in California,
          <br />
          and nearly 9.3&nbsp;million when we include
          <br />
          multi-cropping in a year.
        </Typography>
      </Box>
    </Box>
  );
}
