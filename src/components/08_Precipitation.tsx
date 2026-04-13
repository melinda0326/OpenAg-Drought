import { useEffect, useState } from "react";
import * as d3 from "d3";
import { Box, Typography, Link } from "@mui/material";
import PrecipitationBarChart, { type PrecipitationRow } from "../vis/PrecipitationBar";

type RawRow = Record<string, string>;

export default function PrecipitationAnomalyChart() {
  const [rows, setRows] = useState<PrecipitationRow[]>([]);

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
    <Box sx={{ m: "var(--overlay-margin)" }}>
      <Box sx={{ width: "var(--overlay-width)" }}>
        <Typography component="p" variant="body1" gutterBottom>
          At the same time,
          <Box component="span" sx={{ fontWeight: 700 }}>
            {" "}precipitation patterns{" "}
          </Box>
          are becoming increasingly
          <Box component="span" sx={{ fontWeight: 700 }}>
            {" "}volatile and unpredictable{" "}
          </Box>
          , with rainfall arriving less consistently and often in shorter, more
          intense bursts.
        </Typography>

        <Typography
          sx={{
            fontSize: "var(--source-size)",
            opacity: 0.6,
            color: "#fff",
            mb: "var(--space-text-chart)",
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
      </Box>

      <Box sx={{ width: "var(--chart-width)" }}>
        <PrecipitationBarChart rows={rows} svgWidth="var(--chart-width)" />
      </Box>
    </Box>
  );
}