import { Box, Typography } from "@mui/material";
import { centeredStatSectionSx, textShadowSx } from "./ui/storyStyles";

export default function Scale_RV() {
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
        Statewide, farms and ranches produce more than
        <br />
        400 agricultural commodities and generate over
      </Typography>

      <Typography
        variant="stat"
        sx={{
          ...textShadowSx,
          maxWidth: "90vw",
        }}
      >
        $60 billion revenue
      </Typography>
    </Box>
  );
}
