import React from "react";
import { openExplorationStyles as S } from "../components/ui/openExplorationStyles";

export type MetricKey = "xland_pct" | "xwater_pct" | "revenue_pct";

type Props = {
  metric: MetricKey;
  setMetric: (m: MetricKey) => void;

  shortagePct: number; // 0..99
  setShortagePct: (v: number) => void;

  // ✅ multi-select
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

        const CENTRAL_VALLEY_DEFAULT = [
            "butte",
            "colusa",
            "fresno",
            "glenn",
            "kern",
            "kings",
            "madera",
            "merced",
            "sacramento",
            "san joaquin",
            "stanislaus",
            "sutter",
            "tulare",
            "yolo",
            "yuba",
            ] as const;
    const selectCentralValley = () => {
        const available = new Set(countyOptions.map((d) => d.norm));
        const cv = CENTRAL_VALLEY_DEFAULT.filter((c) => available.has(c));
        setSelectedCounties(cv);
        };
    const clearAll = () => setSelectedCounties([]);


    const [pick, setPick] = React.useState<string>("");
    // const [query, setQuery] = React.useState("");

    // const filteredOptions = React.useMemo(() => {
    // const q = query.trim().toLowerCase();
    // if (!q) return countyOptions;
    // return countyOptions.filter((c) => c.label.toLowerCase().includes(q));
    // }, [query, countyOptions]);


    const addPicked = () => {
    if (!pick) return;
    if (!selectedCounties.includes(pick)) {
        setSelectedCounties([...selectedCounties, pick]);
    }
    setPick(""); // reset dropdown
    };

  return (
    <div>
      {/* Legend */}
      <div>
        <div style={{ ...S.sectionLabel, textAlign: "center" }}>
          <span style={{ opacity: 0.85 }}>% change in </span>
          <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: 0.2 }}>
            {metric === "revenue_pct"
              ? "crop revenues"
              : metric === "xwater_pct"
              ? "water usage"
              : "land acreage"}
          </span>
        </div>

        <div style={S.legendBar("linear-gradient(to left, #ffe5e5, #ff9999, #ff4d4d, #e60000, #990000)")} />

        <div style={S.legendTicks}>
          <span>-600%</span>
          <span>-450%</span>
          <span>-300%</span>
          <span>-150%</span>
          <span>0%</span>
        </div>
      </div>

      {/* Metric selector */}
      <div style={{ marginTop: 10 }}>
        <div style={{ ...S.sectionLabel, textAlign: "center" }}>METRIC</div>
        <div style={S.segmented}>
          <button style={S.segBtn(metric === "revenue_pct")} onClick={() => setMetric("revenue_pct")}>
            Crop revenue
          </button>
          <button style={S.segBtn(metric === "xwater_pct")} onClick={() => setMetric("xwater_pct")}>
            Water use
          </button>
          <button style={S.segBtn(metric === "xland_pct")} onClick={() => setMetric("xland_pct")}>
            Land
          </button>
        </div>
      </div>

      {/* <p style={{ ...S.hint, marginTop: 6, marginBottom: 0, textAlign: "center" }}>
        Hover on a county to see exact values.
      </p> */}

      <div style={S.divider} />

      {loading && <div style={{ opacity: 0.85 }}>Loading GeoJSON + CSV…</div>}
      {error && <div style={{ color: "#fecaca", fontSize: 13 }}>{error}</div>}

      {!loading && !error && (
        <>
          {/* ✅ Multi-select list */}
          {/* ✅ County selector (search + chips) */}
<div style={{ ...S.sectionLabel, textAlign: "center" }}>COUNTIES</div>

{/* dropdown selector */}
<div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
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

  <button
    style={S.pill(false)}
    onClick={addPicked}
    disabled={!pick}
  >
    Add
  </button>
</div>

{/* actions */}
<div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
  <button style={S.pill(false)} onClick={selectCentralValley}>
    Select Central Valley
    </button>

  <button
    style={S.pill(false)}
    onClick={clearAll}
    disabled={selectedCounties.length === 0}
  >
    Clear
  </button>

  <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
    {selectedCounties.length}/{countyOptions.length} selected
  </div>
</div>

{/* selected counties chips */}
{selectedCounties.length > 0 && (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 8,
      maxHeight: 70,
      overflowY: "auto",
    }}
  >
    {selectedCounties.map((norm) => {
      const label = countyOptions.find((c) => c.norm === norm)?.label ?? norm;

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
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{label}</span>
          <span style={{ opacity: 0.7, fontWeight: 900 }}>×</span>
        </button>
      );
    })}
  </div>
)}

          {/* Shortage slider */}
          <div style={{ ...S.sliderWrap, marginTop: 8 }}>
            <div style={S.sliderTopRow}>
              <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 800 }}>
                Water Shortage Level
              </div>
              <div style={S.sliderValue}>{shortagePct}%</div>
            </div>

            <input
              type="range"
              min={0}
              max={99}
              step={1}
              value={shortagePct}
              onChange={(e) => setShortagePct(Number(e.target.value))}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 11,
                opacity: 0.7,
              }}
            >
              <span>0%</span>
              <span>50%</span>
              <span>99%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}