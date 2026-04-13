import { Box, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Opener() {
  return (
    <StorySection>
      <Box sx={{ width: "min(80vw)" }}>
        <Typography component="h2" variant="h2" gutterBottom>
          How California Agriculture Responds with Drought
        </Typography>

        <Typography component="h4" variant="h4" gutterBottom
        >
          Understanding the Balance between Land and Water
        </Typography>

        <Typography variant="body1" gutterBottom>
          What happens if a farmland receives less and less water?
        </Typography>

        <Box
          component="button"
          onClick={() => {
            document.getElementById("open-exploration")?.scrollIntoView({ behavior: "smooth" });
          }}
          sx={{
            mt: 5,
            px: 3,
            py: 1.5,
            fontSize: "var(--body-size)",
            fontWeight: 600,
            color: "#f5f5f5",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(6px)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            borderRadius: "999px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            pointerEvents: "auto",
            "&:hover": {
              background: "rgba(255,255,255,0.25)",
              borderColor: "rgba(255,255,255,0.7)",
            },
          }}
        >
          Explore the Drought
        </Box>
      </Box>
    </StorySection>
  );
}