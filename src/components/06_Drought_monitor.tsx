import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Link } from "@mui/material";
import * as d3 from "d3";
import StackedAreaChart, { type BandDef } from "../vis/StackedAreaChart";

type Row = {
  MapDate: Date;
  D0: number;
  D1: number;
  D2: number;
  D3: number;
  D4: number;
};

type Props = {
  csvUrl?: string;
  width?: number;
  height?: number;
  title?: string;
  onHoverDate?: (date: Date | null) => void;
};

function parseYYYYMMDD(s: string): Date | null {
  return d3.timeParse("%Y%m%d")(String(s).trim()) ?? null;
}

const COLORS = ["#FFE5CC", "#FFB366", "#FF8C1A", "#E67300", "#B34700"];

const BANDS: BandDef<Row>[] = [
  { label: "Abnormally Dry", color: COLORS[0], y0: (d) => d.D1, y1: (d) => d.D0 },
  { label: "Moderate",       color: COLORS[1], y0: (d) => d.D2, y1: (d) => d.D1 },
  { label: "Severe",         color: COLORS[2], y0: (d) => d.D3, y1: (d) => d.D2 },
  { label: "Extreme",        color: COLORS[3], y0: (d) => d.D4, y1: (d) => d.D3 },
  { label: "Exceptional",    color: COLORS[4], y0: ()  => 0,    y1: (d) => d.D4 },
];

// const HIGHLIGHT_DATE = new Date(2021, 7, 3); // Aug 3, 2021

export default function DroughtCumulativeAreaChart({
  csvUrl = "/data/dm_data.csv",
  width,
  height = 350,
  title = "Drought Severity Areas Over Time",
  onHoverDate,
}: Props) {
  const [data, setData] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;

    d3.csv(csvUrl).then((rows) => {
      if (cancelled) return;

      const parsed: Row[] = [];
      for (const r of rows) {
        const dt = parseYYYYMMDD((r as any).MapDate);
        if (!dt) continue;

        const D0 = Number((r as any).D0);
        const D1 = Number((r as any).D1);
        const D2 = Number((r as any).D2);
        const D3 = Number((r as any).D3);
        const D4 = Number((r as any).D4);
        if (![D0, D1, D2, D3, D4].every((v) => Number.isFinite(v))) continue;

        parsed.push({ MapDate: dt, D0, D1, D2, D3, D4 });
      }

      parsed.sort((a, b) => a.MapDate.getTime() - b.MapDate.getTime());

      // convert to % if looks like 0..1
      const maxVal =
        d3.max(parsed, (d) => Math.max(d.D0, d.D1, d.D2, d.D3, d.D4)) ?? 0;
      if (maxVal <= 1.5) {
        for (const d of parsed) {
          d.D0 *= 100;
          d.D1 *= 100;
          d.D2 *= 100;
          d.D3 *= 100;
          d.D4 *= 100;
        }
      }

      // enforce cumulative monotonicity: D0 ≥ D1 ≥ D2 ≥ D3 ≥ D4
      for (const d of parsed) {
        d.D4 = Math.max(0, d.D4);
        d.D3 = Math.max(d.D3, d.D4);
        d.D2 = Math.max(d.D2, d.D3);
        d.D1 = Math.max(d.D1, d.D2);
        d.D0 = Math.max(d.D0, d.D1);
      }

      setData(parsed);
    });

    return () => {
      cancelled = true;
    };
  }, [csvUrl]);

  const referenceLines = useMemo(() => [] as any[], []);
  const xAccessor = useMemo(() => (d: Row) => d.MapDate, []);

  return (
  <div
    style={{
      margin: "var(--overlay-margin)",
      width: "var(--overlay-width)",
      maxWidth: "var(--overlay-width)",
    }}
  >
    <Typography component="h3" variant="h3" gutterBottom>
      Why California Faces Drought
    </Typography>

    <Typography component="p" variant="body1" gutterBottom>
      Drought has always been part of California's natural climate. However,
      climate change is acting as a powerful amplifier, intensifying the
      severity of these dry periods.
    </Typography>

    <Typography
      sx={{
        fontSize: "var(--source-size)",
        opacity: "60%",
        color: "#fff",
        marginBottom: "3rem",
      }}
      gutterBottom
    >
      Drought Index data source from{" "}
      <Link
        href="https://droughtmonitor.unl.edu/DmData/TimeSeries.aspx"
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
        U.S. Drought Monitor
      </Link>
    </Typography>

    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.75,
        mb: 2,
        borderRadius: "999px",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(4px)",
        // animation: "hintPulse 2.5s ease-in-out 3",
        // "@keyframes hintPulse": {
        //   "0%, 100%": { opacity: 0.6 },
        //   "50%": { opacity: 1 },
        // },
      }}
    >
      <Typography
        variant="body1"
        component="span"
        sx={{
          fontStyle: "italic",
          // fontWeight: 600,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        Hover to explore the detailed distribution of drought conditions
      </Typography>
    </Box>

    <div style={{ maxWidth: "var(--chart-width)" }}>
      <StackedAreaChart<Row>
        data={data}
        xAccessor={xAccessor}
        bands={BANDS}
        width={width}
        height={height}
        title={title}
        xLabel="Year"
        yLabel="Drought Coverage (%)"
        yDomain={[0, 100]}
        xTickInterval={2}
        margin={{ top: 45, right: 30, bottom: 75, left: 70 }}
        referenceLines={referenceLines}
        hover={true}
        showLegend={false}
        onHoverDate={onHoverDate}
      />
    </div>
  </div>
);
}
