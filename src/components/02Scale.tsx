import { Box, Link, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";
import { sourceLinkSx, storyContentSx } from "./ui/storyStyles";

export default function Scale() {
  return (
    <StorySection>
      <Box sx={storyContentSx}>
        <Typography variant="body1" gutterBottom>
          California's{" "}
          <Box component="span" sx={{ color: "#78d991", fontWeight: 700 }}>
            agricultural sector
          </Box>{" "}
          is the nation's top producer and one of the most significant
          agricultural systems in the world.
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontSize: "var(--source-size)",
            opacity: 0.6,
          }}
        >
          GIS data source: 2024 Statewide Crop Mapping from{" "}
          <Link
            href="https://data.cnra.ca.gov/dataset/statewide-crop-mapping"
            target="_blank"
            rel="noopener"
            sx={sourceLinkSx}
          >
            DWR
          </Link>
        </Typography>
      </Box>
    </StorySection>
  );
}
