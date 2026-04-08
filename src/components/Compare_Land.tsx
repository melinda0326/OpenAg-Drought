import { useEffect, useState } from "react";
import * as d3 from "d3";
import OverlayBarChart from "../vis/Compare_Land_Bar";

type RawRow = Record<string, string | number>;

export default function Compare_Land() {
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
        maxWidth: "var(--chart-width)",
        margin: "var(--overlay-margin)",
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(8px)",
          borderRadius: 12,
          padding: "2rem 2.5rem",
        }}
      >
        
        <p
          style={{
            color: "#fff",
            fontSize: "var(--body-size)",
            lineHeight: 1.6,
            marginTop: 0,
            marginBottom: "2.5rem",
            maxWidth: "var(--overlay-width)",
          }}
        >
          Drought conditions in 2022 forced large areas of farmland out of production compared to the wetter conditions of 2019.
          In total, an estimated 752,000 acres of land were idled statewide due to limited water availability.
        </p>

        <p
          style={{
            color: "#fff",
            fontSize: "var(--body-size)",
            lineHeight: 1.6,
            marginTop: 0,
            marginBottom: "2.5rem",
            maxWidth: "var(--overlay-width)",
          }}
        >
         That shift becomes especially visible in Colusa County. In one of California’s most important rice-growing regions, fields that would normally appear as continuous stretches of green in a wetter year were left dry and unplanted in 2022, as reduced water deliveries made rice too risky to grow.
        </p>

        <OverlayBarChart
          data={data}
          col2019="proportion_xland"
          col2022="proportion_xlandsc"
          title="Land Acreage Comparision betweeen 2019 and 2022"
          ylabel="Land Acreage (acre)"
        />
      </div>
    </div>
  );
}
