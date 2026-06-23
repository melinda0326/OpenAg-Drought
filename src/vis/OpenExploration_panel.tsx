import React from "react";
import { Typography } from "@mui/material";
import { openExplorationStyles as S } from "../components/ui/openExplorationStyles";

export type MetricKey = "xland_pct" | "xwater_pct" | "revenue_pct";

const CENTRAL_VALLEY_COUNTIES = new Set([
  "butte", "colusa", "contra costa", "glenn", "fresno", "kern",
  "kings", "madera", "merced", "placer", "san joaquin",
  "sacramento", "shasta", "solano", "stanislaus", "sutter",
  "tehama", "tulare", "yolo", "yuba",
]);

type Props = {
  metric: MetricKey;
  setMetric: (m: MetricKey) => void;

  shortagePct: number; // 0..99
  setShortagePct: (v: number) => void;

  // multi-select
  selectedCounties: string[];
  setSelectedCounties: (v: string[]) => void;

  // options (already filtered to Central Valley, normalized)
  countyOptions: { norm: string; label: string }[];

  loading: boolean;
  error: string | null;
};

export default function OpenExplorationPanel({
  metric,
  setMetric,
  shortagePct,
  setShortagePct,
  selectedCounties,
  setSelectedCounties,
  countyOptions,
  loading,
  error,
}: Props) {
  const toggle = (norm: string) => {
    setSelectedCounties(
      selectedCounties.includes(norm)
        ? selectedCounties.filter((c) => c !== norm)
        : [...selectedCounties, norm]
    );
  };

  const clearAll = () => setSelectedCounties([]);

  const [pick, setPick] = React.useState<string>("");
  const [sliderTouched, setSliderTouched] = React.useState(false);

  const addPicked = () => {
    if (!pick) return;
    if (!selectedCounties.includes(pick)) {
      setSelectedCounties([...selectedCounties, pick]);
    }
    setPick("");
  };

  // const metricLabel =
  //   metric === "revenue_pct"
  //     ? "crop revenues"
  //     : metric === "xwater_pct"
  //     ? "water usage"
  //     : "land acreage";

  return (
  <div>
    {/* ── Step 1: Choose a metric ── */}
    <div style={S.stepRow}>
      <Typography variant="body1" style={S.stepNum}>
        1
      </Typography>
      <Typography variant="body1" style={S.stepTitle}>
        Choose a metric
      </Typography>
    </div>

    <Typography variant="body1" gutterBottom>
      What impact do you want to see on the map?
    </Typography>

    <div style={S.segmented}>
      <button
        style={S.segBtn(metric === "revenue_pct")}
        onClick={() => setMetric("revenue_pct")}
      >
        <Typography variant="body1">
          Crop revenue
        </Typography>
      </button>

      <button
        style={S.segBtn(metric === "xwater_pct")}
        onClick={() => setMetric("xwater_pct")}
      >
        <Typography variant="body1">
          Water use
        </Typography>
      </button>

      <button
        style={S.segBtn(metric === "xland_pct")}
        onClick={() => setMetric("xland_pct")}
      >
        <Typography variant="body1">
          Land
        </Typography>
      </button>
    </div>

    <div style={S.divider} />

    {/* ── Step 2: Set water shortage ── */}
    <div style={S.stepRow}>
      <Typography variant="body1"  style={S.stepNum}>
        2
      </Typography>
      <Typography variant="body1" style={S.stepTitle}>
        Set water shortage
      </Typography>
    </div>

    <Typography variant="body1" gutterBottom>
      How severe is the drought?
    </Typography>

    <div style={{ ...S.sliderWrap }}>
      <div style={S.sliderTopRow}>
        <Typography variant="body1">Shortage level</Typography>

        <Typography variant="body1" style={S.sliderValue}>
          {shortagePct}%
        </Typography>
      </div>

      {(() => {
        const pct = shortagePct / 99;
        const thumbHalf = 10;
        const glowLeft = `calc(${thumbHalf}px + ${pct} * (100% - ${
          thumbHalf * 2
        }px))`;

        return (
          <div style={{ position: "relative" }}>
            <input
              type="range"
              min={0}
              max={99}
              step={1}
              value={shortagePct}
              className="colored-track"
              onChange={(e) => {
                if (!sliderTouched) setSliderTouched(true);
                setShortagePct(Number(e.target.value));
              }}
              style={{
                position: "relative",
                zIndex: 2,
                ["--slider-pct" as any]: `${pct * 100}%`,
              }}
            />

            {!sliderTouched && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: glowLeft,
                  transform: "translate(-50%, -50%)",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  pointerEvents: "none",
                  zIndex: 1,
                  animation: "thumbGlow 1.8s ease-in-out infinite",
                }}
              />
            )}
          </div>
        );
      })()}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          opacity: 0.7,
        }}
      >
        <Typography component="span" variant="body2">
          0% — no shortage
        </Typography>

        <Typography component="span" variant="body2">
          99% — extreme
        </Typography>
      </div>
    </div>

    <div style={S.divider} />

    {/* ── Step 3: Select counties ── */}
    <div style={S.stepRow}>
      <Typography component="span" variant="body1"style={S.stepNum}>
        3
      </Typography>
      <Typography component="span" variant="body1" style={S.stepTitle}>
        Select counties
      </Typography>
    </div>

    <Typography variant="body1" gutterBottom>
      Click the map or pick from the list below
    </Typography>

    {!loading && !error && (() => {
      const cvOptions = countyOptions.filter((c) => CENTRAL_VALLEY_COUNTIES.has(c.norm));
      const allCvSelected = cvOptions.length > 0 && cvOptions.every((c) => selectedCounties.includes(c.norm));

      return (
        <button
          style={{ ...S.pill(allCvSelected), marginBottom: 10 }}
          onClick={() => {
            if (allCvSelected) {
              setSelectedCounties(selectedCounties.filter((c) => !CENTRAL_VALLEY_COUNTIES.has(c)));
            } else {
              const cvNorms = cvOptions.map((c) => c.norm);
              const others = selectedCounties.filter((c) => !CENTRAL_VALLEY_COUNTIES.has(c));
              setSelectedCounties([...others, ...cvNorms]);
            }
          }}
        >
          <Typography component="span" variant="body2">
            {allCvSelected ? "Deselect Central Valley" : "Select Central Valley"}
          </Typography>
        </button>
      );
    })()}

    {loading && (
      <Typography variant="body1" sx={{ opacity: 0.85 }}>
        Loading GeoJSON + CSV…
      </Typography>
    )}

    {error && (
      <Typography variant="body2" sx={{ color: "#fecaca" }}>
        {error}
      </Typography>
    )}

    {!loading && !error && (
      <>
        {/* Dropdown selector */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              outline: "none",
              fontSize: 13,
            }}
          >
            <option value="" style={{ color: "black" }}>
              Select a county...
            </option>
            {countyOptions.map((c) => (
              <option key={c.norm} value={c.norm} style={{ color: "black" }}>
                {c.label}
              </option>
            ))}
          </select>

          <button style={S.pill(false)} onClick={addPicked} disabled={!pick}>
            <Typography component="span" variant="body2">
              Add
            </Typography>
          </button>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <button
            style={S.pill(false)}
            onClick={clearAll}
            disabled={selectedCounties.length === 0}
          >
            <Typography component="span" variant="body2">
              Clear
            </Typography>
          </button>

          <Typography
            variant="body2"
            sx={{
              marginLeft: "auto",
              opacity: 0.7,
            }}
          >
            {selectedCounties.length}/{countyOptions.length} selected
          </Typography>
        </div>

        {/* Selected counties chips */}
        {selectedCounties.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 8,
            }}
          >
            {selectedCounties.map((norm) => {
              const label =
                countyOptions.find((c) => c.norm === norm)?.label ?? norm;

              return (
                <button
                  key={norm}
                  onClick={() => toggle(norm)}
                  style={{
                    borderRadius: 999,
                    padding: "4px 8px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Typography component="span" variant="body2">
                    {label}
                  </Typography>

                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                      fontWeight: 900,
                    }}
                  >
                    ×
                  </Typography>
                </button>
              );
            })}
          </div>
        )}
      </>
    )}
  </div>
);
}
