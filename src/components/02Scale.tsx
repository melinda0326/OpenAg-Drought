import { Box, Typography, Link } from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Scale() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)", mt: "var(--space-md)" }}>
        <Typography sx={{ fontSize: "var(--body-size)" }}>
          California’s agricultural sector is the nation’s top producer and one of the most significant agricultural systems in the world.<br />
        </Typography>

        <Typography sx={{ fontSize: "1rem", opacity:"60%", mt: "--space-sm"}}>
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

