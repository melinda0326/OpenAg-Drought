import { Box, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Transition3() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)"}}>
        <Typography component="p" variant="body1">
          As both surface water and groundwater supplies become increasingly
          scarce, the total amount of water available for agriculture declines,
          placing growing pressure on farming and crop production.
          <br />
          <br />
          Over time, these constraints reshape agricultural activity, and the
          impacts of water shortages become increasingly visible.
        </Typography>
      </Box>
    </StorySection>
  );
}