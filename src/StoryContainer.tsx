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
import SurfaceGroundwaterChart from "./components/09_SW_GW";
import Scale_EMP from "./components/05Scale_EMP";
import Compare_Image from "./components/Compare_Image";
import Compare_Land from "./components/Compare_Land";
import Transition1 from "./components/Transition1";
import Transition2 from "./components/Transition2";
import Transition3 from "./components/Transition3";
import Transition_Chain from "./components/Transition_Chain";
import AboutUs from "./components/AboutUs";
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
  | "open-exploration"
  | "about-us";


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
  const [,setIsMapReady] = useState(false);
  const [shortage, setShortage] = useState<number>(0);
  const [compareAspect, setCompareAspect] = useState(0);
  const [metric, setMetric] = useState<MetricKey>("revenue_pct");
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);

  const handleCountyClick = useCallback((rawName: string | null) => {
    if (!rawName) return;
    const norm = normalizeCountyName(rawName);
    if (!norm) return;
    setSelectedCounties((prev) =>
      prev.includes(norm) ? prev.filter((c) => c !== norm) : [...prev, norm]
    );
  }, []);

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
          fetch("/data/drought_with_least_area_category.csv"),
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
    const sums = new globalThis.Map<string, { total: number; count: number }>();

    for (const r of csvRows) {
      const s = Math.round((r.shortage ?? 0) * 100) / 100;
      if (s !== target) continue;

      const county = normalizeCountyName(r.region);
      const pct = getRowMetricPct(r, metric);
      if (pct === null || !Number.isFinite(pct)) continue;

      const entry = sums.get(county) ?? { total: 0, count: 0 };
      entry.total += pct;
      entry.count += 1;
      sums.set(county, entry);
    }

    const map = new globalThis.Map<string, number>();
    for (const [county, { total, count }] of sums) {
      map.set(county, total / count);
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
          compareAspect={compareAspect}
          onCountyClick={handleCountyClick}
        />
      </Box>

      {/* Floating color legend pill — visible only during open-exploration */}
      <Box
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10,
          opacity: activeSection === "open-exploration" ? 1 : 0,
          pointerEvents: activeSection === "open-exploration" ? "auto" : "none",
          transition: "opacity 0.4s ease",
          background: "rgba(10, 12, 18, 0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "14px",
          padding: "12px 16px",
          width: 220,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        <Box
          sx={{
            fontSize: "var(--source-size)",
            textAlign: "center",
            color: "rgba(255,255,255,0.85)",
            mb: 0.5,
          }}
        >
          average % change in{" "}
          <Box component="span" sx={{ fontWeight: 800 }}>
            {metric === "revenue_pct"
              ? "crop revenues"
              : metric === "xwater_pct"
              ? "water usage"
              : "land acreage"}
          </Box>
        </Box>
        <Box
          sx={{
            height: 10,
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.14)",
            background:
              "linear-gradient(to left, #ffe5e5, #ff9999, #ff4d4d, #e60000, #990000)",
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 0.5,
            typography: "chartLabel",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <Box component="span">-100%</Box>
          <Box component="span">-50%</Box>
          <Box component="span">0%</Box>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          pointerEvents: "none",
        }}
      >
        <Scrollama
        offset={0.5}
        onStepEnter={({ data }) => {
            console.log("onStepEnter fired:", data);
            setActiveSection(data as StepId);
        }}
        >

        <Step data="opener"><Box sx={{ pointerEvents: "auto" }}><Opener /></Box></Step>


        <Step data="state-crop">
            <Box sx={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Scale />
            </Box>
        </Step>

        <Step data="state-crop-cv">
            <Box sx={{ marginBottom: "20vh", pointerEvents: "none" }}>
                <Scale_CV />
            </Box>
        </Step>

         <Step data="state-crop-rv">
            <Box sx={{ marginBottom: "20vh", pointerEvents: "none" }}>
                <Scale_RV />
            </Box>
        </Step>

         <Step data="state-crop-emp">
            <Box sx={{ marginBottom: "20vh", pointerEvents: "none" }}>
                <Scale_EMP />
            </Box>
        </Step>

        <Step data="transition1">
            <Box sx={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Transition1 />
            </Box>
        </Step>

        <Step data="drought_monitor">
            <Box sx={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <DroughtCumulativeAreaChart onHoverDate={handleDroughtHover} />
            </Box>
            </Step>

        <Step data="temperature-trend">
          <Box sx={{ pointerEvents: "auto" }}>
                <TemperatureTrend />
            </Box>
          </Step>

        <Step data="precipitation_bar">
          <Box sx={{ pointerEvents: "auto" }}>
                <PrecipitationAnomalyChart/>
            </Box>
          </Step>

          <Step data="transition2"> 
          <Box sx={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Transition2/>
            </Box>
          </Step>

          <Step data="sw_gw">
          <Box sx={{ pointerEvents: "auto" }}>
                <SurfaceGroundwaterChart/>
            </Box>
          </Step>

          <Step data="transition3"> 
          <Box sx={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Transition3/>
            </Box>
          </Step>

          <Step data="compare-image">
            <Box sx={{ marginBottom: "20vh", paddingTop: "5rem", pointerEvents: "auto" }}>
              <Compare_Image />
            </Box>
          </Step>

          <Step data="compare-land">
            <Box sx={{ pointerEvents: "auto" }}>
              <Compare_Land onAspectChange={setCompareAspect} />
            </Box>
          </Step>

          <Step data="transition-chain"> 
          <Box sx={{ marginBottom: "20vh", pointerEvents: "auto" }}>
                <Transition_Chain/>
            </Box>
          </Step>

          <Step data="open-exploration">
            <Box id="open-exploration" sx={{ pointerEvents: "none" }}>
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
            </Box>
          </Step>

          <Step data="about-us">
            <Box sx={{ pointerEvents: "auto" }}>
              <AboutUs />
            </Box>
          </Step>

        </Scrollama>
      </Box>
    </>
  );
}
