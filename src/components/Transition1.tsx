import { Box, Typography, Link } from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Transition1() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)", mt: "var(--space-md)" }}>
        <Typography sx={{ fontSize: "var(--body-size)" }}>
          This agricultural system, however, depends on one essential resource: <br />
          Water
        </Typography>

      </Box>
    </StorySection>
  );
}