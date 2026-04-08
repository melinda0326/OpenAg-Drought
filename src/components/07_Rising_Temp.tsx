import { Box, Typography, Link } from "@mui/material";
import TemperatureLineChart from "../vis/Temperature_Line";

export default function TemperatureTrend() {
  return (
    <div style={{ margin: "var(--overlay-margin)" , }}>
        <Typography sx={{ fontSize: "var(--body-size)", mb: 2, lineHeight: 1.75, textAlign: "left", maxWidth: "var(--overlay-width)", color: "#f5f5f5" }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Rising temperatures
          </Box>{" "}
          across the state accelerate evaporation from soils, rivers, and
          reservoirs, causing water to disappear more quickly than before.
        </Typography>

        <Typography sx={{ fontSize: "1rem", opacity:"60%", color: "#fff", mt: "--space-sm", marginBottom: "5rem", maxWidth: "var(--overlay-width)" }}>
          California historical temperature data source from{" "}
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

        <div style={{ maxWidth: "var(--chart-width)", marginBottom: "10rem"  }}>
          <TemperatureLineChart />
        </div>
    </div>
  );
}