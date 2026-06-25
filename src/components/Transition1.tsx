import { Box, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";
import { storyContentSx } from "./ui/storyStyles";

export default function Transition1() {
  return (
    <StorySection>
      <Box
        sx={{
          ...storyContentSx,
          alignItems: "center",
          mt: "var(--space-md)",
          textAlign: "center",
        }}
      >
        <Typography variant="body1" gutterBottom>
          This agricultural system, however, depends on one essential resource:
        </Typography>

        <Typography
          component="h3"
          variant="h3"
          sx={{
            fontWeight: 600,
            color: "#4287f5",
            fontStyle: "italic",
          }}
        >
          Water
        </Typography>
      </Box>
    </StorySection>
  );
}
