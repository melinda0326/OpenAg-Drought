import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import PictogramRevenue from "../vis/Pictogram_Revenue";

type RawRow = Record<string, string | number>;

const selectedCounties = [
  "Colusa", "Contra Costa", "Glenn", "Fresno", "Kern", "Kings",
  "Merced", "Sacramento", "Shasta", "Solano", "Stanislaus",
  "Sutter", "Tulare", "Yolo",
];

type Aspect = {
  col2019: string;
  col2022: string;
  title: string;
  ylabel: string;
  color2022: string;
  colorLoss: string;
  text: string;
};

const ASPECTS: Aspect[] = [
  {
    col2019: "proportion_xland",
    col2022: "proportion_xlandsc",
    title: "Land Acreage Comparison between 2019 and 2022",
    ylabel: "Land Acreage (acre)",
    color2022: "#A5D6A7",
    colorLoss: "#1B5E20",
    text: "Drought conditions in 2022 forced large areas of farmland out of production compared to the wetter conditions of 2019. In total, an estimated 752,000 acres of land were idled statewide due to limited water availability.",
  },
  {
    col2019: "proportion_gross_revenue_base",
    col2022: "proportion_grev_sc",
    title: "Revenue Comparison between 2019 and 2022",
    ylabel: "Revenue ($)",
    color2022: "#FFCC80",
    colorLoss: "#E65100",
    text: "Lower production means fewer crops to harvest and sell. Comparing 2019 and 2022 shows how drought directly affected agricultural income across California's key farming counties.",
  },
  {
    col2019: "proportion_xwater",
    col2022: "proportion_xwatersc",
    title: "Employment Comparison between 2019 and 2022",
    ylabel: "Employment Rate (%)",
    color2022: "#A8DADC",
    colorLoss: "#1D7874",
    text: "When less farmland is cultivated and production falls, fewer workers are needed. As drought reduced available water and more farmland was idled in 2022, labor demand across agriculture declined compared to 2019.",
  },
];

function humanReadableMoney(x: number): string {
  const abs = Math.abs(x);
  if (abs >= 1_000_000_000) return `${(x / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(x / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(x / 1_000)}K`;
  return `${Math.round(x)}`;
}

type ChartRow = {
  CountyName: string;
  val2019: number;
  val2022: number;
  loss: number;
};

function preprocessData(
  data: RawRow[],
  col2019: string,
  col2022: string
): ChartRow[] {
  return data
    .filter((d) => selectedCounties.includes(String(d.CountyName)))
    .map((d) => {
      const v2019 = +(d[col2019] ?? 0) || 0;
      const raw2022 = +(d[col2022] ?? 0) || 0;
      const v2022 = Math.min(raw2022, v2019);
      return {
        CountyName: String(d.CountyName),
        val2019: v2019,
        val2022: v2022,
        loss: v2019 - v2022,
      };
    })
    .filter((d) => !(d.val2019 === 0 && d.val2022 === 0))
    .sort(
      (a, b) =>
        selectedCounties.indexOf(a.CountyName) -
        selectedCounties.indexOf(b.CountyName)
    );
}

export default function Compare_Land({
  onAspectChange,
}: {
  onAspectChange?: (aspect: number) => void;
}) {
  const [data, setData] = useState<RawRow[]>([]);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [containerW, setContainerW] = useState(800);
  const prevAspectRef = useRef(-1);

  const HEIGHT = 500;
  const MARGIN = { top: 50, right: 25, bottom: 140, left: 90 };

  // Scroll tracking
  const handleScroll = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const totalScroll = rect.height - window.innerHeight;
    if (totalScroll <= 0) return;
    const raw = -rect.top / totalScroll;
    setScrollProgress(Math.max(0, Math.min(1, raw)));
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Resize observer
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

  // Load data
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

  // Each aspect has 2 sub-phases: text-only, then text+chart
  // Total sub-phases = ASPECTS.length * 2 = 6
  const SUB_PHASES = ASPECTS.length * 2;
  const subPhase = Math.min(
    SUB_PHASES - 1,
    Math.floor(scrollProgress * SUB_PHASES)
  );
  // Which aspect we're in (0, 1, 2)
  const aspectIndex = Math.floor(subPhase / 2);
  // Whether the chart is visible (odd sub-phases = chart shown)
  const isChartPhase = subPhase % 2 === 1;
  // Progress within current sub-phase (0→1)
  const subPhaseProgress = (scrollProgress * SUB_PHASES) - subPhase;

  // Notify parent of aspect change
  useEffect(() => {
    onAspectChange?.(aspectIndex);
  }, [aspectIndex, onAspectChange]);

  // Chart aspect index: only advances when chart phase starts
  const chartAspectIndex = isChartPhase ? aspectIndex : Math.max(0, aspectIndex - 1);
  // Chart opacity: 0 during text-only, fades in during chart phase
  const chartOpacity = isChartPhase
    ? Math.min(1, subPhaseProgress * 3) // quick fade-in at start of chart phase
    : aspectIndex === 0 && !isChartPhase
      ? 0 // first aspect text-only: chart fully hidden
      : Math.max(0, 1 - subPhaseProgress * 3); // fade out at end of previous chart

  // Precompute all aspect chart data
  const allChartData = useMemo(() => {
    return ASPECTS.map((a) => preprocessData(data, a.col2019, a.col2022));
  }, [data]);

  // Draw and animate D3 chart
  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const aspect = ASPECTS[chartAspectIndex];
    const chartData = allChartData[chartAspectIndex];
    if (!chartData.length) return;

    const width = containerW;
    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr("width", width).attr("height", HEIGHT);

    const isFirst = prevAspectRef.current === -1;
    const dur = isFirst ? 0 : 600;
    prevAspectRef.current = aspectIndex;

    // X scale (constant across aspects)
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.CountyName))
      .range([0, innerWidth])
      .padding(0.25);

    // Y scale (changes per aspect)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.val2019) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Init groups once
    let root = svg.select<SVGGElement>("g.chart-root");
    if (root.empty()) {
      root = svg.append("g").attr("class", "chart-root")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

      // X axis (drawn once, stays)
      const gx = root.append("g").attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`);
      const xAxis = d3.axisBottom(x);
      gx.call(xAxis);
      gx.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-55)")
        .style("fill", "white")
        .style("font-size", "var(--body-size)");
      gx.selectAll("path,line").style("stroke", "white");

      // Y axis group
      root.append("g").attr("class", "y-axis");

      // Y label
      root.append("text").attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -75)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "var(--body-size)");

      // Title
      root.append("text").attr("class", "chart-title")
        .attr("x", 0)
        .attr("y", -30)
        .style("fill", "white")
        .style("font-size", "var(--body-size)")
        .style("font-weight", "600");

      // Legend group
      svg.append("g").attr("class", "legend-group");
    }

    // Animate Y axis
    const yAxis = d3.axisLeft(y).ticks(6)
      .tickFormat((d) => humanReadableMoney(d as number));
    const gy = root.select<SVGGElement>("g.y-axis");
    gy.transition().duration(dur).call(yAxis as any);
    gy.selectAll("text").style("fill", "white").style("font-size", "var(--body-size)");
    gy.selectAll("path,line").style("stroke", "white");

    // Animate Y label
    root.select("text.y-label")
      .transition().duration(dur)
      .text(aspect.ylabel);

    // Animate title
    root.select("text.chart-title")
      .transition().duration(dur)
      .text(aspect.title);

    // Bars: 2022 (bottom)
    const bars2022 = root.selectAll<SVGRectElement, ChartRow>(".bar-2022")
      .data(chartData, (d) => d.CountyName);

    bars2022.enter()
      .append("rect")
      .attr("class", "bar-2022")
      .attr("x", (d) => x(d.CountyName)!)
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", aspect.color2022)
      .merge(bars2022)
      .transition().duration(dur)
      .attr("x", (d) => x(d.CountyName)!)
      .attr("y", (d) => y(d.val2022))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.val2022))
      .attr("fill", aspect.color2022);

    bars2022.exit().remove();

    // Bars: loss (top segment)
    const barsLoss = root.selectAll<SVGRectElement, ChartRow>(".bar-loss")
      .data(chartData, (d) => d.CountyName);

    barsLoss.enter()
      .append("rect")
      .attr("class", "bar-loss")
      .attr("x", (d) => x(d.CountyName)!)
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", aspect.colorLoss)
      .merge(barsLoss)
      .transition().duration(dur)
      .attr("x", (d) => x(d.CountyName)!)
      .attr("y", (d) => y(d.val2019))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(d.val2022) - y(d.val2019))
      .attr("fill", aspect.colorLoss);

    barsLoss.exit().remove();

    // Colusa highlight
    const colusaData = chartData.filter((d) => d.CountyName === "Colusa");
    const highlight = root.selectAll<SVGRectElement, ChartRow>(".bar-highlight")
      .data(colusaData, (d) => d.CountyName);

    highlight.enter()
      .append("rect")
      .attr("class", "bar-highlight")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 4)
      .attr("rx", 6)
      .attr("stroke-linejoin", "round")
      .merge(highlight)
      .transition().duration(dur)
      .attr("x", (d) => x(d.CountyName)! - 4)
      .attr("y", (d) => y(d.val2019) - 4)
      .attr("width", x.bandwidth() + 8)
      .attr("height", (d) => innerHeight - y(d.val2019) + 8);

    highlight.exit().remove();

    // Legend
    const legendG = svg.select<SVGGElement>("g.legend-group");
    legendG.attr("transform", `translate(${width - MARGIN.right - 40},${MARGIN.top - 40})`);
    legendG.selectAll("*").remove();

    const legendItems = [
      { label: "2019", color: aspect.colorLoss },
      { label: "2022", color: aspect.color2022 },
    ];

    legendItems.forEach((item, i) => {
      const row = legendG.append("g").attr("transform", `translate(0,${i * 24})`);
      row.append("rect").attr("width", 14).attr("height", 14).attr("fill", item.color);
      row.append("text").attr("x", 22).attr("y", 11)
        .style("fill", "white").style("font-size", "var(--body-size)")
        .text(item.label);
    });
  }, [data, chartAspectIndex, containerW, allChartData]);

  // Colusa revenue data for pictogram
  const colusa = useMemo(() => {
    const row = data.find((d) => d.CountyName === "Colusa");
    if (!row) return null;
    return {
      rev2019: +(row.proportion_gross_revenue_base ?? 0),
      rev2022: +(row.proportion_grev_sc ?? 0),
    };
  }, [data]);

  // Text opacity: visible throughout both sub-phases of its aspect
  const getTextOpacity = (idx: number) => {
    if (idx === aspectIndex) return 1;
    // Fade out previous / fade in next during transitions
    const aspectStart = (idx * 2) / SUB_PHASES;
    const aspectEnd = ((idx + 1) * 2) / SUB_PHASES;
    if (scrollProgress < aspectStart) return 0;
    if (scrollProgress > aspectEnd) return 0;
    return 1;
  };

  // Pictogram visible when chart shows revenue aspect
  const pictogramOpacity = (isChartPhase && aspectIndex === 1) ? chartOpacity : 0;

  return (
    <div
      ref={outerRef}
      style={{ height: "600vh", position: "relative" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
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
            {/* Text paragraphs stacked with absolute positioning for crossfade */}
            <div style={{ position: "relative", minHeight: "4.5rem", marginBottom: "1.5rem" }}>
              {ASPECTS.map((aspect, i) => (
                <p
                  key={i}
                  style={{
                    position: i === 0 ? "relative" : "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    color: "white",
                    fontSize: "var(--body-size)",
                    fontFamily: "Inter, system-ui, sans-serif",
                    lineHeight: 1.6,
                    margin: 0,
                    opacity: getTextOpacity(i),
                    transition: "opacity 0.4s ease",
                    pointerEvents: aspectIndex === i ? "auto" : "none",
                  }}
                >
                  {aspect.text}
                </p>
              ))}
            </div>

            {/* Chart */}
            <div
              ref={containerRef}
              style={{
                width: "100%",
                opacity: chartOpacity,
                transition: "opacity 0.35s ease",
              }}
            >
              <svg ref={svgRef} style={{ display: "block", width: "100%" }} />
            </div>

            {/* Pictogram for Revenue aspect */}
            {colusa && (
              <div
                style={{
                  marginTop: "1.5rem",
                  marginBottom: "3rem",
                  opacity: pictogramOpacity,
                  transition: "opacity 0.35s ease",
                  pointerEvents: aspectIndex === 1 && isChartPhase ? "auto" : "none",
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
        </div>

        {/* Scroll indicator — visible only after bar chart appears, centered under black container */}
        <Box
          sx={{
            position: "absolute",
            bottom: 32,
            left: 0,
            width: "calc(var(--chart-width) + var(--overlay-margin) * 2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            opacity: isChartPhase && scrollProgress < 1 ? 0.6 : 0,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
            animation:
              isChartPhase && scrollProgress < 1
                ? "scrollBounceLand 2s ease-in-out infinite"
                : "none",
            "@keyframes scrollBounceLand": {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(8px)" },
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "var(--source-size)",
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
            }}
          >
            {aspectIndex === 0
              ? "Scroll for revenue comparison"
              : aspectIndex === 1
              ? "Scroll for employment comparison"
              : "Scroll to continue"}
          </Typography>
          <Box
            component="svg"
            viewBox="0 0 24 24"
            sx={{
              width: 24,
              height: 24,
              fill: "none",
              stroke: "rgba(255,255,255,0.7)",
              strokeWidth: 2,
            }}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </Box>
        </Box>
      </div>
    </div>
  );
}
