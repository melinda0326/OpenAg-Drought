import * as d3 from "d3";

export type ComparisonRow = Record<string, string | number>;

export const selectedComparisonCounties = [
  "Colusa",
  "Contra Costa",
  "Glenn",
  "Fresno",
  "Kern",
  "Kings",
  "Merced",
  "Sacramento",
  "Shasta",
  "Solano",
  "Stanislaus",
  "Sutter",
  "Tulare",
  "Yolo",
];

export async function loadComparisonRows() {
  const raw = await d3.csv("/data/2019_2022_comparison.csv");

  return raw.map((d) => ({
    CountyName: d.CountyName ?? "",
    proportion_xland: +(d.proportion_xland ?? 0),
    proportion_xlandsc: +(d.proportion_xlandsc ?? 0),
    proportion_xwater: +(d.proportion_xwater ?? 0),
    proportion_xwatersc: +(d.proportion_xwatersc ?? 0),
    proportion_gross_revenue_base: +(d.proportion_gross_revenue_base ?? 0),
    proportion_grev_sc: +(d.proportion_grev_sc ?? 0),
  }));
}
