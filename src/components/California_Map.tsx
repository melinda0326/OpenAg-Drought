import { useCallback, useEffect, useRef, useState } from "react";
import Map, { Layer, NavigationControl, Source, Marker } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import type { FeatureCollection, Geometry } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

/* ── Responsive connecting line between a map point and a DOM element ── */
// function ConnectingLine({
//   mapRef,
//   lngLat,
//   targetId,
// }: {
//   mapRef: React.RefObject<MapRef | null>;
//   lngLat: [number, number];
//   targetId: string;
// }) {
//   const [coords, setCoords] = useState<{
//     x1: number;
//     y1: number;
//     x2: number;
//     y2: number;
//     opacity: number;
//   } | null>(null);

//   const update = useCallback(() => {
//     const map = mapRef.current?.getMap();
//     const target = document.getElementById(targetId);
//     if (!map || !target) {
//       setCoords(null);
//       return;
//     }

//     const projected = map.project(lngLat);
//     const rect = target.getBoundingClientRect();

//     const viewportH = window.innerHeight;
//     const viewportW = window.innerWidth;

//     // how much of target is vertically visible
//     const visibleTop = Math.max(rect.top, 0);
//     const visibleBottom = Math.min(rect.bottom, viewportH);
//     const visibleHeight = Math.max(0, visibleBottom - visibleTop);
//     const visibilityRatio = rect.height > 0 ? visibleHeight / rect.height : 0;

//     // hide line if target is basically off screen
//     if (
//       rect.right < 0 ||
//       rect.left > viewportW ||
//       rect.bottom < 0 ||
//       rect.top > viewportH ||
//       visibilityRatio <= 0.08
//     ) {
//       setCoords(null);
//       return;
//     }

//     // fade line as target leaves viewport
//     const opacity = Math.max(0, Math.min(1, visibilityRatio));
//     setCoords({
//       x1: projected.x,
//       y1: projected.y,
//       x2: rect.left,
//       y2: rect.top + rect.height / 2,
//       opacity,
//     });
//   }, [mapRef, lngLat, targetId]);

//   useEffect(() => {
//     const map = mapRef.current?.getMap();
//     if (!map) return;

//     // Update on every frame the map moves, and on scroll/resize
//     map.on("move", update);
//     window.addEventListener("scroll", update, true);
//     window.addEventListener("resize", update);

//     // Initial position
//     update();
//     // Also run on next frame to catch layout settling
//     const raf = requestAnimationFrame(update);

//     return () => {
//       map.off("move", update);
//       window.removeEventListener("scroll", update, true);
//       window.removeEventListener("resize", update);
//       cancelAnimationFrame(raf);
//     };
//   }, [mapRef, update]);

//   // Also update on any scroll (content scrolls over fixed map)
//   useEffect(() => {
//     let ticking = false;
//     const onScroll = () => {
//       if (!ticking) {
//         ticking = true;
//         requestAnimationFrame(() => {
//           update();
//           ticking = false;
//         });
//       }
//     };
//     window.addEventListener("scroll", onScroll, true);
//     return () => window.removeEventListener("scroll", onScroll, true);
//   }, [update]);

//   if (!coords) return null;

//   return (
//     <svg
//       style={{
//         position: "fixed",
//         inset: 0,
//         width: "100vw",
//         height: "100vh",
//         pointerEvents: "none",
//         zIndex: 5,
//       }}
//     >
//       <line
//         x1={coords.x1}
//         y1={coords.y1}
//         x2={coords.x2}
//         y2={coords.y2}
//         stroke="white"
//         strokeWidth="2"
//         strokeDasharray="6 4"
//         opacity={0.75 * coords.opacity}
//       />
//       <circle
//         cx={coords.x1}
//         cy={coords.y1}
//         r="4"
//         fill="white"
//         opacity={0.9 * coords.opacity}
//       />
//     </svg>
//   );
// }

// const CA_BOUNDS: [[number, number], [number, number]] = [
//   [-140.48, 32.53],
//   [-114.13, 42.01],
// ];

function ConnectingLine({
  mapRef,
  lngLat,
  targetId,
}: {
  mapRef: React.RefObject<MapRef | null>;
  lngLat: [number, number];
  targetId: string;
}) {
  const [coords, setCoords] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    opacity: number;
  } | null>(null);

  const update = useCallback(() => {
    const map = mapRef.current?.getMap();
    const target = document.getElementById(targetId);

    if (!map || !target) {
      setCoords(null);
      return;
    }

    const projected = map.project(lngLat);
    const rect = target.getBoundingClientRect();

    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewportH);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibilityRatio = rect.height > 0 ? visibleHeight / rect.height : 0;

    if (
      rect.right < 0 ||
      rect.left > viewportW ||
      rect.bottom < 0 ||
      rect.top > viewportH ||
      visibilityRatio <= 0.08
    ) {
      setCoords(null);
      return;
    }

    const t = Math.max(0, Math.min(1, visibilityRatio));

    // point to the middle of the number text
    const targetX = rect.left + 8;
    const targetY = rect.top + rect.height / 2;

    // retract line as target leaves viewport
    const x2 = projected.x + (targetX - projected.x) * t;
    const y2 = projected.y + (targetY - projected.y) * t;

    setCoords({
      x1: projected.x,
      y1: projected.y,
      x2,
      y2,
      opacity: t,
    });
  }, [mapRef, lngLat, targetId]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.on("move", update);
    map.on("zoom", update);
    map.on("rotate", update);
    map.on("pitch", update);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    update();
    const raf = requestAnimationFrame(update);

    return () => {
      map.off("move", update);
      map.off("zoom", update);
      map.off("rotate", update);
      map.off("pitch", update);

      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);

      cancelAnimationFrame(raf);
    };
  }, [mapRef, update]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [update]);

  if (!coords) return null;

  return (
    <svg
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke="white"
        strokeWidth={2}
        strokeDasharray="6 4"
        opacity={0.75 * coords.opacity}
      />
      <circle
        cx={coords.x1}
        cy={coords.y1}
        r={4}
        fill="white"
        opacity={0.9 * coords.opacity}
      />
    </svg>
  );
}

const CA_BOUNDS : [[number, number], [number, number]] = [
  [-138, 33],   // move inward
  [-115, 41],
];

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
  | "open-exploration";

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
};

const DROUGHT_COLORS = ["#FFE5CC", "#FFB366", "#FF8C1A", "#E67300", "#B34700"];

export default function CaliforniaMap({
  activeSection,
  onLoad,
  geojsonWithValue,
  shortage,
  droughtGeojson,
  countyGeojson,
}: CaliforniaMapProps) {

  console.log("activeSection:", activeSection);
  const mapRef = useRef<MapRef | null>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  const isCentralValleyCropStep = activeSection === "state-crop-cv" || activeSection === "state-crop-rv" || activeSection === "state-crop-emp" ;
  const isReducedCropStep = activeSection === "state-crop-rv" || activeSection === "state-crop-emp";
  const isCompareLand = activeSection === "compare-land";
  const isCompareRev = activeSection === "compare-rev";
  const cameraMode = isCompareLand ? "colusa" : isReducedCropStep ? "cv-rv" : isCentralValleyCropStep ? "cv" : "state";

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
        }
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
    } else {
      map.fitBounds(CA_BOUNDS, {
        padding: {
        left: 300,
        right: 50,
        top: 30,     // ↓ reduce these
        bottom: 30,  // ↓ reduce these
      },
        duration: 1800,
      });
    }
  }, [cameraMode]);

  if (!token) {
    return (
      <div style={{ padding: 16, color: "white" }}>
        Missing <code>VITE_MAPBOX_TOKEN</code>. Add it to <code>.env</code> and restart the dev server.
      </div>
    );
  }

  const CROP_LEGEND = [
  { code: "G",  color: "#C2A83E", label: "Grain & Hay" },                // wheat / hay gold
  { code: "R",  color: "#5FA8D3", label: "Rice" },                       // watery blue
  { code: "F",  color: "#6DA34D", label: "Field Crops" },                // crop green
  { code: "P",  color: "#A3B18A", label: "Pasture" },                    // muted grass green
  { code: "T",  color: "#db3923", label: "Truck & Berry" },              // produce orange
  { code: "D",  color: "#f7c46a", label: "Deciduous Fruits & Nuts" },    // orchard brown
  { code: "C",  color: "#d17819", label: "Citrus & Subtropical" },       // citrus yellow
  { code: "V",  color: "#6F4E7C", label: "Vineyard" },                   // grape purple
  { code: "YP", color: "#D4A373", label: "Young Perennial" },            // light tan / young wood
];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{ bounds: CA_BOUNDS, fitBoundsOptions: { padding: 120 },}}
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
    >
      {activeSection === "opener" && (
        <Marker longitude={-120.3} latitude={37.1} anchor="bottom">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
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
            </div>

            {/* <div
              style={{
                marginTop: 10,
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                whiteSpace: "nowrap",
              }}
            >
              Drought Land in Central Valley
            </div> */}

            {/* <div
              style={{
                marginTop: 20,
                color: "white",
                fontSize: "var(--body-size)",
                fontWeight: 600,
                whiteSpace: "nowrap",
                display: "inline-block",
                padding: "6px 10px",
                background: "rgba(0, 0, 0, 0.55)",
                borderRadius: "8px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            >
              Drought Land in Central Valley
            </div> */}

        <div
          style={{
            marginTop: 20,
            color: "white",
            fontSize: "var(--body-size)",
            fontWeight: 600,
            whiteSpace: "nowrap",
            display: "inline-block",
            padding: "6px 10px",
            background: "rgba(0, 0, 0, 0.4)",
            borderRadius: "8px",
            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          }}
        >
          Drought Land in Central Valley
        </div>
          </div>
        </Marker>
      )}

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
                  ["max", -600, ["min", ["get", "mapValue"], 0]],
                  -600, "#990000",
                  -450, "#e60000",
                  -300, "#ff4d4d",
                  -150, "#ff9999",
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

      {activeSection == "state-crop" && (
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
              "line-opacity": 1,
            }}
          />
        </Source>
      )}

      {isCentralValleyCropStep && (
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
                    // "match",
                    // ["get", "SYMB_CLASS"],
                    // "G", "#E9C46A",
                    // "R", "#4EA8DE",
                    // "F", "#52B788",
                    // "P", "#ADB5BD",
                    // "T", "#F4A261",
                    // "D", "#C77DFF",
                    // "C", "#FFD166",
                    // "V", "#6D597A",
                    // "YP", "#2A9D8F",
                    // "#D9D9D9",
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
              "fill-opacity": 0.88,
              "fill-outline-color": "transparent",
              "fill-antialias": true,
            }}
          />
        </Source>
      )}

      {isCompareLand && (
        <>
          {/* 2019 layer (bottom — larger area) */}
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
                "fill-opacity": 0.85,
              }}
            />
          </Source>
          {/* 2022 layer (top — smaller area, sits on top of 2019) */}
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
                "fill-opacity": 0.85,
              }}
            />
          </Source>

          {/* Colusa county boundary highlight */}
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

          {/* Colusa label */}
          <Marker longitude={-122.1} latitude={38.85} anchor="bottom">
            <div
              style={{
                color: "white",
                fontSize: "var(--body-size)",
                fontWeight: 700,
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              Colusa County
            </div>
          </Marker>
        </>
      )}

      {/* ── Compare-Rev: Colusa county highlight + connecting line ── */}
      {isCompareRev && countyGeojson && (
        <>
          <Source id="colusa-rev-boundary" type="geojson" data={countyGeojson}>
            <Layer
              id="colusa-rev-glow"
              type="line"
              filter={["==", ["get", "CountyName"], "Colusa"]}
              paint={{
                "line-color": "rgba(255,255,255,0.3)",
                "line-width": 6,
              }}
            />
            <Layer
              id="colusa-rev-line"
              type="line"
              filter={["==", ["get", "CountyName"], "Colusa"]}
              paint={{
                "line-color": "#ffffff",
                "line-width": 2.5,
              }}
            />
            <Layer
              id="colusa-rev-fill"
              type="fill"
              filter={["==", ["get", "CountyName"], "Colusa"]}
              paint={{
                "fill-color": "#E65100",
                "fill-opacity": 0.35,
              }}
            />
          </Source>

          {/* Colusa label */}
          <Marker longitude={-122.23} latitude={39.18} anchor="center">
            <div
              style={{
                color: "white",
                fontSize: "var(--body-size)",
                fontWeight: 700,
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              Colusa County
            </div>
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
              "fill-opacity": 0.7,
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

    {/* Connecting line: Colusa → pictogram */}
    {isCompareRev && (
      <ConnectingLine
  mapRef={mapRef}
  lngLat={[-122.23, 39.18]}
  targetId="pictogram-revenue-number"
/>
    )}

    {/* Drought legend */}
    {activeSection === "drought_monitor" && (
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "var(--body-size)",
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          Drought Severity
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
                  fontSize: "var(--body-size)",
                }}
              >
                {label}
              </span>
            </div>
          )
        )}
      </div>
    )}

    {isCompareLand && (
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "var(--body-size)",
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          Colusa Rice Acreage
        </span>
        {[
          { color: "#1B5E20", label: "2019" },
          { color: "#A5D6A7", label: "2022" },
        ].map(({ color, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "white",
                fontSize: "var(--body-size)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    )}

    {isCentralValleyCropStep && (
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 20,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "Inter, system-ui, sans-serif",
            marginBottom: 2,
          }}
        >
          Crop Type
        </span>
        {(isReducedCropStep
          ? CROP_LEGEND.filter(({ code }) => code === "T" || code === "V")
          : CROP_LEGEND
        ).map(({ code, color, label }) => (
          <div
            key={code}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                backgroundColor: color,
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
        ))}
      </div>
    )}
    </div>
  );
}