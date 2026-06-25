import { useEffect, useMemo, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import * as d3 from "d3";
import StackedAreaChart, {
  type BandDef,
  type ReferenceLine,
} from "../vis/StackedAreaChart";
import { sourceLinkSx, storyChartSx, storyContentSx } from "./ui/storyStyles";

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

const COLORS = ["#FFE5CC", "#FFB366", "#FF8C1A", "#E67300", "#B34700"];

const BANDS: BandDef<Row>[] = [
  { label: "Abnormally Dry", color: COLORS[0], y0: (d) => d.D1, y1: (d) => d.D0 },
  { label: "Moderate", color: COLORS[1], y0: (d) => d.D2, y1: (d) => d.D1 },
  { label: "Severe", color: COLORS[2], y0: (d) => d.D3, y1: (d) => d.D2 },
  { label: "Extreme", color: COLORS[3], y0: (d) => d.D4, y1: (d) => d.D3 },
  { label: "Exceptional", color: COLORS[4], y0: () => 0, y1: (d) => d.D4 },
];

function parseYYYYMMDD(s: string): Date | null {
  return d3.timeParse("%Y%m%d")(String(s).trim()) ?? null;
}

function normalizeDroughtRows(rows: d3.DSVRowArray<string>): Row[] {
  const parsed: Row[] = [];

  for (const r of rows) {
    const MapDate = parseYYYYMMDD(r.MapDate ?? "");
    if (!MapDate) continue;

    const D0 = Number(r.D0);
    const D1 = Number(r.D1);
    const D2 = Number(r.D2);
    const D3 = Number(r.D3);
    const D4 = Number(r.D4);
    if (![D0, D1, D2, D3, D4].every(Number.isFinite)) continue;

    parsed.push({ MapDate, D0, D1, D2, D3, D4 });
  }

  parsed.sort((a, b) => a.MapDate.getTime() - b.MapDate.getTime());

  const maxVal =
    d3.max(parsed, (d) => Math.max(d.D0, d.D1, d.D2, d.D3, d.D4)) ?? 0;

  for (const d of parsed) {
    if (maxVal <= 1.5) {
      d.D0 *= 100;
      d.D1 *= 100;
      d.D2 *= 100;
      d.D3 *= 100;
      d.D4 *= 100;
    }

    d.D4 = Math.max(0, d.D4);
    d.D3 = Math.max(d.D3, d.D4);
    d.D2 = Math.max(d.D2, d.D3);
    d.D1 = Math.max(d.D1, d.D2);
    d.D0 = Math.max(d.D0, d.D1);
  }

  return parsed;
}

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
      if (!cancelled) setData(normalizeDroughtRows(rows));
    });

    return () => {
      cancelled = true;
    };
  }, [csvUrl]);

  const referenceLines = useMemo(() => [] as ReferenceLine[], []);
  const xAccessor = useMemo(() => (d: Row) => d.MapDate, []);

  return (
    <Box
      sx={{
        margin: "var(--overlay-margin)",
        ...storyContentSx,
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
        variant="caption"
        component="div"
        sx={{
          fontSize: "var(--source-size)",
          opacity: 0.6,
          mb: "var(--space-text-chart)",
        }}
      >
        Drought Index data source from{" "}
        <Link
          href="https://droughtmonitor.unl.edu/DmData/TimeSeries.aspx"
          target="_blank"
          rel="noopener"
          sx={sourceLinkSx}
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
        }}
      >
        <Typography
          variant="body1"
          component="span"
          sx={{
            fontStyle: "italic",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Hover to explore the detailed distribution of drought conditions
        </Typography>
      </Box>

      <Box sx={storyChartSx}>
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
      </Box>
    </Box>
  );
}
