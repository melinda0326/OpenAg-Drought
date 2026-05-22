
import React, { useMemo, useState } from "react";
import type { CsvRow } from "../components/OpenExploration";
import { openExplorationStyles as S } from "../components/ui/openExplorationStyles";
import Pictogram from "./Pictogram_Open";
import { Typography } from "@mui/material";

type MetricKey = "xland_pct" | "xwater_pct" | "revenue_pct";
type MetricAbsKey = "land" | "water" | "revenue";

const METRIC_MAP: Record<MetricKey, MetricAbsKey> = {
  revenue_pct: "revenue",
  xwater_pct: "water",
  xland_pct: "land",
};

const METRIC_TITLE: Record<MetricKey, string> = {
  revenue_pct: "Crop Revenue",
  xwater_pct: "Water Usage",
  xland_pct: "Land Acreage",
};

const METRIC_SQUARE_VALUE: Record<MetricKey, number> = {
  revenue_pct: 50_000_000,   // each square = $10M
  xwater_pct: 20_000,        // each square = 10K acre-ft
  xland_pct: 10_000,          // each square = 5K acres
};

const METRIC_UNIT: Record<MetricKey, string> = {
  revenue_pct: "",
  xwater_pct: "acre-ft",
  xland_pct: "acreage",
};

function normalizeCountyName(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+county$/, "")
    .replace(/[.\-']/g, "")
    .replace(/\s+/g, " ");
}

function titleCaseCounty(norm: string) {
  return norm
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function asNum(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function MetricMiniChart({
  title,
  counties,
  baseVals,
  scVals,
}: {
  title: string;
  counties: string[];
  baseVals: number[];
  scVals: number[];
}) {
  const width = 720;
  const height = 350;
  const margin = { top: 30, right: 10, bottom: 90, left: 24 };

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const maxVal = Math.max(0, ...baseVals, ...scVals);

  const y = (v: number) => {
    const denom = maxVal === 0 ? 1 : maxVal;
    return margin.top + innerH * (1 - v / denom);
  };

  const n = Math.max(1, counties.length);
  const groupW = innerW / n;
  const barW = Math.max(18, Math.min(34, groupW - 12));

  const baselineY = margin.top + innerH;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div style={S.sectionLabel}>{title}</div>

      {counties.length === 0 ? (
        <div style={S.hint}>No data to display.</div>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            fontFamily: "inherit",
            fontSize: S.hint.fontSize,
          }}
        >
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={baselineY}
            y2={baselineY}
            stroke="rgba(255,255,255,0.45)"
          />

          <g transform={`translate(${width - margin.right}, ${margin.top - 20})`}>
            {(() => {
              const box = 10;
              const gap = 6;
              const colGap = 14;

              const label1 = "Without Shortage";
              const label2 = "With Shortage";

              const w1 = 112;
              const w2 = 92;
              const totalW = box + gap + w1 + colGap + box + gap + w2;
              const x0 = -totalW;

              return (
                <g>
                  <rect
                    x={x0}
                    y={0}
                    width={box}
                    height={box}
                    fill="rgba(255,255,255,0.1)"
                    stroke="white"
                  />
                  <text x={x0 + box + gap} y={box - 1} fill="white">
                    {label1}
                  </text>

                  <rect
                    x={x0 + box + gap + w1 + colGap}
                    y={0}
                    width={box}
                    height={box}
                    fill="rgba(255,255,255,0.35)"
                    stroke="white"
                  />
                  <text
                    x={x0 + box + gap + w1 + colGap + box + gap}
                    y={box - 1}
                    fill="white"
                  >
                    {label2}
                  </text>
                </g>
              );
            })()}
          </g>

          {counties.map((c, i) => {
            const x0 = margin.left + i * groupW;
            const base = Math.max(0, baseVals[i] ?? 0);
            const scRaw = Math.max(0, scVals[i] ?? 0);
            const sc = Math.min(scRaw, base);

            const yBase = y(base);
            const ySc = y(sc);

            const barX = x0 + groupW / 2 - barW / 2;
            const baseH = baselineY - yBase;
            const scH = baselineY - ySc;

            return (
              <g key={c}>
                <rect
                  x={barX}
                  y={yBase}
                  width={barW}
                  height={baseH}
                  rx={2}
                  fill="rgba(255,255,255,0.1)"
                  stroke="white"
                />

                <rect
                  x={barX}
                  y={ySc}
                  width={barW}
                  height={scH}
                  rx={2}
                  fill="rgba(255,255,255,0.35)"
                  stroke="white"
                />

                <g
                  transform={`translate(${x0 + groupW / 2}, ${
                    height - margin.bottom + 18
                  }) rotate(-55)`}
                >
                  <text
                    textAnchor="end"
                    fill="rgba(255,255,255,0.9)"
                    fontSize={S.hint.fontSize}
                  >
                    {titleCaseCounty(c)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

function formatSquareLegend(v: number, unit = ""): string {
  const abs = Math.abs(v);
  let text = "";

  if (abs >= 1_000_000_000) text = `${(v / 1_000_000_000).toFixed(0)}B`;
  else if (abs >= 1_000_000) text = `${(v / 1_000_000).toFixed(0)}M`;
  else if (abs >= 1_000) text = `${(v / 1_000).toFixed(0)}K`;
  else text = `${Math.round(v)}`;

  return unit ? `${text} ${unit}` : text;
}

export default function CentralValleyBaseScenarioBars({
  rows,
  shortage,
  metric,
  selectedCounties,
}: {
  rows: CsvRow[];
  shortage: number;
  metric: MetricKey;
  selectedCounties: string[];
}) {
  const data = useMemo(() => {
    const target = Math.round(shortage * 100) / 100;
    const acc = new globalThis.Map<string, { base: number; sc: number }>();
    const absKey = METRIC_MAP[metric];

    if (!selectedCounties || selectedCounties.length === 0) {
      return { counties: [], baseVals: [], scVals: [] };
    }

    const allowed = new Set(selectedCounties.map(normalizeCountyName));

    for (const r of rows) {
      const s = Math.round((r.shortage ?? 0) * 100) / 100;
      if (s !== target) continue;

      const county = normalizeCountyName(r.region);
      if (!county) continue;
      if (!allowed.has(county)) continue;

      const cur = acc.get(county) ?? { base: 0, sc: 0 };

      let baseVal: number | null = null;
      let scVal: number | null = null;

      if (absKey === "land") {
        baseVal = asNum(r.xland_base);
        scVal = asNum(r.xlandsc);
      } else if (absKey === "water") {
        baseVal = asNum(r.xwater_base);
        scVal = asNum(r.xwatersc);
      } else {
        baseVal = asNum(r.revenue_base);
        scVal = asNum(r.revenuesc);
      }

      if (baseVal !== null) cur.base += baseVal;
      if (scVal !== null) cur.sc += scVal;

      acc.set(county, cur);
    }

    const ordered = Array.from(acc.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return {
      counties: ordered.map(([c]) => c),
      baseVals: ordered.map(([, v]) => v.base),
      scVals: ordered.map(([, v]) => v.sc),
    };
  }, [rows, shortage, metric, selectedCounties]);

  
  const pictogramData = useMemo(() => {
    return data.counties
      .map((c, i) => ({
        county: c,
        base: data.baseVals[i],
        sc: data.scVals[i],
        loss: data.baseVals[i] - data.scVals[i],
      }))
      .filter((d) => d.loss > 0 && d.base > 0);
  }, [data]);

  const sqVal = METRIC_SQUARE_VALUE[metric];
  const unit = METRIC_UNIT[metric];

  const [activeTab, setActiveTab] = useState<"bar" | "pictogram">("bar");

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid",
    borderColor: active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
    background: active ? "rgba(255,255,255,0.12)" : "transparent",
    color: active ? "white" : "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  return (
  <div style={{ width: "100%", marginTop: 10 }}>
    <Typography variant="body1" style={S.title}>
      Without Shortage vs With Shortage
    </Typography>

    {/* Tab switcher */}
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 12,
        marginTop: 8,
      }}
    >
      <button
        style={tabStyle(activeTab === "bar")}
        onClick={() => setActiveTab("bar")}
      >
        <Typography component="span" variant="body2">
          Bar Chart
        </Typography>
      </button>

      <button
        style={tabStyle(activeTab === "pictogram")}
        onClick={() => setActiveTab("pictogram")}
      >
        <Typography component="span" variant="body2">
          Pictogram
        </Typography>
      </button>
    </div>

    {/* Bar chart tab */}
    {activeTab === "bar" && (
      <MetricMiniChart
        title={METRIC_TITLE[metric]}
        counties={data.counties}
        baseVals={data.baseVals}
        scVals={data.scVals}
      />
    )}

    {/* Pictogram tab */}
    {activeTab === "pictogram" && (
      <>
        {pictogramData.length > 0 ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Impact by County
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 500,
                }}
              >
                Each square = {formatSquareLegend(sqVal, unit)}
              </Typography>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              {pictogramData.map((d) => (
                <div key={d.county} style={{ width: 90 }}>
                  <Pictogram
                    label={titleCaseCounty(d.county)}
                    baseValue={d.base}
                    scenarioValue={d.sc}
                    squareValue={sqVal}
                    cols={5}
                    squareSize={8}
                    gap={1.5}
                    unit={unit}
                    colorBase="#ff6b6b"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Typography style={S.hint}>
            No loss data to display.
          </Typography>
        )}
      </>
    )}
  </div>
);
}