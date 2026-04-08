import { useEffect, useMemo, useState } from "react";
import Map from "react-map-gl";
import type { FeatureCollection, Geometry } from "geojson";
import { Scrollama, Step } from "react-scrollama";

const CA_VIEW = {
  longitude: -126.4179,
  latitude: 38.7783,
  zoom: 5.5,
  bearing: 0,
  pitch: 0,
} as const;


type StepId = 0 | 1 | 2 | 3;

type StepItem = {
  id: StepId;
  title: string;
  body: string;
};

export default function ScrollyCaliforniaMap(){
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  const [, setGeojsonData] = useState<FeatureCollection<Geometry> | null>(null);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<StepId>(0);

  const steps = useMemo<StepItem[]>(
    () => [
      {
        id: 0,
        title: "California’s balance",
        body: "For decades, agriculture depended on a delicate balance between land and water.",
      },
      {
        id: 1,
        title: "Too little water → drought",
        body: "Drought reduces irrigation supply, stresses crops, and forces harder choices.",
      },
      {
        id: 2,
        title: "Too much water → flooding",
        body: "Floods can erode soil, wash nutrients away, and damage fields and infrastructure.",
      },
      {
        id: 3,
        title: "The balance is breaking",
        body: "The system is tipping toward more frequent and intense drought conditions.",
      },
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/data/california_counties.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load GeoJSON");
        return res.json();
      })
      .then((data: FeatureCollection<Geometry>) => {
        if (cancelled) return;
        setGeojsonData(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!token) {
    return (
      <div style={{ padding: 16 }}>
        Missing <code>VITE_MAPBOX_TOKEN</code>. Add it to <code>.env</code> and restart the dev server.
      </div>
    );
  }

  const onStepEnter = ({
    data,
  }: {
    data: StepId;
    direction: "up" | "down";
    entry: IntersectionObserverEntry;
  }) => {
    setCurrentStep(data);
  };

  return (
  <div style={{ position: "relative", width: "100vw", minHeight: "200vh" }}>
    {/* BACKGROUND MAP */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
    >
      <Map
        mapboxAccessToken={token}
        initialViewState={CA_VIEW}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        style={{ width: "100%", height: "100%" }}
        dragPan={false}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
      />
    </div>

    {/* FOREGROUND CONTENT */}
    <div
      style={{
        position: "relative",
        zIndex: 1,
        pointerEvents: "none", // important!
      }}
    >
      <div
        style={{
          maxWidth: 720,
          marginLeft: 80,
          paddingTop: "20vh",
        }}
      >
        <Scrollama onStepEnter={onStepEnter} offset={0.6}>
          {steps.map((s) => {
            const active = currentStep === s.id;
            return (
              <Step<StepId> data={s.id} key={s.id}>
                <div
                  style={{
                    marginBottom: 360,
                    padding: "12px 0",
                    pointerEvents: "auto",
                  }}
                >
                  <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    marginBottom: 12,
                    color: "white",
                    textShadow: "0 2px 8px rgba(0,0,0,0.85)",
                  }}
                >
                  {s.title}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1.6,
                    color: "white",
                    maxWidth: 520,
                    textShadow: "0 2px 8px rgba(0,0,0,0.85)",
                    opacity: active ? 1 : 0.75,
                    transition: "opacity 200ms ease",
                  }}
                >
                  {s.body}
                </div>
                </div>
              </Step>
            );
          })}
        </Scrollama>
      </div>
    </div>
  </div>
);
}

