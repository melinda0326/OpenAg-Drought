import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";



/** A single band (area) in the stacked chart. */
export type BandDef<T> = {
  label: string;
  color: string;
  y0: (d: T) => number;
  y1: (d: T) => number;
};


export type ReferenceLine = {
  date: Date;
  label?: string;
  dashArray?: string;
};

export type StackedAreaChartProps<T> = {
  /** Pre-parsed, sorted data rows. */
  data: T[];
  /** Accessor: row → Date for the x-axis. */
  xAccessor: (d: T) => Date;
  /** Band definitions from outermost to innermost. */
  bands: BandDef<T>[];

  /* — optional overrides — */
  width?: number;
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  yDomain?: [number, number];
  xTickInterval?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  referenceLines?: ReferenceLine[];
  /** Show crosshair + date label on hover (default true). */
  hover?: boolean;
  /** Show categorical legend beside chart (default true). */
  showLegend?: boolean;
  /** Callback fired with the hovered Date (or null on mouse leave). */
  onHoverDate?: (date: Date | null) => void;
};


export default function StackedAreaChart<T>({
  data,
  xAccessor,
  bands,
  width: fixedW,
  height = 350,
  title,
  xLabel = "Year",
  yLabel = "Drought Coverage",
  yDomain = [0, 100],
  xTickInterval = 2,
  margin: customMargin,
  referenceLines = [],
  hover = true,
  showLegend = true,
  onHoverDate,
}: StackedAreaChartProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onHoverDateRef = useRef(onHoverDate);
  onHoverDateRef.current = onHoverDate;
  const [containerW, setContainerW] = useState<number>(fixedW ?? 900);

  /* ---------- responsive width ---------- */
  useEffect(() => {
    if (fixedW) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setContainerW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedW]);

  /* ---------- draw ---------- */
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || !data.length) return;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const W = fixedW ?? containerW;
    const H = height;
    const margin = customMargin ?? { top: 55, right: 180, bottom: 75, left: 80 };
    const innerW = Math.max(10, W - margin.left - margin.right);
    const innerH = Math.max(10, H - margin.top - margin.bottom);

    svg.attr("width", W).attr("height", H).style("background", "transparent");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    /* scales */
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, xAccessor) as [Date, Date])
      .range([0, innerW]);

    const y = d3.scaleLinear().domain(yDomain).range([innerH, 0]);

    /* grid */
    g.append("g")
      .attr("class", "grid-y")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(() => ""))
      .call((s) => s.selectAll("line").attr("stroke", "white").attr("stroke-opacity", 0.18))
      .call((s) => s.select(".domain").remove());

    /* axes */
    const xAxis = d3
      .axisBottom(x)
      .ticks(d3.timeYear.every(xTickInterval))
      .tickFormat(d3.timeFormat("%Y") as any);
    const yAxis = d3.axisLeft(y).ticks(5);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .call((s) => {
        s.selectAll("text")
          .attr("fill", "white")
          .style("font-size", "16px")
          .style("font-family", "Inter, system-ui, sans-serif")
          .attr("dy", "1em");
        s.selectAll("line").attr("stroke", "white").attr("stroke-opacity", 0.4);
        s.select(".domain").attr("stroke", "white").attr("stroke-opacity", 0.35);
      });

    g.append("g")
      .call(yAxis)
      .call((s) => {
        s.selectAll("text")
          .attr("fill", "white")
          .style("font-size", "14px")
          .style("font-family", "Inter, system-ui, sans-serif");
        s.selectAll("line").attr("stroke", "white").attr("stroke-opacity", 0.4);
        s.select(".domain").attr("stroke", "white").attr("stroke-opacity", 0.35);
      });

    /* title */
    if (title) {
      svg
        .append("text")
        .attr("x", margin.left)
        .attr("y", 20)
        .attr("fill", "white")
        .style("font-size", "var(--body-size)")
        .style("font-weight", "600")
        .style("font-family", "Inter, system-ui, sans-serif")
        .text(title);
    }

    /* axis labels */
    if (xLabel) {
      svg
        .append("text")
        .attr("x", margin.left + innerW / 2)
        .attr("y", H - 2)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .style("font-size", "var(--body-size)")
        .style("font-family", "Inter, system-ui, sans-serif")
        .text(xLabel);
    }

    if (yLabel) {
      svg
        .append("text")
        .attr(
          "transform",
          `translate(14, ${margin.top + innerH / 2}) rotate(-90)`
        )
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .style("font-size", "var(--body-size)")
        .style("font-family", "Inter, system-ui, sans-serif")
        .text(yLabel);
    }

    /* area generator */
    const areaBetween = (y0Fn: (d: T) => number, y1Fn: (d: T) => number) =>
      d3
        .area<T>()
        .x((d) => x(xAccessor(d)))
        .y0((d) => y(y0Fn(d)))
        .y1((d) => y(y1Fn(d)))
        .curve(d3.curveMonotoneX);

    /* draw bands */
    g.append("g")
      .attr("class", "bands")
      .selectAll("path")
      .data(bands)
      .join("path")
      .attr("d", (b) => areaBetween(b.y0, b.y1)(data)!)
      .attr("fill", (b) => b.color)
      .attr("fill-opacity", 0.9);

    /* reference lines */
    for (const ref of referenceLines) {
      const rx = x(ref.date);
      g.append("line")
        .attr("x1", rx)
        .attr("x2", rx)
        .attr("y1", 0)
        .attr("y2", innerH)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", ref.dashArray ?? "6,4")
        .attr("opacity", 0.9);

      if (ref.label) {
        g.append("text")
          .attr("x", rx)
          .attr("y", -8)
          .attr("fill", "white")
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-style", "italic")
          .style("font-family", "Inter, system-ui, sans-serif")
          .text(ref.label);
      }
    }

    /* hover crosshair */
    if (hover) {
      const hoverLine = g
        .append("line")
        .attr("y1", 0)
        .attr("y2", innerH)
        .attr("stroke", "white")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0);

      const hoverLabel = g
        .append("text")
        .attr("fill", "white")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .attr("text-anchor", "middle")
        .attr("opacity", 0);

      const bisect = d3.bisector((d: T) => xAccessor(d)).center;

      g.append("rect")
        .attr("width", innerW)
        .attr("height", innerH)
        .attr("fill", "transparent")
        .style("cursor", "crosshair")
        .on("mousemove", function (event) {
          const [mx] = d3.pointer(event, this);
          const hovered = x.invert(mx);
          const i = bisect(data, hovered);
          const d = data[Math.max(0, Math.min(data.length - 1, i))];
          const px = x(xAccessor(d));

          hoverLine.attr("x1", px).attr("x2", px).attr("opacity", 1);
          hoverLabel
            .attr("x", px)
            .attr("y", -10)
            .text(d3.timeFormat("%b %d, %Y")(xAccessor(d)))
            .attr("opacity", 1);

          onHoverDateRef.current?.(xAccessor(d));
        })
        .on("mouseleave", () => {
          hoverLine.attr("opacity", 0);
          hoverLabel.attr("opacity", 0);
          onHoverDateRef.current?.(null);
        });
    }

    /* categorical legend */
    if (showLegend) {
      const legendX = margin.left + innerW + 14;
      const legendY = margin.top + 10;
      const swatchSize = 14;
      const swatchGap = 8;

      const lg = svg
        .append("g")
        .attr("transform", `translate(${legendX},${legendY})`);

      const item = lg
        .selectAll("g.legend-item")
        .data(bands)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (_d, i) => `translate(0,${i * (swatchSize + swatchGap)})`);

      item
        .append("rect")
        .attr("width", swatchSize)
        .attr("height", swatchSize)
        .attr("rx", 3)
        .attr("fill", (d) => d.color)
        .attr("opacity", 0.95);

      item
        .append("text")
        .attr("x", swatchSize + 8)
        .attr("y", swatchSize / 2)
        .attr("fill", "white")
        .attr("dominant-baseline", "central")
        .style("font-size", "var(--body-size)")
        .style("font-family", "Inter, system-ui, sans-serif")
        .text((d) => d.label);
    }
  }, [data, fixedW, containerW, height, title, xLabel, yLabel, bands, referenceLines, hover, showLegend, xTickInterval, yDomain, customMargin, xAccessor]);

  return (
    <div
      ref={containerRef}
      style={{
        width: fixedW ? `${fixedW}px` : "100%",
        height: `${height}px`,
      }}
    >
      <svg
        ref={svgRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
