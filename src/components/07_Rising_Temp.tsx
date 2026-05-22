import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Typography, Link } from "@mui/material";
import TemperatureLineChart from "../vis/Temperature_Line";

export default function TemperatureTrend() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const totalScroll = rect.height - window.innerHeight;
    if (totalScroll <= 0) return;
    const raw = -rect.top / totalScroll;
    setScrollProgress(Math.max(0, Math.min(1, raw)));
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={outerRef}
      style={{ height: "250vh", position: "relative" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ m: "var(--overlay-margin)" }}>
          <Box sx={{ width: "var(--overlay-width)" }}>
            <Typography component="p" variant="body1" gutterBottom>
              <Box component="span" sx={{ fontWeight: 700 }}>
                Rising temperatures
              </Box>{" "}
              across the state accelerate evaporation from soils, rivers, and
              reservoirs, causing water to disappear more quickly than before.
            </Typography>

            <Typography
              variant="caption"
              component="div"
              sx={{
                fontSize: "var(--source-size)",
                opacity: 0.6,
                mb: "var(--space-text-chart)",
              }}
            >
              California historical temperature data source from{" "}
              <Link
                href="https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/statewide/time-series/4/tavg/3/8/1895-2021?base_prd=true&firstbaseyear=1901&lastbaseyear=2000"
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
                    textDecoration: "underline",
                    textDecorationColor: "currentColor",
                  },
                  "&:visited": {
                    color: "inherit",
                  },
                }}
              >
                NOAA
              </Link>
            </Typography>
          </Box>

          <Box sx={{ width: "var(--chart-width)" }}>
            <TemperatureLineChart scrollProgress={scrollProgress} />
          </Box>
        </Box>

        {/* Scroll indicator — visible while animation is in progress */}
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
            opacity: scrollProgress >= 1 ? 0 : 0.6,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
            animation:
              scrollProgress === 0
                ? "scrollBounceTemp 2s ease-in-out infinite"
                : "none",
            "@keyframes scrollBounceTemp": {
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
            Scroll for rising temperature
          </Typography>
          <Box
            component="svg"
            viewBox="0 0 24 24"
            sx={{
              width: 24,
              height: 24,
              fill: "none",
              stroke: "rgba(255,255,255,0.7)",
              strokeWidth: 2,
            }}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </Box>
        </Box>
      </div>
    </div>
  );
}