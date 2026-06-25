import {useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import Map, { Layer, Source, Marker } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import type { FeatureCollection, Geometry } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

const CA_BOUNDS : [[number, number], [number, number]] = [
  [-138, 33],   // move inward
  [-115, 41],
];

const ZOOMED_MAP_VIEW = {
  longitude: -124.665,
  latitude: 37.033,
  zoom: 6.5,
};


type StepId =
  | "opener"
  | "state-crop"
  | "state-crop-cv"
  | "state-crop-rv"
  | "state-crop-emp"
  | "transition1"
  | "drought_monitor"
  | "temperature-trend"
  | "precipitation_bar"
  | "transition2"
  | "sw_gw"
  | "transition3"
  | "compare-image"
  | "compare-land"
  | "compare-rev"
  | "compare-water"
  | "transition-chain"
  | "open-exploration"
  | "about-us";

type CountyPictogramData = {
  county: string;
  base: number;
  scenario: number;
} | null;

type CaliforniaMapProps = {
  activeSection: StepId;
  onLoad?: () => void;
  geojsonWithValue?: FeatureCollection<Geometry> | null;
  shortage: number;
  droughtGeojson?: FeatureCollection<Geometry> | null;
  countyGeojson?: FeatureCollection<Geometry> | null;
  clickedCountyData?: CountyPictogramData;
  onCountyClick?: (countyName: string | null) => void;
  metric?: "xland_pct" | "xwater_pct" | "revenue_pct";
  compareAspect?: number;
};

const DROUGHT_COLORS = ["#FFE5CC", "#FFB366", "#FF8C1A", "#E67300", "#B34700"];

const legendPanelSx = {
  position: "absolute",
  right: { xs: 12, md: 20 },
  width: { xs: "calc(100% - 24px)", md: 260 },
  maxWidth: 260,
  background: "rgba(8, 10, 14, 0.76)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: 2,
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 18px 44px rgba(0,0,0,0.42)",
  p: 1.5,
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
  zIndex: 10,
  pointerEvents: "auto",
} as const;

const legendTitleSx = {
  color: "white",
  fontWeight: 800,
  letterSpacing: 0.2,
  lineHeight: 1.2,
} as const;

const legendHelperSx = {
  color: "rgba(255,255,255,0.62)",
  lineHeight: 1.3,
  mb: 0.25,
} as const;

const legendRowSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minHeight: 30,
  px: 0.75,
  py: 0.5,
  borderRadius: 1,
} as const;

const legendSwatchSx = {
  width: 16,
  height: 16,
  borderRadius: "4px",
  flexShrink: 0,
  border: "1px solid rgba(255,255,255,0.28)",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.16)",
} as const;

export default function CaliforniaMap({
  activeSection,
  onLoad,
  geojsonWithValue,
  shortage,
  droughtGeojson,
  countyGeojson,
  compareAspect = 0,
  onCountyClick,
}: CaliforniaMapProps) {

  console.log("activeSection:", activeSection);
  const mapRef = useRef<MapRef | null>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
  const [hoveredCropCode, setHoveredCropCode] = useState<string | null>(null);
  const isOpenExploration = activeSection === "open-exploration";
  const isCentralValleyCropStep = activeSection === "state-crop-cv" || activeSection === "state-crop-rv" || activeSection === "state-crop-emp" ;

  // Reset hover state when leaving crop steps
  useEffect(() => {
    if (!isCentralValleyCropStep) setHoveredCropCode(null);
  }, [isCentralValleyCropStep]);
  const isReducedCropStep = activeSection === "state-crop-rv" || activeSection === "state-crop-emp";
  const isCompareLand = activeSection === "compare-land";

  const isDroughtMonitor = activeSection === "drought_monitor";
  const cameraMode = isCompareLand
  ? "colusa"
  : isReducedCropStep
    ? "cv-rv"
    : isCentralValleyCropStep
      ? "cv"
      : (isOpenExploration || isDroughtMonitor || activeSection === "opener")
        ? "state"
        : "zoomed-state";

  useEffect(() => {
  const map = mapRef.current?.getMap();
  if (!map) return;

  if (cameraMode === "colusa") {
    map.flyTo({
      center: [-122.295, 39.193],
      zoom: 9,
      bearing: 0,
      pitch: 0,
      duration: 2500,
      padding: {
        left: Math.round(window.innerWidth * 0.4),
        right: 0,
        top: 0,
        bottom: 0,
      },
    });
  } else if (cameraMode === "cv") {
    map.flyTo({
      center: [-120, 36.5],
      zoom: 9,
      bearing: 0,
      pitch: 0,
      duration: 2500,
    });
  } else if (cameraMode === "cv-rv") {
    map.flyTo({
      center: [-122.116, 38.465],
      zoom: 9,
      bearing: 0,
      pitch: 0,
      duration: 2500,
    });
  } else if (cameraMode === "state") {
    map.fitBounds(CA_BOUNDS, {
      padding: {
        left: 300,
        right: 50,
        top: 30,
        bottom: 30,
      },
      duration: 1800,
    });
  } else {
    map.flyTo({
      center: [ZOOMED_MAP_VIEW.longitude, ZOOMED_MAP_VIEW.latitude],
      zoom: ZOOMED_MAP_VIEW.zoom,
      bearing: 0,
      pitch: 0,
      duration: 1800,
    });
  }
}, [cameraMode]);

  if (!token) {
    return (
      <Box sx={{ p: 2, color: "white" }}>
        Missing <code>VITE_MAPBOX_TOKEN</code>. Add it to <code>.env</code> and restart the dev server.
      </Box>
    );
  }

  const CROP_LEGEND_BASE = [
  { code: "G",  color: "#C2A83E", label: "Grain & Hay" },
  { code: "R",  color: "#5FA8D3", label: "Rice" },
  { code: "F",  color: "#6DA34D", label: "Field Crops" },
  { code: "P",  color: "#A3B18A", label: "Pasture" },
  { code: "T",  color: "#db3923", label: "Truck & Berry" },
  { code: "D",  color: "#f7c46a", label: "Deciduous Fruits & Nuts" },
  { code: "C",  color: "#d17819", label: "Citrus & Subtropical" },
  { code: "V",  color: "#6F4E7C", label: "Vineyard" },
  { code: "YP", color: "#D4A373", label: "Young Perennial" },
];

  const [cropCounts, setCropCounts] = useState<Record<string, number>>({});

  // Query visible crop features whenever the crop step or camera changes
  useEffect(() => {
    if (!isCentralValleyCropStep) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    const queryCrops = () => {
      const features = map.querySourceFeatures("cv-source", {
        sourceLayer: "state_crop-arjis8",
      });
      const counts: Record<string, number> = {};
      for (const f of features) {
        const code = f.properties?.SYMB_CLASS;
        if (code) counts[code] = (counts[code] || 0) + 1;
      }
      setCropCounts(counts);
    };

    // Query after tiles settle
    if (map.isSourceLoaded("cv-source")) {
      queryCrops();
    }
    map.on("idle", queryCrops);
    return () => { map.off("idle", queryCrops); };
  }, [isCentralValleyCropStep, activeSection]);

  // Sort legend by feature count (descending)
  const CROP_LEGEND = useMemo(() => {
    const hasData = Object.keys(cropCounts).length > 0;
    if (!hasData) return CROP_LEGEND_BASE;
    return [...CROP_LEGEND_BASE].sort(
      (a, b) => (cropCounts[b.code] || 0) - (cropCounts[a.code] || 0)
    );
  }, [cropCounts]);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{
        longitude: ZOOMED_MAP_VIEW.longitude,
        latitude: ZOOMED_MAP_VIEW.latitude,
        zoom: ZOOMED_MAP_VIEW.zoom,
      }}
      mapStyle="mapbox://styles/mapbox/satellite-v9"
      style={{ width: "100%", height: "100%" }}
      onLoad={onLoad}
      scrollZoom={false}
      dragPan={false}
      dragRotate={false}
      doubleClickZoom={false}
      touchZoomRotate={false}
      keyboard={false}
      boxZoom={false}
      cursor={isOpenExploration ? "pointer" : undefined}
      interactiveLayerIds={isOpenExploration ? ["counties-fill"] : []}
      onClick={(e) => {
        if (!isOpenExploration || !onCountyClick) return;
        const feature = e.features?.[0];
        if (!feature) return;
        const p: any = feature.properties ?? {};
        const name = (p.CountyName ?? p.NAME ?? p.name ?? "").trim();
        if (name) onCountyClick(name);
      }}
    >
      <Marker longitude={-120.3} latitude={37.1} anchor="bottom">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
              opacity: activeSection === "opener" ? 1 : 0,
              transform: activeSection === "opener" ? "scale(1) translateY(0)" : "scale(0.85) translateY(20px)",
              transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
            }}
          >
            <Box
              sx={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
              }}
            >
              <img
                src="/image/drought.jpg"
                alt="Drought land in Central Valley"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
        <Typography
          variant="body1"
          sx={{
            marginTop: 2.5,
            color: "white",
            fontWeight: 700,
            whiteSpace: "nowrap",
            display: "inline-block",
            px: 1.5,
            py: 0.75,
            background: "rgba(8, 10, 14, 0.76)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 1.5,
            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
            boxShadow: "0 14px 34px rgba(0,0,0,0.42)",
          }}
        >
          Drought land in the Central Valley
        </Typography>
          </Box>
        </Marker>

      {activeSection === "open-exploration" && geojsonWithValue && (
        <Source id="counties" type="geojson" data={geojsonWithValue}>
          <Layer
            id="counties-fill"
            type="fill"
            paint={{
              "fill-opacity": ["case", ["==", shortage, 0], 0, 0.65],
              "fill-color": [
                "case",
                ["==", shortage, 0],
                "rgba(0,0,0,0)",
                ["==", ["get", "mapValue"], null],
                "rgba(0,0,0,0)",
                [
                  "interpolate",
                  ["linear"],
                  ["max", -100, ["min", ["get", "mapValue"], 0]],
                  -100, "#990000",
                  -75, "#e60000",
                  -50, "#ff4d4d",
                  -25, "#ff9999",
                  0, "#ffe5e5",
                ],
              ],
            }}
          />

          <Layer
            id="counties-outline"
            type="line"
            paint={{
              "line-width": 1.1,
              "line-opacity": 0.85,
              "line-color": "#ffffff",
            }}
          />

          <Layer
            id="counties-selected-glow"
            type="line"
            filter={["==", ["get", "isSelected"], 1]}
            paint={{
              "line-width": 10,
              "line-color": "rgba(255,255,255,0.35)",
              "line-opacity": 0.9,
            }}
          />

          <Layer
            id="counties-selected-outline"
            type="line"
            filter={["==", ["get", "isSelected"], 1]}
            paint={{
              "line-width": 4,
              "line-color": "#ffffff",
              "line-opacity": 1,
            }}
          />
        </Source>
      )}

      {/* Always render sources so tiles preload — control visibility via opacity */}
      <Source
        id="shp-source"
        type="vector"
        url="mapbox://melinda0326.axihr243"
      >
        <Layer
          id="shp-fill"
          type="fill"
          source-layer="fixed"
          paint={{
            "fill-color": "#2f7d44",
            "fill-opacity": activeSection === "state-crop" ? 1 : 0,
            "fill-outline-color": "transparent",
            "fill-antialias": true,
          }}
        />
        <Layer
          id="shp-outline"
          type="line"
          source-layer="fixed"
          paint={{
            "line-color": "#358E4D",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5,
              0.6,
              9,
              1.2,
              12,
              2.0,
            ],
            "line-opacity": activeSection === "state-crop" ? 1 : 0,
          }}
        />
      </Source>

      <Source
        id="cv-source"
        type="vector"
        url="mapbox://melinda0326.9sh816s7"
      >
        <Layer
          id="cv-fill"
          type="fill"
          source-layer="state_crop-arjis8"
          paint={{
            "fill-color": isReducedCropStep
              ? [
                  "match",
                  ["get", "SYMB_CLASS"],
                  "T", "#db3923",
                  "V", "#6F4E7C",
                  "rgba(80,80,80,0.3)",
                ]
              : [
                  "match",
                  ["get", "SYMB_CLASS"],
                  "G", "#C2A83E",
                  "R", "#6FAED9",
                  "F", "#6DA34D",
                  "P", "#A3B18A",
                  "T", "#db3923",
                  "D", "#f7c46a",
                  "C", "#d17819",
                  "V", "#6F4E7C",
                  "YP", "#D4A373",
                  "#D9D9D9",
                ],
            "fill-opacity": isCentralValleyCropStep
              ? hoveredCropCode
                ? [
                    "case",
                    ["==", ["get", "SYMB_CLASS"], hoveredCropCode],
                    0.88,
                    0.15,
                  ]
                : 0.88
              : 0,
            "fill-opacity-transition": { duration: 300, delay: 0 },
            "fill-outline-color": "transparent",
            "fill-antialias": true,
          }}
        />
      </Source>

      {isCompareLand && (
        <>
          {/* 2019 layer — only for Land aspect (0) */}
          <Source
            id="colusa-2019"
            type="vector"
            url="mapbox://melinda0326.9ay6rsbs"
          >
            <Layer
              id="colusa-2019-fill"
              type="fill"
              source-layer="2019_colusa_rice-0cylad"
              paint={{
                "fill-color": "#1B5E20",
                "fill-opacity": compareAspect === 0 ? 0.85 : 0,
                "fill-opacity-transition": { duration: 400, delay: 0 },
              }}
            />
          </Source>
          {/* 2022 layer — only for Land aspect (0) */}
          <Source
            id="colusa-2022"
            type="vector"
            url="mapbox://melinda0326.dwkakmm0"
          >
            <Layer
              id="colusa-2022-fill"
              type="fill"
              source-layer="2022_colusa_rice-3aafpc"
              paint={{
                "fill-color": "#A5D6A7",
                "fill-opacity": compareAspect === 0 ? 0.85 : 0,
                "fill-opacity-transition": { duration: 400, delay: 0 },
              }}
            />
          </Source>

          {/* Colusa county boundary highlight — always visible */}
          {countyGeojson && (
            <Source id="colusa-boundary" type="geojson" data={countyGeojson}>
              <Layer
                id="colusa-boundary-glow"
                type="line"
                filter={["==", ["get", "CountyName"], "Colusa"]}
                paint={{
                  "line-color": "rgba(255,255,255,0.3)",
                  "line-width": 6,
                }}
              />
              <Layer
                id="colusa-boundary-line"
                type="line"
                filter={["==", ["get", "CountyName"], "Colusa"]}
                paint={{
                  "line-color": "#ffffff",
                  "line-width": 2.5,
                }}
              />
            </Source>
          )}

          {/* Colusa label — always visible */}
          <Marker longitude={-122.1} latitude={38.85} anchor="bottom">
            <Typography
              variant="body1"
              sx={{
                color: "white",
                fontWeight: 700,
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              Colusa County
            </Typography>
          </Marker>
        </>
      )}


      {activeSection === "drought_monitor" && droughtGeojson && (
        <Source id="drought-counties" type="geojson" data={droughtGeojson}>
          <Layer
            id="drought-fill"
            type="fill"
            paint={{
              "fill-color": [
                "case",
                ["==", ["get", "droughtIdx"], 0], DROUGHT_COLORS[0],
                ["==", ["get", "droughtIdx"], 1], DROUGHT_COLORS[1],
                ["==", ["get", "droughtIdx"], 2], DROUGHT_COLORS[2],
                ["==", ["get", "droughtIdx"], 3], DROUGHT_COLORS[3],
                ["==", ["get", "droughtIdx"], 4], DROUGHT_COLORS[4],
                "rgba(0,0,0,0)",
              ],
            }}
          />
          <Layer
            id="drought-outline"
            type="line"
            paint={{
              "line-color": "#ffffff",
              "line-width": 1.1,
              "line-opacity": 0.85,
            }}
          />
        </Source>
      )}
    </Map>


    {/* Drought legend */}
    {activeSection === "drought_monitor" && (
      <Box
        sx={{
          ...legendPanelSx,
          top: { xs: 12, md: 20 },
        }}
      >
        <Typography
          variant="control"
          sx={legendTitleSx}
        >
          Drought Severity
        </Typography>
        <Typography variant="chartLabel" sx={legendHelperSx}>
          Least severe active category by county
        </Typography>
        {["Abnormally Dry", "Moderate", "Severe", "Extreme", "Exceptional"].map(
          (label, i) => (
            <Box
              key={label}
              sx={legendRowSx}
            >
              <Box
                sx={{
                  ...legendSwatchSx,
                  backgroundColor: DROUGHT_COLORS[i],
                }}
              />
              <Typography
                variant="chartLabel"
                sx={{
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {label}
              </Typography>
            </Box>
          )
        )}
      </Box>
    )}

    {isCompareLand && compareAspect === 0 && (
      <Box
        sx={{
          ...legendPanelSx,
          top: { xs: 12, md: 20 },
        }}
      >
        <Typography
          variant="control"
          sx={legendTitleSx}
        >
          Colusa Rice Acreage
        </Typography>
        <Typography variant="chartLabel" sx={legendHelperSx}>
          Compare cultivated rice acreage before and during drought.
        </Typography>
        {[
          { color: "#1B5E20", label: "2019" },
          { color: "#A5D6A7", label: "2022" },
        ].map(({ color, label }) => (
          <Box
            key={label}
            sx={legendRowSx}
          >
            <Box
              sx={{
                ...legendSwatchSx,
                backgroundColor: color,
              }}
            />
            <Typography
              variant="chartLabel"
              sx={{
                color: "white",
                fontWeight: 600,
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    )}

    {isCentralValleyCropStep && (
      <Box
        sx={{
          ...legendPanelSx,
          bottom: { xs: 12, md: 30 },
          zIndex: 9999,
        }}
      >
        <Typography
          variant="control"
          sx={legendTitleSx}
        >
          Crop Type
        </Typography>
        <Typography
          variant="chartLabel"
          sx={legendHelperSx}
        >
          Hover a crop to highlight it on the map
        </Typography>

        {(isReducedCropStep
          ? CROP_LEGEND.filter(({ code }) => code === "T" || code === "V")
          : CROP_LEGEND
        ).map(({ code, color, label }) => {
          const isActive = hoveredCropCode === code;
          // const isDimmed = hoveredCropCode !== null && hoveredCropCode !== code;

          return (
            <Box
              key={code}
              onMouseEnter={() => setHoveredCropCode(code)}
              onMouseLeave={() => setHoveredCropCode(null)}
              sx={{
                ...legendRowSx,
                cursor: "pointer",
                pointerEvents: "auto",
                opacity: hoveredCropCode === null ? 1 : isActive ? 1 : 0.4,
                transition:
                  "opacity 0.2s ease, background 0.2s ease, transform 0.2s ease",
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                transform: isActive ? "translateX(2px)" : "none",
                "&:hover": {
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Box
                sx={{
                  ...legendSwatchSx,
                  backgroundColor: color,
                  boxShadow: isActive ? `0 0 8px ${color}` : "none",
                  transition: "box-shadow 0.2s ease, opacity 0.2s ease",
                }}
              />
              <Typography
                variant="chartLabel"
                sx={{
                  color: "white",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    )}
    </Box>
  );
}
