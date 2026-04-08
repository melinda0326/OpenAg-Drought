import { useEffect, useMemo, useState } from "react";
import Map, { Layer, Source } from "react-map-gl";
import type { FeatureCollection, Geometry } from "geojson";
import * as d3 from "d3";
import "mapbox-gl/dist/mapbox-gl.css";

const CA_BOUNDS: [[number, number], [number, number]] = [
  [-140.48, 32.53],
  [-114.13, 42.01],
];

const DROUGHT_COLORS = ["#FFE5CC", "#FFB366", "#FF8C1A", "#E67300", "#B34700"];

const D_KEYS = ["D0_only", "D1_only", "D2_only", "D3_only", "D4_only"];

type CountiesFC = FeatureCollection<Geometry>;

type CsvRow = {
  County: string;
  D0_only: number;
  D1_only: number;
  D2_only: number;
  D3_only: number;
  D4_only: number;
};

function normalizeName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+county$/, "")
    .replace(/[.\-']/g, "")
    .replace(/\s+/g, " ");
}

function smallestNonZeroCategory(row: CsvRow): number | null {
  for (let i = 0; i < D_KEYS.length; i++) {
    if ((row as any)[D_KEYS[i]] > 0) return i;
  }
  return null;
}

export default function CaliforniaCountyMap() {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
  const [geojsonData, setGeojsonData] = useState<CountiesFC | null>(null);
  const [csvRows, setCsvRows] = useState<CsvRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setError(null);

        const [gjRes, csvRes] = await Promise.all([
          fetch("/data/california_counties.geojson"),
          fetch("/data/dm_map_with_dominant_category.csv"),
        ]);

        if (!gjRes.ok) throw new Error(`GeoJSON load failed (${gjRes.status})`);
        if (!csvRes.ok) throw new Error(`CSV load failed (${csvRes.status})`);

        const [gj, csvText] = await Promise.all([gjRes.json(), csvRes.text()]);

        const parsed = d3.csvParse(csvText).map((r) => ({
          County: String(r.County ?? ""),
          D0_only: Number(r.D0_only ?? 0),
          D1_only: Number(r.D1_only ?? 0),
          D2_only: Number(r.D2_only ?? 0),
          D3_only: Number(r.D3_only ?? 0),
          D4_only: Number(r.D4_only ?? 0),
        }));

        if (!cancelled) {
          setGeojsonData(gj as CountiesFC);
          setCsvRows(parsed);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Failed to load data");
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Join CSV drought data → GeoJSON features
  const enrichedGeojson = useMemo<CountiesFC | null>(() => {
    if (!geojsonData || !csvRows) return null;

    // Use globalThis.Map to avoid conflict with react-map-gl's Map
    const lookup = new globalThis.Map<string, number>();
    for (const row of csvRows) {
      const key = normalizeName(row.County);
      const cat = smallestNonZeroCategory(row);
      if (cat !== null) lookup.set(key, cat);
    }

    const features = geojsonData.features.map((f) => {
      const name = normalizeName(
        (f.properties as any)?.CountyName ??
          (f.properties as any)?.NAME ??
          ""
      );
      const catIdx = lookup.get(name) ?? -1;

      return {
        ...f,
        properties: {
          ...f.properties,
          droughtIdx: catIdx,
        },
      };
    });

    return { ...geojsonData, features };
  }, [geojsonData, csvRows]);

  if (!token) {
    return (
      <div style={{ padding: 16 }}>
        Missing <code>VITE_MAPBOX_TOKEN</code>.
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: 16 }}>{error}</div>;
  }

  if (!enrichedGeojson) {
    return <div style={{ padding: 16 }}>Loading map...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Map
        mapboxAccessToken={token}
        initialViewState={{
          bounds: CA_BOUNDS,
          fitBoundsOptions: { padding: 40 },
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
        scrollZoom={false}
        dragRotate={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        boxZoom={false}
      >
        <Source id="counties" type="geojson" data={enrichedGeojson}>
          <Layer
            id="counties-fill"
            type="fill"
            paint={{
              "fill-color": [
                "case",
                ["==", ["get", "droughtIdx"], 0], DROUGHT_COLORS[0],
                ["==", ["get", "droughtIdx"], 1], DROUGHT_COLORS[1],
                ["==", ["get", "droughtIdx"], 2], DROUGHT_COLORS[2],
                ["==", ["get", "droughtIdx"], 3], DROUGHT_COLORS[3],
                ["==", ["get", "droughtIdx"], 4], DROUGHT_COLORS[4],
                "#d9d9d9",
              ],
              // "fill-opacity": 0.75,
            }}
          />
          <Layer
            id="counties-outline"
            type="line"
            paint={{
              "line-color": "#1f1f1f",
              "line-width": 1.2,
              "line-opacity": 0.9,
            }}
          />
        </Source>
      </Map>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          background: "rgba(0,0,0,0.65)",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Inter, system-ui, sans-serif",
            marginBottom: 4,
          }}
        >
          Drought Severity (Aug 3, 2021)
        </span>
        {["Abnormally Dry", "Moderate", "Severe", "Extreme", "Exceptional"].map(
          (label, i) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  backgroundColor: DROUGHT_COLORS[i],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: "white",
                  fontSize: 12,
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              >
                {label}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
