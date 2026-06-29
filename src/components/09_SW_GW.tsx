import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import DualAxisAreaChart, {
  type DualAxisDatum,
  type ViewMode,
} from "../vis/DualAxis_SWGW";
import {
  scrollCueSx,
  stickyScrollSectionSx,
  stickyViewportSx,
  storyChartSx,
  storyContentSx,
} from "./ui/storyStyles";

type RowSW = {
  WY: string;
  water_use_taf: string;
};

type RowGW = {
  Year: string;
  "Cummulative change in groundwater storage": string;
};

type ChartRow = {
  year: number;
  surfaceWater: number | null;
  groundwater: number | null;
};

type SurfaceGroundwaterChartProps = {
  surfaceWaterJson?: string;
  groundwaterJson?: string;
  height?: number;
};

const COLOR_SW = "#1B9AAA";
const COLOR_GW = "#3d6fc4";

function formatTAF(v: number) {
  return Number.isFinite(v) ? `${Math.round(v / 1000)}k` : "";
}

export default function SurfaceGroundwaterChart({
  surfaceWaterJson = "/data/surface_supplies_ag_annual_sum.json",
  groundwaterJson = "/data/change_in_gw.json",
  height = 400,
}: SurfaceGroundwaterChartProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swDomain, setSwDomain] = useState<[number, number]>([0, 0]);
  const [gwDomain, setGwDomain] = useState<[number, number]>([0, 0]);
  const [viewMode, setViewMode] = useState<ViewMode>("both");
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
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [swRes, gwRes] = await Promise.all([
          fetch(surfaceWaterJson),
          fetch(groundwaterJson),
        ]);

        const [swRows, gwRows] = await Promise.all([
          swRes.json() as Promise<any[]>,
          gwRes.json() as Promise<any[]>,
        ]);

        const cleanSW = swRows
          .map((d) => ({
            year: Number(d.WY),
            value: Number(d.water_use_taf),
          }))
          .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.value));

        const cleanGW = gwRows
          .map((d) => ({
            year: Number(d.Year),
            value: Number(d["Cummulative change in groundwater storage"]),
          }))
          .filter(
            (d) =>
              Number.isFinite(d.year) &&
              Number.isFinite(d.value) &&
              d.year >= 2002
          );

        const yearMap = new Map<number, ChartRow>();

        cleanSW.forEach((d) => {
          yearMap.set(d.year, {
            year: d.year,
            surfaceWater: d.value,
            groundwater: yearMap.get(d.year)?.groundwater ?? null,
          });
        });

        cleanGW.forEach((d) => {
          const existing = yearMap.get(d.year);
          yearMap.set(d.year, {
            year: d.year,
            surfaceWater: existing?.surfaceWater ?? null,
            groundwater: d.value,
          });
        });

        if (cancelled) return;

        setData(Array.from(yearMap.values()).sort((a, b) => a.year - b.year));
        setSwDomain([
          d3.min(cleanSW, (d) => d.value) ?? 0,
          d3.max(cleanSW, (d) => d.value) ?? 0,
        ]);
        setGwDomain([
          d3.min(cleanGW, (d) => d.value) ?? 0,
          d3.max(cleanGW, (d) => d.value) ?? 0,
        ]);
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load chart data.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [surfaceWaterJson, groundwaterJson]);

  const chartData: DualAxisDatum[] = useMemo(
    () =>
      data.map((d) => ({
        year: d.year,
        leftValue: d.surfaceWater,
        rightValue: d.groundwater,
      })),
    [data]
  );

  if (loading) {
    return (
      <Typography variant="body1" sx={{ color: "white" }}>
        Loading chart...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="body1" sx={{ color: "white" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box ref={outerRef} sx={stickyScrollSectionSx}>
      <Box sx={stickyViewportSx}>
        <Box sx={{ margin: "var(--overlay-margin)" }}>
          <Box sx={storyContentSx}>
            <Typography component="h3" variant="h3" gutterBottom>
              What Happens During a California Drought
            </Typography>

            <Typography component="p" variant="body1" gutterBottom>
              During drought periods, California's water system experiences
              significant stress.
            </Typography>

            <Typography component="p" variant="body1" gutterBottom>
              As drought reduces rainfall and snowpack, the runoff water in
              rivers and reservoirs begins to decline.
            </Typography>

            <Typography
              component="p"
              variant="body1"
              sx={{ mb: "var(--space-text-chart)" }}
            >
              At the same time, precipitation patterns are becoming increasingly
              volatile and unpredictable, with rainfall arriving less
              consistently and often in shorter, more intense bursts.
            </Typography>
          </Box>

          <Box sx={storyChartSx}>
            <DualAxisAreaChart
              data={chartData}
              height={height}
              width="100%"
              viewMode={viewMode}
              setViewMode={setViewMode}
              leftName="Surface Water"
              rightName="Groundwater"
              leftColor={COLOR_SW}
              rightColor={COLOR_GW}
              leftDomain={swDomain}
              rightDomain={gwDomain}
              leftAxisLabel="Surface Water (TAF)"
              rightAxisLabel="Groundwater (TAF)"
              referenceX={2002}
              leftTickFormatter={formatTAF}
              rightTickFormatter={formatTAF}
              scrollProgress={scrollProgress}
              swDuration={1800}
              gwDelay={1400}
              gwDuration={1800}
            />
          </Box>
        </Box>

        <Box
          sx={{
            ...scrollCueSx,
            right: "15%",
            opacity: scrollProgress >= 1 ? 0 : 0.6,
            animation:
              scrollProgress < 1
                ? "scrollBounceSWGW 2s ease-in-out infinite"
                : "none",
            "@keyframes scrollBounceSWGW": {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(8px)" },
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
            Scroll for surface water &amp; groundwater
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
