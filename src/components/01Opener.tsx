import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import StorySection from "./ui/StorySection";

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
      <Box sx={{width: "var(--overlay-width)" }}>
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
          Simulate Drought Impacts
        </Box>
      </Box>

      {/* Scroll indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          opacity: hasScrolled ? 0 : 0.6,
          transition: "opacity 0.5s ease",
          pointerEvents: hasScrolled ? "none" : "auto",
          animation: "scrollBounce 2s ease-in-out infinite",
          "@keyframes scrollBounce": {
            "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
            "50%": { transform: "translateX(-50%) translateY(8px)" },
          },
        }}
      >
        <Typography
          sx={{
            fontSize: "var(--source-size)",
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
          }}
        >
          Scroll to explore
        </Typography>
        <Box
          component="svg"
          viewBox="0 0 24 24"
          sx={{ width: 24, height: 24, fill: "none", stroke: "rgba(255,255,255,0.7)", strokeWidth: 2 }}
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </Box>
      </Box>
    </StorySection>
  );
}