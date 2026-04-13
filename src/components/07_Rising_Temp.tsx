import { Box, Typography, Link } from "@mui/material";
import TemperatureLineChart from "../vis/Temperature_Line";

export default function TemperatureTrend() {
  return (
    <Box sx={{ m: "var(--overlay-margin)" }}>
      <Box sx={{ width: "var(--overlay-width)" }}>
        <Typography component="p" variant="body1" gutterBottom>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Rising temperatures
          </Box>{" "}
          across the state accelerate evaporation from soils, rivers, and
          reservoirs, causing water to disappear more quickly than before.
        </Typography>

        <Typography
          sx={{
            fontSize: "var(--source-size)",
            opacity: 0.6,
            mb: "var(--space-text-chart)",
          }}
        >
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
      </Box>

      <Box sx={{ width: "var(--chart-width)"}}>
        <TemperatureLineChart />
      </Box>
    </Box>
  );
}