import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import type { MapRef, LayerProps } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const CA_BOUNDS: [[number, number], [number, number]] = [
  [-124.48, 32.53],
  [-114.13, 42.01],
];

const countyFillLayer: LayerProps = {
  id: "county-fill",
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["==", ["get", "CountyName"], "Colusa"],
      "#ff7a00",
      "#ffffff",
    ],
    "fill-opacity": [
      "case",
      ["==", ["get", "CountyName"], "Colusa"],
      0.5,
      0.06,
    ],
  },
};

const countyLineLayer: LayerProps = {
  id: "county-line",
  type: "line",
  paint: {
    "line-width": 1.5,
    "line-opacity": 0.9,
    "line-color": "#ffffff",
  },
};

export default function CaliforniaMap() {
  const mapRef = useRef<MapRef>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  const [counties, setCounties] =
    useState<GeoJSON.FeatureCollection | null>(null);

  // Load GeoJSON
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/data/california_counties.geojson");
      if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
      const data = (await res.json()) as GeoJSON.FeatureCollection;
      if (!cancelled) setCounties(data);
    })().catch(console.error);
    return () => { cancelled = true; };
  }, []);

  // Zoom to Colusa once map + data are ready
  const handleMapLoad = () => {
    if (!counties || !mapRef.current) return;
    zoomToColusa(counties);
  };

  useEffect(() => {
    if (counties && mapRef.current?.loaded()) {
      zoomToColusa(counties);
    }
  }, [counties]);

  function zoomToColusa(data: GeoJSON.FeatureCollection) {
    const colusa = data.features.find(
      (f) => f.properties?.CountyName === "Colusa"
    );
    if (!colusa || !mapRef.current) return;

    // Compute bounding box from coordinates
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const traverse = (arr: any) => {
      if (typeof arr[0] === "number") {
        const [x, y] = arr;
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      } else {
        arr.forEach(traverse);
      }
    };
    traverse((colusa.geometry as any).coordinates);

    mapRef.current.getMap().fitBounds(
      [[minX, minY], [maxX, maxY]],
      { padding: 80, duration: 2000 }
    );
  }

  const countiesData = useMemo(() => counties ?? undefined, [counties]);

  if (!token) {
    return (
      <Box sx={{ p: 2, color: "white" }}>
        Missing <code>VITE_MAPBOX_TOKEN</code>. Add it to <code>.env</code> and
        restart the dev server.
      </Box>
    );
  }

  return (
    <Box sx={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
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
        // dragPan={false}
        dragRotate={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        boxZoom={false}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {countiesData && (
          <Source id="counties" type="geojson" data={countiesData}>
            <Layer {...countyFillLayer} />
            <Layer {...countyLineLayer} />
          </Source>
        )}
      </Map>
    </Box>
  );
}
