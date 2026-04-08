import { useEffect, useState } from "react";
import * as d3 from "d3";
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
        maxWidth: "var(--overlay-width)",
        margin: "var(--overlay-margin)",
      }}
    >
      <p
        style={{
          color: "#fff",
          fontSize: "var(--body-size)",
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: 1.6,
          marginBottom: "2.5rem",
        }}
      >
        When less farmland is cultivated and production falls, fewer workers are needed. Farmworkers and others employed in farm-related industries face reduced job opportunities, shorter work seasons, and potential unemployment.

        As drought reduced available water and more farmland was idled in 2022, labor demand across agriculture declined compared to 2019.         </p>

      <OverlayEMPBarChart
        data={data}
        col2019="proportion_xwater"
        col2022="proportion_xwatersc"
        title="Employment Comparision betweeen 2019 and 2022"
        ylabel="Employment Rate (%) "
      />
    </div>
  );
}