import React, { useMemo } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Box, Typography } from "@mui/material";

import { openExplorationSliderCss } from "./ui/openExplorationStyles";

import CentralValleyBaseScenarioBars from "../vis/OpenExploration_bar";
import OpenExplorationPanel, {
  type MetricKey,
} from "../vis/OpenExploration_panel";

type CountiesFC = FeatureCollection<Geometry>;

export type CsvRow = {
  region: string;
  crop_type: string;
  shortage: number;

  xland_base?: number;
  xwater_base?: number;
  revenue_base?: number;

  xlandsc?: number;
  xwatersc?: number;
  revenuesc?: number;
};


function normalizeCountyName(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\r/g, "")
    .replace(/\s+county$/, "")
    .replace(/[.\-']/g, "")
    .replace(/\s+/g, " ");
}

function getCountyNameFromFeature(f: Feature): string {
  const p: any = f.properties ?? {};
  return normalizeCountyName(p.CountyName ?? p.NAME ?? p.name ?? "");
}

export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];

    if (c === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }

  out.push(cur);
  return out;
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((s) => s.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length === 0) continue;

    const rec: any = {};
    for (let j = 0; j < header.length; j++) {
      const key = header[j];
      const raw = (cols[j] ?? "").trim();

      if (
        key === "shortage" ||
        key.endsWith("_base") ||
        key.endsWith("sc") ||
        key === "revenue_base" ||
        key === "revenuesc" ||
        key === "xland_base" ||
        key === "xwater_base" ||
        key === "xlandsc" ||
        key === "xwatersc"
      ) {
        const n = Number(raw);
        rec[key] = Number.isFinite(n) ? n : undefined;
      } else {
        rec[key] = raw;
      }
    }

    if (rec.region && rec.crop_type && Number.isFinite(rec.shortage)) {
      rows.push(rec as CsvRow);
    }
  }

  return rows;
}

export function percentChange(
  scenario?: number,
  baseline?: number
): number | null {
  if (!Number.isFinite(scenario) || !Number.isFinite(baseline)) return null;
  if ((baseline as number) === 0) return null;

  return (
    (((scenario as number) - (baseline as number)) / (baseline as number)) * 100
  );
}

export function getRowMetricPct(
  r: CsvRow,
  metric: MetricKey
): number | null {
  switch (metric) {
    case "xland_pct":
      return percentChange(r.xlandsc, r.xland_base);
    case "xwater_pct":
      return percentChange(r.xwatersc, r.xwater_base);
    case "revenue_pct":
      return percentChange(r.revenuesc, r.revenue_base);
    default:
      return null;
  }
}

type Props = {
  shortage: number;
  setShortage: React.Dispatch<React.SetStateAction<number>>;
  metric: MetricKey;
  setMetric: React.Dispatch<React.SetStateAction<MetricKey>>;
  selectedCounties: string[];
  setSelectedCounties: React.Dispatch<React.SetStateAction<string[]>>;
  csvRows: CsvRow[] | null;
  geojsonData: CountiesFC | null;
  loading: boolean;
  error: string | null;
};


export default function OpenExploration({
  shortage,
  setShortage,
  metric,
  setMetric,
  selectedCounties,
  setSelectedCounties,
  csvRows,
  geojsonData,
  loading,
  error,
}: Props) {
  const allCountyOptions = useMemo(() => {
    if (!geojsonData) return [];

    const opts: { norm: string; label: string }[] = [];

    for (const f of geojsonData.features) {
      const raw = String(
        (f as any).properties?.CountyName ??
          (f as any).properties?.NAME ??
          (f as any).properties?.name ??
          ""
      ).trim();

      if (!raw) continue;

      const norm = getCountyNameFromFeature(f as Feature);
      opts.push({ norm, label: raw });
    }

    const byNorm = new globalThis.Map<string, string>();
    for (const o of opts) {
      if (!byNorm.has(o.norm)) byNorm.set(o.norm, o.label);
    }

    return Array.from(byNorm.entries())
      .map(([norm, label]) => ({ norm, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [geojsonData]);

  // No auto-select — start with no counties selected

  const boxSkin = {
    p: 1.75,
    borderRadius: 2,
    background: "rgba(10, 12, 18, 0.68)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#f8fafc",
  };
  return (
  <Box
    sx={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "0 var(--overlay-margin)",
      position: "relative",
      zIndex: 2,
      pointerEvents: "none",
      boxSizing: "border-box",
    }}
  >
    <style>{openExplorationSliderCss}</style>

    <Box
      sx={{
        position: "relative",
        zIndex: 2,
        width: "var(--overlay-width)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "auto",
      }}
    >
      {/* section heading */}
      <Typography component="h3" variant="h3" gutterBottom>
        Explore County-Level Impacts
      </Typography>
      <Typography component="p" variant="body1" gutterBottom>
        Adjust the controls below to simulate drought scenarios on the map.
      </Typography>

      {/* panel container */}
      <Box sx={{ ...boxSkin, width: "var(--overlay-width)" }}>
        <OpenExplorationPanel
          metric={metric}
          setMetric={setMetric}
          shortagePct={Math.round(shortage * 100)}
          setShortagePct={(v: number) => setShortage(v / 100)}
          selectedCounties={selectedCounties}
          setSelectedCounties={setSelectedCounties}
          countyOptions={allCountyOptions}
          loading={loading}
          error={error}
        />
      </Box>

      {/* chart container */}
      {!loading && !error && csvRows && (
        <Box sx={{ ...boxSkin, width: "var(--overlay-width)" }}>
          <CentralValleyBaseScenarioBars
            rows={csvRows}
            shortage={shortage}
            metric={metric}
            selectedCounties={selectedCounties}
          />
        </Box>
      )}
    </Box>
  </Box>
);
}
