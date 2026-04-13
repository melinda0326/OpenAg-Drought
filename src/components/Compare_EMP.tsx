import { useEffect, useState } from "react";
import * as d3 from "d3";
import { Typography } from "@mui/material";

import OverlayEMPBarChart from "../vis/Compare_EMP_Bar";

type RawRow = Record<string, string | number>;

export default function Compare_Water() {
  const [data, setData] = useState<RawRow[]>([]);

  useEffect(() => {
    d3.csv("/data/2019_2022_comparison.csv").then((raw) => {
      const parsed: RawRow[] = raw.map((d) => ({
        CountyName: d.CountyName ?? "",
        proportion_xland: +(d.proportion_xland ?? 0),
        proportion_xlandsc: +(d.proportion_xlandsc ?? 0),
        proportion_xwater: +(d.proportion_xwater ?? 0),
        proportion_xwatersc: +(d.proportion_xwatersc ?? 0),
        proportion_gross_revenue_base: +(d.proportion_gross_revenue_base ?? 0),
        proportion_grev_sc: +(d.proportion_grev_sc ?? 0),
      }));

      setData(parsed);
    });
  }, []);

  return (
  <div
    style={{
      margin: "var(--overlay-margin)",
    }}
  >
    <div style={{ maxWidth: "var(--overlay-width)" }}>
      <Typography
        component="p"
        variant="body1"
      >
        When less farmland is cultivated and production falls, fewer workers are
        needed. Farmworkers and others employed in farm-related industries face
        reduced job opportunities, shorter work seasons, and potential
        unemployment.
      </Typography>

      <Typography
        component="p"
        variant="body1"
        sx={{
          mb: "var(--space-text-chart)",
        }}
      >
        As drought reduced available water and more farmland was idled in 2022,
        labor demand across agriculture declined compared to 2019.
      </Typography>
    </div>

    <div style={{ maxWidth: "var(--chart-width)" }}>
      <OverlayEMPBarChart
        data={data}
        col2019="proportion_xwater"
        col2022="proportion_xwatersc"
        title="Employment Comparision betweeen 2019 and 2022"
        ylabel="Employment Rate (%) "
      />
    </div>
  </div>
);
}