import { useEffect, useState } from "react";
import * as d3 from "d3";
import { Typography, Link } from "@mui/material";
import PrecipitationBarChart,{type PrecipitationRow} from "../vis/PrecipitationBar";

type RawRow = Record<string, string>;

export default function PrecipitationAnomalyChart() {
  const [rows, setRows] = useState<PrecipitationRow[]>([]);
  // precip data extract
  useEffect(() => {
    d3.text("/data/precipitation.csv").then((text) => {
      const cleanedText = text.split("\n").slice(2).join("\n");
      const parsed = d3.csvParse(cleanedText);

      const cleaned = parsed
        .map((r: RawRow) => {
          const rawDate = Number(r.Date);
          const value = Number(r.Value);

          if (!Number.isFinite(rawDate) || !Number.isFinite(value)) return null;

          const year = Math.floor(rawDate / 100);
          return { rawDate, year, value };
        })
        .filter(
          (d): d is { rawDate: number; year: number; value: number } =>
            d !== null
        );

      if (cleaned.length === 0) return;

      const avg =
        cleaned.reduce((sum, d) => sum + d.value, 0) / cleaned.length;

      setRows(
        cleaned.map((d) => ({
          ...d,
          anomaly: d.value - avg,
        }))
      );
    });
  }, []);

  if (rows.length === 0) {
    return <div style={{ color: "white" }}>Loading...</div>;
  }

  return (
    <div style={{ margin: "var(--overlay-margin)" }}>
      <p
        style={{
          color: "#fff",
          fontSize: "var(--body-size)",
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: 1.6,
          marginBottom: "2rem",
          maxWidth: "var(--overlay-width)",
        }}
      >
        At the same time, precipitation patterns are becoming increasingly
        volatile and unpredictable, with rainfall arriving less consistently and
        often in shorter, more intense bursts.
      </p>

      <Typography
        sx={{
          fontSize: "1rem",
          opacity: "60%",
          color: "#fff",
          marginBottom: "5rem",
          maxWidth: "var(--overlay-width)",
        }}
      >
        California historical precipitation data source from{" "}
        <Link
          href="https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/statewide/time-series/4/tavg/3/8/1895-2021?base_prd=true&firstbaseyear=1901&lastbaseyear=2000"
          target="_blank"
          rel="noopener"
          sx={{
            color: "inherit",
            opacity: 0.6,
            textDecoration: "underline",
            textDecorationColor: "rgba(255,255,255,0.7)",
            "&:hover": {
              color: "inherit",
              opacity: 1,
              textDecoration: "underline",
              textDecorationColor: "currentColor",
            },
            "&:visited": {
              color: "inherit",
            },
          }}
        >
          NOAA
        </Link>
      </Typography>

      <PrecipitationBarChart rows={rows} svgWidth="var(--chart-width)" />
    </div>
  );
}