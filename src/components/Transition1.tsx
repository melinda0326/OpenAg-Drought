import { Box, Typography} from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Transition1() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)", mt: "var(--space-md)", textAlign: "center" }}>
        <Typography variant="body1" gutterBottom>
          This agricultural system, however, depends on one essential resource:
        </Typography>

        <Typography
          component="h3"
          variant="h3"
          sx={{
            fontWeight: 600,
            textAlign: "center",
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