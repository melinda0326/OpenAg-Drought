import { Box, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Transition2() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)", mt: "var(--space-md)" }}>
        <Typography sx={{ fontSize: "var(--body-size)" }}>
          Together, these are pushing California into more intense, frequent, and persistent droughts, placing growing pressure on the state’s water supply and the systems that depend on it.
        </Typography>
      </Box>
    </StorySection>
  );
}