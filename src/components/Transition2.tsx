import { Box, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";
import { storyContentSx } from "./ui/storyStyles";

export default function Transition2() {
  return (
    <StorySection>
      <Box sx={storyContentSx}>
        <Typography component="p" variant="body1">
          Together, these are pushing California into more intense, frequent, and
          persistent droughts, placing growing pressure on the state's water supply
          and the systems that depend on it.
        </Typography>
      </Box>
    </StorySection>
  );
}
