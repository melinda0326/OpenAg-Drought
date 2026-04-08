import { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { Scrollama, Step } from "react-scrollama";
import type { FeatureCollection, Geometry } from "geojson";
import * as d3 from "d3";
import { parseCsv, getRowMetricPct, type CsvRow } from "./components/OpenExploration";

import CaliforniaMap from "./components/California_Map";
import Opener from "./components/01Opener";
import TemperatureTrend from "./components/07_Rising_Temp";
import DroughtCumulativeAreaChart from "./components/06_Drought_monitor";
import OpenExploration from "./components/OpenExploration";
import Scale from "./components/02Scale";
import Scale_CV from "./components/03Scale_CV";
import PrecipitationAnomalyChart from "./components/08_Precipitation";
import Scale_RV from "./components/04Scale_RV";
import SurfaceGroundwaterChart from "./components/SW_GW";
import Scale_EMP from "./components/05Scale_EMP";
import Compare_Image from "./components/Compare_Image";
import Compare_Land from "./components/Compare_Land";
import Compare_Rev from "./components/Compare_Revenue";
import Compare_EMP from "./components/Compare_EMP";
import Transition1 from "./components/Transition1";
import Transition2 from "./components/Transition2";
import Transition3 from "./components/Transition3";
import Transition_Chain from "./components/Transition_Chain";
type CountiesFC = FeatureCollection<Geometry>;

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


type MetricKey = "xland_pct" | "xwater_pct" | "revenue_pct";

function normalizeCountyName(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\r/g, "")
    .replace(/\s+county$/, "")
    .replace(/[.\-']/g, "")
    .replace(/\s+/g, " ");
}

function getCountyNameFromFeature(f: any): string {
  const p: any = f.properties ?? {};
  return normalizeCountyName(p.CountyName ?? p.NAME ?? p.name ?? "");
}

export default function StoryContainer() {
  const [activeSection, setActiveSection] = useState<StepId>("opener");
  const [isMapReady, setIsMapReady] = useState(false);

  const [shortage, setShortage] = useState<number>(0);
  const [metric, setMetric] = useState<MetricKey>("revenue_pct");
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);

  const [geojsonData, setGeojsonData] = useState<CountiesFC | null>(null);
  const [csvRows, setCsvRows] = useState<CsvRow[] | null>(null);
  /** Multi-date drought map rows, indexed by date string (YYYYMMDD) → rows[] */
  const [droughtByDate, setDroughtByDate] = useState<globalThis.Map<string, any[]>>(new globalThis.Map());
  /** All available drought date strings sorted */
  const [droughtDates, setDroughtDates] = useState<string[]>([]);
  /** Currently hovered drought date (YYYYMMDD string), null = use default */
  const [hoveredDroughtDate, setHoveredDroughtDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setLoading(true);
        setError(null);

        const [gjRes, csvRes, dmRes] = await Promise.all([
          fetch("/data/california_counties.geojson"),
          fetch("/data/grouped_results_by_county.csv"),
          fetch("/data/drought_with_dominant_category.csv"),
        ]);

        if (!gjRes.ok) {
          throw new Error(`GeoJSON load failed (status ${gjRes.status})`);
        }
        if (!csvRes.ok) {
          throw new Error(`CSV load failed (status ${csvRes.status})`);
        }

        const [gj, csvText, dmText] = await Promise.all([
          gjRes.json(),
          csvRes.text(),
          dmRes.text(),
        ]);
        const rows = parseCsv(csvText);
        const dmRows = d3.csvParse(dmText);

        // Index drought rows by date string
        const byDate = new globalThis.Map<string, any[]>();
        for (const row of dmRows) {
          const dateStr = String(row.MapDate).trim();
          if (!byDate.has(dateStr)) byDate.set(dateStr, []);
          byDate.get(dateStr)!.push(row);
        }
        const sortedDates = Array.from(byDate.keys()).sort();

        if (cancelled) return;
        setGeojsonData(gj as CountiesFC);
        setCsvRows(rows);
        setDroughtByDate(byDate);
        setDroughtDates(sortedDates);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  const countyValueByName = useMemo(() => {
    if (!csvRows) return new globalThis.Map<string, number>();

    const target = Math.round(shortage * 100) / 100;
    const map = new globalThis.Map<string, number>();

    for (const r of csvRows) {
      const s = Math.round((r.shortage ?? 0) * 100) / 100;
      if (s !== target) continue;

      const county = normalizeCountyName(r.region);
      const pct = getRowMetricPct(r, metric);
      if (pct === null || !Number.isFinite(pct)) continue;

      map.set(county, (map.get(county) ?? 0) + pct);
    }

    return map;
  }, [csvRows, shortage, metric]);

  const geojsonWithValue = useMemo<CountiesFC | null>(() => {
    if (!geojsonData) return null;

    const selectedSet = new Set(selectedCounties);

    const features = geojsonData.features.map((f) => {
      const countyNorm = getCountyNameFromFeature(f as any);
      const v = countyValueByName.get(countyNorm);

      return {
        ...f,
        properties: {
          ...(f.properties ?? {}),
          mapValue: Number.isFinite(v) ? v : null,
          isSelected: selectedSet.has(countyNorm) ? 1 : 0,
        },
      };
    });

    return { ...geojsonData, features };
  }, [geojsonData, countyValueByName, selectedCounties]);

  // Drought-enriched GeoJSON for drought_monitor step (date-reactive)
  const D_KEYS = ["D0_only", "D1_only", "D2_only", "D3_only", "D4_only"];

  // Pick which date's rows to use: hovered date → closest available, or default to last date
  const activeDroughtDate = useMemo(() => {
    if (!droughtDates.length) return null;
    if (!hoveredDroughtDate) return null; // no hover = no map coloring
    // Find the closest available date (binary search)
    let lo = 0, hi = droughtDates.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (droughtDates[mid] < hoveredDroughtDate) lo = mid + 1;
      else hi = mid;
    }
    // lo is the first date >= hoveredDroughtDate; pick closest between lo and lo-1
    if (lo > 0) {
      const a = droughtDates[lo - 1];
      const b = droughtDates[lo];
      const target = Number(hoveredDroughtDate);
      return Math.abs(Number(a) - target) <= Math.abs(Number(b) - target) ? a : b;
    }
    return droughtDates[lo];
  }, [hoveredDroughtDate, droughtDates]);

  const droughtGeojson = useMemo<CountiesFC | null>(() => {
    if (!geojsonData || !activeDroughtDate) return null;
    const rows = droughtByDate.get(activeDroughtDate);
    if (!rows) return null;

    const lookup = new globalThis.Map<string, number>();
    for (const row of rows) {
      const key = normalizeCountyName(row.County);
      // find the most severe non-zero D category (highest index)
      let catIdx: number | null = null;
      for (let i = D_KEYS.length - 1; i >= 0; i--) {
        if (Number(row[D_KEYS[i]]) > 0) { catIdx = i; break; }
      }
      if (catIdx !== null) lookup.set(key, catIdx);
    }

    const features = geojsonData.features.map((f) => {
      const name = getCountyNameFromFeature(f);
      const idx = lookup.get(name) ?? -1;
      return {
        ...f,
        properties: { ...f.properties, droughtIdx: idx },
      };
    });

    return { ...geojsonData, features };
  }, [geojsonData, droughtByDate, activeDroughtDate]);

  /** Convert hovered Date → YYYYMMDD string for drought map lookup */
  const handleDroughtHover = useCallback((date: Date | null) => {
    if (!date) {
      setHoveredDroughtDate(null);
      return;
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setHoveredDroughtDate(`${yyyy}${mm}${dd}`);
  }, []);

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
        }}
      >
        <CaliforniaMap
          activeSection={activeSection}
          onLoad={() => setIsMapReady(true)}
          geojsonWithValue={geojsonWithValue}
          shortage={shortage}
          droughtGeojson={droughtGeojson}
          countyGeojson={geojsonData}
        />
      </Box>

      {/* Sticky section title for compare steps */}
      {/* {(activeSection === "compare-image" || activeSection === "compare-land") && (
        <Box
          sx={{
            position: "fixed",
            top: "5rem",
            left: 0,
            right: 0,
            zIndex: 3,
            px: "var(--overlay-margin)",
            py: "1.5rem",
            pointerEvents: "none",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "var(--title-size)",
              fontWeight: 700,
              margin: 0,
              maxWidth: "var(--overlay-width)",
            }}
          >
            Agricultural Impact: Idled Farmland
          </h2>
        </Box>
      )} */}

      <Box
        component="main"
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          pointerEvents: "auto",
        }}
      >
        {/* <Scrollama
          offset={0.5}
          
          onStepEnter={({ data }) => setActiveSection(data as StepId)}
          
        > */}
        <Scrollama
        offset={0.5}
        onStepEnter={({ data }) => {
            console.log("onStepEnter fired:", data); // 👈
            setActiveSection(data as StepId);
        }}
        >

        <Step data="opener"><div style={{ pointerEvents: "auto" }}><Opener /></div></Step>


        <Step data="state-crop">
            <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Scale />
            </div>
        </Step>

        <Step data="state-crop-cv">
            <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Scale_CV />
            </div>
        </Step>

         <Step data="state-crop-rv">
            <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Scale_RV />
            </div>
        </Step>

         <Step data="state-crop-emp">
            <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Scale_EMP />
            </div>
        </Step>

        <Step data="transition1">
            <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Transition1 />
            </div>
        </Step>

        <Step data="drought_monitor">
            <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <DroughtCumulativeAreaChart onHoverDate={handleDroughtHover} />
            </div>
            </Step>

        <Step data="temperature-trend">
          <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <TemperatureTrend />
            </div>
          </Step>

        <Step data="precipitation_bar"> 
          <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <PrecipitationAnomalyChart/>
            </div>
          </Step>

          <Step data="transition2"> 
          <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Transition2/>
            </div>
          </Step>

          <Step data="sw_gw">
          <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <SurfaceGroundwaterChart/>
            </div>
          </Step>

          <Step data="transition3"> 
          <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Transition3/>
            </div>
          </Step>

          <Step data="compare-image">
            <div style={{ marginBottom: "20vh", paddingTop: "5rem", pointerEvents: "auto" }}>
              <Compare_Image />
            </div>
          </Step>

          <Step data="compare-land">
            <div style={{ marginBottom: "20vh", paddingTop: "5rem", pointerEvents: "auto" }}>
              <Compare_Land />
            </div>
          </Step>

          <Step data="compare-rev">
            <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
              <Compare_Rev />
            </div>
          </Step>

          <Step data="compare-water">
            <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
              <Compare_EMP />
            </div>
          </Step>

          <Step data="transition-chain"> 
          <div style={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Transition_Chain/>
            </div>
          </Step>

          <Step data="open-exploration">
            <div id="open-exploration" style={{ pointerEvents: "auto" }}>
            <OpenExploration
              shortage={shortage}
              setShortage={setShortage}
              metric={metric}
              setMetric={setMetric}
              selectedCounties={selectedCounties}
              setSelectedCounties={setSelectedCounties}
              csvRows={csvRows}
              geojsonData={geojsonData}
              loading={loading}
              error={error}
            />
            </div>
          </Step>
          
        </Scrollama>
      </Box>
    </>
  );
}