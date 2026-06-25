import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import * as d3 from "d3";
import PrecipitationBarChart, {
  type PrecipitationRow,
} from "../vis/PrecipitationBar";
import {
  scrollCueSx,
  sourceLinkSx,
  stickyScrollSectionSx,
  stickyViewportSx,
  storyChartSx,
  storyContentSx,
} from "./ui/storyStyles";

type RawRow = Record<string, string>;

export default function PrecipitationAnomalyChart() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<PrecipitationRow[]>([]);
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

  useEffect(() => {
    d3.text("/data/precipitation.csv").then((text) => {
      const cleanedText = text.split("\n").slice(2).join("\n");
      const parsed = d3.csvParse(cleanedText);

      const cleaned = parsed
        .map((r: RawRow) => {
          const rawDate = Number(r.Date);
          const value = Number(r.Value);

          if (!Number.isFinite(rawDate) || !Number.isFinite(value)) return null;

          const year = Math.floor(rawDate / 100);
          return { rawDate, year, value };
        })
        .filter(
          (d): d is { rawDate: number; year: number; value: number } =>
            d !== null
        );

      if (cleaned.length === 0) return;

      const avg =
        cleaned.reduce((sum, d) => sum + d.value, 0) / cleaned.length;

      setRows(
        cleaned.map((d) => ({
          ...d,
          anomaly: d.value - avg,
        }))
      );
    });
  }, []);

  if (rows.length === 0) {
    return (
      <Typography variant="body1" sx={{ color: "white" }}>
        Loading...
      </Typography>
    );
  }

  return (
    <Box ref={outerRef} sx={stickyScrollSectionSx}>
      <Box sx={stickyViewportSx}>
        <Box sx={{ m: "var(--overlay-margin)" }}>
          <Box sx={storyContentSx}>
            <Typography component="p" variant="body1" gutterBottom>
              At the same time,{" "}
              <Box component="span" sx={{ fontWeight: 700 }}>
                precipitation patterns
              </Box>{" "}
              are becoming increasingly{" "}
              <Box component="span" sx={{ fontWeight: 700 }}>
                volatile and unpredictable
              </Box>
              , with rainfall arriving less consistently and often in shorter,
              more intense bursts.
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
              California historical precipitation data source from{" "}
              <Link
                href="https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/statewide/time-series/4/tavg/3/8/1895-2021?base_prd=true&firstbaseyear=1901&lastbaseyear=2000"
                target="_blank"
                rel="noopener"
                sx={sourceLinkSx}
              >
                NOAA
              </Link>
            </Typography>
          </Box>

          <Box sx={storyChartSx}>
            <PrecipitationBarChart
              rows={rows}
              svgWidth="var(--chart-width)"
              scrollProgress={scrollProgress}
            />
          </Box>
        </Box>

        <Box
          sx={{
            ...scrollCueSx,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: scrollProgress >= 1 ? 0 : 0.6,
            animation:
              scrollProgress < 1
                ? "scrollBouncePrecip 2s ease-in-out infinite"
                : "none",
            "@keyframes scrollBouncePrecip": {
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
            Scroll for unstable precipitation pattern
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
      </Box>
    </Box>
  );
}
