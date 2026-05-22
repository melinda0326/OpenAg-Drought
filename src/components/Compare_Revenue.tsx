import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { Typography } from "@mui/material";
import OverlayRevBarChart from "../vis/Compare_Revenue_Bar";
import PictogramRevenue from "../vis/Pictogram_Revenue";

type RawRow = Record<string, string | number>;

export default function Compare_Rev() {
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

  const colusa = useMemo(() => {
    const row = data.find((d) => d.CountyName === "Colusa");
    if (!row) return null;
    return {
      rev2019: +(row.proportion_gross_revenue_base ?? 0),
      rev2022: +(row.proportion_grev_sc ?? 0),
    };
  }, [data]);

return (
  <div style={{ maxWidth: "var(--chart-width)" }}>
  <div style={{ width: "100%" }}>
    <OverlayRevBarChart
      data={data}
      col2019="proportion_gross_revenue_base"
      col2022="proportion_grev_sc"
      title="Revenue Comparison between 2019 and 2022"
      ylabel="Revenue ($)"
    />
  </div>

  {colusa && (
    <div
      id="pictogram-revenue"
      style={{
        width: "100%",
        marginTop: 24,
      }}
    >
      <PictogramRevenue
        revenue2019={colusa.rev2019}
        revenue2022={colusa.rev2022}
        squareValue={5_000_000}
        cols={3}
        squareSize={14}
        gap={4}
        colorLoss="#E65100"
        color2022="#FFCC80"
      />
    </div>
  )}
</div>
);
}