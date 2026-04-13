import { Box, Typography, Link } from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Scale() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)"}}>
       <Typography variant="body1" gutterBottom>
          California’s{" "} <Box component="span" sx={{ color: "#2f7d44", fontWeight: 700 }}> agricultural sector </Box>{" "}
          is the nation’s top producer and one of the most significant agricultural
          systems in the world.
        </Typography>

        <Typography sx={{ fontSize: "var(--source-size)", opacity:"60%"}}>
          GIS data source: 2024 Statewide Crop Mapping from{" "}
          <Link
            href="https://data.cnra.ca.gov/dataset/statewide-crop-mapping"
            target="_blank"
            rel="noopener"
            sx={{
              color: "inherit",
              opacity: 0.6,
              textDecoration: "underline",            
              textDecorationColor: "rgba(255,255,255,0.7)",
              "&:hover": {
                color: "inherit",
                opacity: 1,
                textDecoration: "underline",          // 👈 keep underline on hover
                textDecorationColor: "currentColor",
              },
              "&:visited": {
                color: "inherit",
              },
            }}
          >
            DWR
          </Link>
        </Typography>
      </Box>
    </StorySection>
  );
}

