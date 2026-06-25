import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import type { MapRef, LayerProps } from "react-map-gl";
import * as d3 from "d3";
import "mapbox-gl/dist/mapbox-gl.css";

const CA_BOUNDS: [[number, number], [number, number]] = [
  [-140.48, 32.53],
  [-114.13, 42.01],
];

const countyFillLayer: LayerProps = {
  id: "county-fill",
  type: "fill",
  paint: {
    "fill-opacity": 0.78,
    "fill-color": [
      "interpolate",
      ["linear"],
      ["coalesce", ["to-number", ["get", "D4"]], 0],
      0, "#fff5eb",
      20, "#fdd0a2",
      40, "#fdae6b",
      60, "#fd8d3c",
      80, "#e6550d",
      100, "#a63603",
    ],
  },
};

const countyLineLayer: LayerProps = {
  id: "county-line",
  type: "line",
  paint: {
    "line-color": "rgba(255,255,255,0.7)",
    "line-width": 1,
  },
};

function normalizeCountyName(name: string) {
  return String(name)
    .toLowerCase()
    .replace(/ county$/i, "")
    .trim();
}

export default function Test_DM() {
  const mapRef = useRef<MapRef>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  const [countyData, setCountyData] =
    useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [geoRes, csvRows] = await Promise.all([
        fetch("/data/california_counties.geojson"),
        d3.csv("/data/dm_export_CA_2021-08-03.csv"),
      ]);

      if (!geoRes.ok) {
        throw new Error(`GeoJSON load failed: ${geoRes.status}`);
      }

      const geojson =
        (await geoRes.json()) as GeoJSON.FeatureCollection<GeoJSON.Geometry>;

      // CSV lookup: county -> D4
      const d4Lookup: Record<string, number> = {};

      csvRows.forEach((row) => {
        const county = normalizeCountyName(row.County ?? "");
        const value = parseFloat(row.D4 ?? "0");
        d4Lookup[county] = isNaN(value) ? 0 : value;
      });

      console.log("CSV sample row:", csvRows[0]);
      console.log("CSV county keys sample:", Object.keys(d4Lookup).slice(0, 10));

      // inspect first feature properties
      if (geojson.features.length > 0) {
        console.log("First GeoJSON feature properties:", geojson.features[0].properties);
      }

      let matchedCount = 0;

      const merged: GeoJSON.FeatureCollection = {
        ...geojson,
        features: geojson.features.map((feature) => {
          const props = (feature.properties ?? {}) as Record<string, any>;

          // Try several possible county-name fields
          const geoCountyRaw =
            props.NAME ??
            props.NAMELSAD ??
            props.County ??
            props.COUNTY ??
            props.COUNTY_NAME ??
            props.NAME_2 ??
            "";

          const key = normalizeCountyName(geoCountyRaw);
          const d4 = d4Lookup[key] ?? 0;

          if (d4Lookup[key] !== undefined) {
            matchedCount += 1;
          }

          return {
            ...feature,
            properties: {
              ...props,
              county_join_name: key,
              D4: d4,
            },
          };
        }),
      };

      console.log("Matched county count:", matchedCount, "out of", geojson.features.length);
      console.log(
        "Merged D4 sample:",
        merged.features.slice(0, 10).map((f) => ({
          name: (f.properties as any)?.NAME ??
                (f.properties as any)?.NAMELSAD ??
                (f.properties as any)?.COUNTY_NAME,
          join: (f.properties as any)?.county_join_name,
          D4: (f.properties as any)?.D4,
        }))
      );

      if (!cancelled) {
        setCountyData(merged);
      }
    }

    loadData().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, []);

  const counties = useMemo(() => countyData ?? undefined, [countyData]);

  if (!token) {
    return (
      <Box sx={{ p: 2.5, color: "white" }}>
        Missing <code>VITE_MAPBOX_TOKEN</code>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{
          bounds: CA_BOUNDS,
          fitBoundsOptions: { padding: 120 },
        }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        style={{ width: "100%", height: "100%" }}
        scrollZoom={false}
        dragPan={false}
        dragRotate={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        boxZoom={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {counties && (
          <Source id="ca-counties" type="geojson" data={counties}>
            <Layer {...countyFillLayer} />
            <Layer {...countyLineLayer} />
          </Source>
        )}
      </Map>
    </Box>
  );
}
