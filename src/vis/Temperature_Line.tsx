import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type RawRow = {
  Date: string;
  Value: string;
};

type YearlyRow = {
  year: number;
  value: number;
};

type Props = {
  csvUrl?: string;
  height?: number;
  title?: string;
  scrollProgress?: number;
};

export default function TemperatureLineChart({
  csvUrl = "/data/temp_data.csv",
  height = 350,
  title = "Annual Average Temperature Trend",
  scrollProgress = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [containerW, setContainerW] = useState(900);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setContainerW(w);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const draw = async () => {
      const text = await d3.text(csvUrl);
      if (!text) return;

      const lines = text.split(/\r?\n/);
      const csvText = lines.slice(2).join("\n");

      const raw = d3.csvParse(csvText) as unknown as RawRow[];

      const yearlyMap = new Map<number, number[]>();

      raw.forEach((d) => {
        const dateStr = String(d.Date ?? "").trim();
        const value = Number(d.Value);

        if (!/^\d{6}$/.test(dateStr)) return;
        if (!Number.isFinite(value)) return;

        const year = Number(dateStr.slice(0, 4));
        if (!Number.isFinite(year)) return;

        if (!yearlyMap.has(year)) yearlyMap.set(year, []);
        yearlyMap.get(year)!.push(value);
      });

      const yearlyData: YearlyRow[] = Array.from(yearlyMap.entries())
        .map(([year, values]) => ({
          year,
          value: d3.mean(values) ?? NaN,
        }))
        .filter((d) => Number.isFinite(d.value))
        .sort((a, b) => a.year - b.year);

      const width = containerW;
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 45, right: 35, bottom: 76, left: 72 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const x = d3
        .scaleLinear()
        .domain(d3.extent(yearlyData, (d) => d.year) as [number, number])
        .range([0, innerWidth]);

      const y = d3
        .scaleLinear()
        .domain(d3.extent(yearlyData, (d) => d.value) as [number, number])
        .nice()
        .range([innerHeight, 0]);

      const root = svg.attr("width", width).attr("height", height);

      const g = root
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      g.append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "transparent");

      const [xMin, xMax] = x.domain();
      const xStart = Math.ceil(xMin / 10) * 10;
      const xTickVals = d3.range(xStart, Math.floor(xMax) + 1, 10);
      const xAxis = d3.axisBottom(x).tickValues(xTickVals).tickFormat(d3.format("d"));

      const [yMin, yMax] = y.domain();
      const lo = Math.ceil(yMin);
      const start = lo % 2 === 0 ? lo : lo + 1;
      const yTickVals = d3.range(start, Math.floor(yMax) + 1, 2);
      const yAxis = d3.axisLeft(y).tickValues(yTickVals).tickFormat(d3.format("d"));

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((sel) => {
          sel.selectAll("text")
            .attr("fill", "white")
            .style("font-size", "var(--body-size)")
            .style("font-family", "Inter, system-ui, sans-serif")
            .attr("dy", "1em");
          sel.selectAll("line").attr("stroke", "white");
          sel.selectAll("path").attr("stroke", "white");
        });

      g.append("g")
        .call(yAxis)
        .call((sel) => {
          sel.selectAll("text")
            .attr("fill", "white")
            .style("font-size", "var(--body-size)")
            .style("font-family", "Inter, system-ui, sans-serif");
          sel.selectAll("line").attr("stroke", "white");
          sel.selectAll("path").attr("stroke", "white");
        });

      const line = d3
        .line<YearlyRow>()
        .x((d) => x(d.year))
        .y((d) => y(d.value));

      const linePath = g.append("path")
        .datum(yearlyData)
        .attr("fill", "none")
        .attr("stroke", "#ed6671")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

      const totalLength = (linePath.node() as SVGPathElement).getTotalLength();

      linePath
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength * (1 - scrollProgress));

      root.append("text")
        .attr("x", margin.left)
        .attr("y", 18)
        .attr("text-anchor", "start")
        .attr("fill", "white")
        .style("font-size", "var(--body-size)")
        .style("font-weight", "600")
        .style("font-family", "Inter, system-ui, sans-serif")
        .text(title);

      root.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "var(--body-size)")
        .style("font-family", "Inter, system-ui, sans-serif")
        .text("Year");

      root.append("text")
        .attr("transform", `translate(14, ${margin.top + innerHeight / 2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "var(--body-size)")
        .style("font-family", "Inter, system-ui, sans-serif")
        .text("Degrees Fahrenheit");
    };

    draw();
  }, [csvUrl, containerW, height, scrollProgress, title]);

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <svg
        ref={svgRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}