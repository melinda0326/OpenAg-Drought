import React, { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";

import DualAxisAreaChart, {
  type DualAxisDatum,
  type ViewMode,
} from "../vis/DualAxis_SWGW";

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
  surfaceWaterCsv?: string;
  groundwaterCsv?: string;
  height?: number;
  title?: string;
};

const COLOR_SW = "#1B9AAA";
const COLOR_GW = "#3d6fc4";

export default function SurfaceGroundwaterChart({
  surfaceWaterCsv = "/data/surface_supplies_ag_annual_sum.csv",
  groundwaterCsv = "/data/change_in_gw.csv",
  height = 400,
  title = "Surface Water vs Groundwater Over Time",
}: SurfaceGroundwaterChartProps) {
  const [data, setData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [swDomain, setSwDomain] = useState<[number, number]>([0, 0]);
  const [gwDomain, setGwDomain] = useState<[number, number]>([0, 0]);
  const [viewMode, setViewMode] = useState<ViewMode>("both");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [swRows, gwRows] = await Promise.all([
          d3.csv(surfaceWaterCsv),
          d3.csv(groundwaterCsv),
        ]);

        const cleanSW = (swRows as unknown as RowSW[])
          .map((d) => ({
            year: Number(String(d.WY).trim()),
            value: Number(String(d.water_use_taf).trim()),
          }))
          .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.value));

        const cleanGW = (gwRows as unknown as RowGW[])
          .map((d) => ({
            year: Number(String(d.Year).trim()),
            value: Number(
              String(d["Cummulative change in groundwater storage"]).trim()
            ),
          }))
          .filter(
            (d) =>
              Number.isFinite(d.year) &&
              Number.isFinite(d.value) &&
              d.year >= 2002
          );

        const swMin = d3.min(cleanSW, (d) => d.value) ?? 0;
        const swMax = d3.max(cleanSW, (d) => d.value) ?? 0;
        const gwMin = d3.min(cleanGW, (d) => d.value) ?? 0;
        const gwMax = d3.max(cleanGW, (d) => d.value) ?? 0;

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

        const merged = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);

        if (!cancelled) {
          setData(merged);
          setSwDomain([swMin, swMax]);
          setGwDomain([gwMin, gwMax]);
        }
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
  }, [surfaceWaterCsv, groundwaterCsv]);

  const chartData: DualAxisDatum[] = useMemo(
    () =>
      data.map((d) => ({
        year: d.year,
        leftValue: d.surfaceWater,
        rightValue: d.groundwater,
      })),
    [data]
  );

  const formatTAF = (v: number) =>
    Number.isFinite(v) ? `${Math.round(v / 1000)}k` : "";

  if (loading) {
    return <div style={{ color: "white" }}>Loading chart…</div>;
  }

  if (error) {
    return <div style={{ color: "white" }}>{error}</div>;
  }

  return (
    <div
      style={{
        margin: "var(--overlay-margin)",
      }}
    >
      <h2
        style={{
          color: "white",
          fontSize: "var(--title-size)",
          fontWeight: 700,
          margin: "0 0 1.5rem 0",
          maxWidth: "var(--overlay-width)",
          lineHeight: 1.2,
        }}
      >
        What Happens During a California Drought
      </h2>
      <p
        style={{
          color: "white",
          fontSize: "var(--body-size)",
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: 1.6,
          marginBottom: "0.5rem",
          marginTop: 0,
          maxWidth: "var(--overlay-width)",
        }}
      >
        During drought periods, California's water system experiences significant stress.
      </p>

      <p
        style={{
          color: "white",
          fontSize: "var(--body-size)",
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: 1.6,
          marginBottom: "1.5rem",
          marginTop: 0,
          maxWidth: "var(--overlay-width)",
        }}
      >
        As drought reduces rainfall and snowpack, the runoff water in rivers and reservoirs begins to decline.
      </p>

      <div
        style={{
          width: "100%",
          background: "transparent",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            color: "#fff",
            fontSize: "var(--body-size)",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.6,
            marginBottom: "2rem",
            maxWidth: "var(--overlay-width)",
          }}
        >
          At the same time, precipitation patterns are becoming increasingly volatile and unpredictable, with rainfall arriving less consistently and often in shorter, more intense bursts.
        </p>

        <DualAxisAreaChart
          data={chartData}
          height={height}
          width="70%"
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
          swDuration={1800}
          gwDelay={1400}
          gwDuration={1800}
        />
      </div>
    </div>
  );
}

