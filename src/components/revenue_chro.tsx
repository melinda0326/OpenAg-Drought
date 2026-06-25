import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import Map, { NavigationControl, Source, Layer } from "react-map-gl";
import type { FeatureCollection, Feature } from "geojson";

const CA_VIEW = {
  longitude: -124.2, // center shifted west (more ocean)
  latitude: 37.2, // slightly north of CA midpoint
  zoom: 5.4, // zoomed out
  bearing: 0,
  pitch: 0,
} as const;

type CountiesFC = FeatureCollection;

// --- helpers ---
function normalizeCountyName(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\r/g, "")
    .replace(/\s+county$/, "")
    .replace(/[.\-']/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Your GeoJSON uses properties.CountyName
 */
function getCountyNameFromFeature(f: Feature): string {
  const p: any = f.properties ?? {};
  return normalizeCountyName(p.CountyName ?? "");
}

/**
 * Lightweight CSV parser (no deps).
 * Works for simple CSV (no quoted commas).
 */
function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").trim();
    });
    return row;
  });
}

export default function CaliforniaMapRevenue() {
  const [geojsonData, setGeojsonData] = useState<CountiesFC | null>(null);
  const [revenueByCounty, setRevenueByCounty] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setLoading(true);
        setError(null);

        // GeoJSON: public/data/california_counties.geojson
        const gjRes = await fetch("/data/california_counties.geojson");
        if (!gjRes.ok) throw new Error("Failed to load GeoJSON");
        const gj = (await gjRes.json()) as CountiesFC;

        // CSV: public/data/final_dwr_openag_data_COUNTY_simplified_no_water.csv
        const csvRes = await fetch(
          "/data/final_dwr_openag_data_COUNTY_simplified_no_water.csv"
        );
        if (!csvRes.ok) throw new Error("Failed to load CSV");
        const csvText = await csvRes.text();

        // Aggregate revenue by COUNTY
        const rows = parseCSV(csvText);
        const agg: Record<string, number> = {};

        for (const r of rows) {
          const countyKey = normalizeCountyName(r.COUNTY);
          const revenueNum = Number(r.revenue);
          if (!countyKey || !Number.isFinite(revenueNum)) continue;
          agg[countyKey] = (agg[countyKey] ?? 0) + revenueNum;
        }

        if (cancelled) return;
        setGeojsonData(gj);
        setRevenueByCounty(agg);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Join aggregated revenue onto GeoJSON features as `revenue_total`
  const mergedGeojson = useMemo<CountiesFC | null>(() => {
    if (!geojsonData) return null;

    return {
      ...geojsonData,
      features: geojsonData.features.map((f) => {
        const key = getCountyNameFromFeature(f);
        const revenueTotal = revenueByCounty[key] ?? 0;

        return {
          ...f,
          properties: {
            ...(f.properties ?? {}),
            revenue_total: revenueTotal,
          },
        };
      }),
    };
  }, [geojsonData, revenueByCounty]);

  /**
   * IMPORTANT CHANGE:
   * Legend + color scale start at 0 (not data min).
   * We compute only max from data.
   */
  const revenueStats = useMemo(() => {
    if (!mergedGeojson) return { min: 0, max: 1 };

    const values = mergedGeojson.features
      .map((f: any) => Number(f.properties?.revenue_total))
      .filter((v) => Number.isFinite(v));

    const max = values.length ? Math.max(...values) : 1;

    return {
      min: 0,
      max: max === 0 ? 1 : max, // prevent 0-span
    };
  }, [mergedGeojson]);

  /**
   * IMPORTANT CHANGE:
   * Interpolate from 0 -> max (0 is white).
   * revenue_total <= 0 remains transparent.
   */
  const fillColorExpr: any = useMemo(() => {
    const { max } = revenueStats;

    return [
      "case",
      [">", ["coalesce", ["get", "revenue_total"], 0], 0],
      [
        "interpolate",
        ["linear"],
        ["get", "revenue_total"],
        0,
        "#ffffff",
        max * 0.25,
        "#cdeecf",
        max * 0.5,
        "#8fd694",
        max * 0.75,
        "#3fae5a",
        max,
        "#146b2e",
      ],
      "rgba(0,0,0,0)",
    ];
  }, [revenueStats]);

  if (!token) {
    return (
      <Box sx={{ p: 2 }}>
        Missing <code>VITE_MAPBOX_TOKEN</code>. Add it to <code>.env</code> and
        restart the dev server.
      </Box>
    );
  }

  return (
    <Box sx={{ width: "90vw", height: "90vh", position: "relative" }}>
      <Map
        mapboxAccessToken={token}
        initialViewState={CA_VIEW}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {mergedGeojson && (
          <Source id="counties" type="geojson" data={mergedGeojson}>
            {/* Choropleth fill */}
            <Layer
              id="counties-fill"
              type="fill"
              paint={{
                "fill-color": fillColorExpr,
                "fill-opacity": 0.7,
              }}
            />

            {/* County borders (always visible) */}
            <Layer
              id="counties-line"
              type="line"
              paint={{
                "line-color": "#ffffff",
                "line-width": 1.5,
                "line-opacity": 0.5,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Status overlay (no layout space reserved) */}
      {loading && (
        <Typography
          variant="chartLabel"
          sx={{
            position: "absolute",
            left: 2,
            top: 2,
            background: "rgba(255,255,255,0.9)",
            padding: "10px 12px",
            borderRadius: "6px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            color: "#111",
          }}
        >
          Loading county + revenue data...
        </Typography>
      )}

      {error && (
        <Typography
          variant="chartLabel"
          sx={{
            position: "absolute",
            left: 2,
            top: 2,
            background: "rgba(255,235,235,0.95)",
            color: "#b00020",
            padding: "10px 12px",
            borderRadius: "6px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            maxWidth: 420,
          }}
        >
          Error: {error}
        </Typography>
      )}

      {/* Legend: always show min=0 */}
      {!loading && !error && revenueStats.max > 0 && (
        <RevenueLegend min={0} max={revenueStats.max} />
      )}
    </Box>
  );
}

function RevenueLegend({ min, max }: { min: number; max: number }) {
  const format = (v: number) =>
    v === 0
      ? "$0"
      : v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(1)}M`
      : `$${Math.round(v).toLocaleString()}`;

  return (
    <Box
      sx={{
        position: "absolute",
        right: 1.25,
        top: 10,
        background: "rgba(255,255,255,0.92)",
        padding: "12px 14px",
        borderRadius: "6px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        lineHeight: 1.2,
        width: 220,
        color: "#111",
      }}
    >
      <Typography variant="chartLabel" sx={{ fontWeight: 700, marginBottom: 1, color: "#111" }}>
        Agricultural Revenue
      </Typography>

      <Box
        sx={{
          height: 12,
          borderRadius: "4px",
          background:
            "linear-gradient(to right, #ffffff, #cdeecf, #8fd694, #3fae5a, #146b2e)",
          marginBottom: 0.75,
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="chartLabel" sx={{ color: "#111" }}>{format(min)}</Typography>
        <Typography variant="chartLabel" sx={{ color: "#111" }}>{format(max)}</Typography>
      </Box>
    </Box>
  );
}
