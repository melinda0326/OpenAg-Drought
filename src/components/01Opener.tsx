import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";

const openerContentSx = {
  width: "min(94%, 1180px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
} as const;

const scrollCueSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 1.4,
  transition: "opacity 0.5s ease",
  animation: "scrollCueFloat 2s ease-in-out infinite",
  "@keyframes scrollCueFloat": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(6px)" },
  },
} as const;

export default function Opener() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <StorySection>
      <Box
        sx={openerContentSx}
      >
        <Typography component="h1" variant="h1" gutterBottom>
          How California Agriculture Responds to Drought
        </Typography>

        <Typography
          component="h3"
          variant="h3"
          gutterBottom
        >
          Understanding the balance between land and water
        </Typography>

        <Stack direction='column' spacing={0} sx={{ my: 1}}>
          <Typography variant='body1'>
            What happens when farmland receives less and less water?
          </Typography>
          <Typography variant='body1'>
            Follow this story to see how drought reshapes land, water, revenue, and jobs across California agriculture.
          </Typography>
          <Typography variant='body1'>
            Or jump straight to explore different levels of drought impacts on California's agricultural landscape.
          </Typography>
        </Stack>

        <Box
          sx={{
            mt: 3,
            pointerEvents: "auto",
          }}
        >
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => {
            document.getElementById("open-exploration")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Jump to Drought Impact Exploration
        </Button>
        </Box>

        <Box
          sx={{
            ...scrollCueSx,
            mt: 3.5,
            opacity: hasScrolled ? 0 : 1,
            pointerEvents: hasScrolled ? "none" : "auto",
          }}
        >
          <Typography variant="source" sx={{ color: "inherit", fontWeight: 700 }}>
            Scroll to explore
          </Typography>
          <Box
            component="svg"
            viewBox="0 0 24 24"
            sx={{
              width: 20,
              height: 20,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2.2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            <path d="m7 6 5 5 5-5" />
            <path d="m7 13 5 5 5-5" />
          </Box>
        </Box>

      </Box>
    </StorySection>
  );
}
