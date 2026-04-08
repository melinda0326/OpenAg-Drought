import { Box, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Transition3() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)", mt: "var(--space-md)" }}>
        <Typography sx={{ fontSize: "var(--body-size)" }}>
            As both surface water and groundwater supplies become increasingly scarce, the total amount of water available for agriculture declines, placing growing pressure on farming and crop production.  <br />

            Over time, these constraints reshape agricultural activity, and the impacts of water shortages become increasingly visible.        
            </Typography>
      </Box>
    </StorySection>
  );
}