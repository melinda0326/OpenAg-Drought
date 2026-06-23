import { Box, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";

export default function AboutUs() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)", mt: "var(--space-md)" }}>
        <Typography component="h3" variant="h3" gutterBottom>
          About Us
        </Typography>

        <Typography variant="body1" gutterBottom>
          This data story is a collaborative effort between UC Davis and UC
          Merced.
        </Typography>

        <Typography variant="body1" sx={{ mt: 2 }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Contributors:
          </Box>{" "}
          Yinuo Tang, Yun-Hsin Kuo, Kwan-Liu Ma, Josué Medellín-Azuara, Alvar Escriva-Bou.
        </Typography>
      </Box>
    </StorySection>
  );
}
