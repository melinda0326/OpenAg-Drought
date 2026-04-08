import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

const selectedCounties = [
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

function humanReadableMoney(x: number): string {
  const abs = Math.abs(x);
  if (abs >= 1_000_000_000) return `${(x / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(x / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(x / 1_000)}K`;
  return `${Math.round(x)}`;
}

type BarRow = Record<string, string | number>;

type ChartRow = {
  CountyName: string;
  val2019: number;
  val2022: number;
  loss: number;
};

function preprocessData(
  data: BarRow[],
  col2019: string,
  col2022: string
): ChartRow[] {
  return data
    .filter((d) => selectedCounties.includes(String(d.CountyName)))
    .map((d) => {
      const v2019 = +(d[col2019] ?? 0) || 0;
      const raw2022 = +(d[col2022] ?? 0) || 0;
      const v2022 = Math.min(raw2022, v2019);
      const loss = v2019 - v2022;

      return {
        CountyName: String(d.CountyName),
        val2019: v2019,
        val2022: v2022,
        loss,
      };
    })
    .filter((d) => !(d.val2019 === 0 && d.val2022 === 0))
    .sort(
      (a, b) =>
        selectedCounties.indexOf(a.CountyName) -
        selectedCounties.indexOf(b.CountyName)
    );
}

type Props = {
  data: BarRow[];
  col2019?: string;
  col2022?: string;
  title?: string;
  ylabel?: string;
  color2022?: string;
  colorLoss?: string;
  moneyAxis?: boolean;
  width?: number;
  height?: number;
};

export default function OverlayEMPBarChart({
  data,
  col2019="proportion_xwater",
  col2022="proportion_xwatersc",
  title = "Water Comparison",
  ylabel = "water",
  color2022 = "#A8DADC",
  colorLoss = "#1D7874",
  moneyAxis = false,
  width = 1000,
  height = 500,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const chartData = useMemo(() => {
    return preprocessData(data, col2019, col2022);
  }, [data, col2019, col2022]);

  useEffect(() => {
    if (!chartData.length) return;

    const margin = { top: 50, right: 130, bottom: 120, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.CountyName))
      .range([0, innerWidth])
      .padding(0.25);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.val2019) || 0])
      .nice()
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3
      .axisLeft(y)
      .ticks(6)
      .tickFormat((d) => humanReadableMoney(d as number));

    // axes
    const gx = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    gx.selectAll("text")
    .attr("transform", null) // remove rotation
    .style("text-anchor", "middle")
    .attr("dx", "0")
    .attr("dy", "0.8em")
    .style("fill", "white")
    .style("font-size", "13px");

    gx.selectAll("path,line").style("stroke", "white");

    const gy = g.append("g").call(yAxis);
    gy.selectAll("text").style("fill", "white");
    gy.selectAll("path,line").style("stroke", "white");

    // y label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "14px")
      .text(ylabel);

    // title
    g.append("text")
      .attr("x", 0)
      .attr("y", -30)
      .style("fill", "white")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .text(title);

    // bottom bar = 2022
    g.selectAll(".bar-2022")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar-2022")
      .attr("x", (d) => x(d.CountyName)!)
      .attr("y", (d) => y(d.val2022))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.val2022))
      .attr("fill", color2022);

    // top segment = loss from 2019 to 2022
    g.selectAll(".bar-loss")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar-loss")
      .attr("x", (d) => x(d.CountyName)!)
      .attr("y", (d) => y(d.val2019))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(d.val2022) - y(d.val2019))
      .attr("fill", colorLoss);

    // legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right -40},${margin.top-40})`);

    const legendItems = [
      { label: "2019", color: colorLoss },
      { label: "2022", color: color2022 },
    ];

    legendItems.forEach((item, i) => {
      const row = legend.append("g").attr("transform", `translate(0,${i * 24})`);

      row
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", item.color);

      row
        .append("text")
        .attr("x", 22)
        .attr("y", 11)
        .style("fill", "white")
        .style("font-size", "13px")
        .text(item.label);
    });
  }, [
    chartData,
    width,
    height,
    title,
    ylabel,
    color2022,
    colorLoss,
    moneyAxis,
  ]);

  return (
    <div style={{ background: "none" }}>
      <svg ref={svgRef} />
    </div>
  );
}