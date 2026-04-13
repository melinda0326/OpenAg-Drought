import React, { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export type DualAxisDatum = {
  year: number;
  leftValue: number | null;
  rightValue: number | null;
};

export type ViewMode = "left" | "right" | "both";

type Props = {
  data: DualAxisDatum[];
  height?: number;

  leftName?: string;
  rightName?: string;

  leftColor?: string;
  rightColor?: string;

  leftDomain?: [number, number];
  rightDomain?: [number, number];

  leftAxisLabel?: string;
  rightAxisLabel?: string;

  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;

  leftDataKey?: string;
  rightDataKey?: string;

  referenceX?: number;
  width?: string | number;

  leftTickFormatter?: (v: number) => string;
  rightTickFormatter?: (v: number) => string;

  animateOnView?: boolean;
  animationThreshold?: number;

  swDuration?: number;
  gwDelay?: number;
  gwDuration?: number;
};

export default function DualAxisAreaChart({
  data,
  height = 400,

  leftName = "Left Series",
  rightName = "Right Series",

  leftColor = "#1B9AAA",
  rightColor = "#3d6fc4",

  leftDomain = [0, 0],
  rightDomain = [0, 0],

  leftAxisLabel = "Left Axis",
  rightAxisLabel = "Right Axis",

  viewMode,
  setViewMode,

  leftDataKey = "leftValue",
  rightDataKey = "rightValue",

  referenceX,
  width = "100%",

  leftTickFormatter,
  rightTickFormatter,

  animateOnView = true,
  animationThreshold = 0.3,

  swDuration = 3000,
  gwDelay = 1800,
  gwDuration = 3000,
}: Props) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const wasInView = useRef(false);

  useEffect(() => {
    if (!animateOnView) return;

    const el = chartRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasInView.current) {
          setAnimKey((k) => k + 1);
        }
        wasInView.current = entry.isIntersecting;
      },
      { threshold: animationThreshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animateOnView, animationThreshold]);

  const animate = animateOnView;

  // Keep both series rendered at all times.
  // Only dim the non-focused one.
  const leftOpacity = viewMode === "right" ? 0.15 : 1;
  const rightOpacity = viewMode === "left" ? 0.15 : 1;

  // Keep both axes visible too, but dim the inactive side.
  const leftAxisOpacity = viewMode === "right" ? 0.28 : 1;
  const rightAxisOpacity = viewMode === "left" ? 0.28 : 1;

  const legendFormatter = (value: string) => (
    <span style={{ color: "white", fontSize: "var(--body-size)" }}>
      {value}
    </span>
  );

  const btnStyle = (
    active: boolean,
    mode: ViewMode
  ): React.CSSProperties => {
    const accent =
      mode === "left" ? leftColor : mode === "right" ? rightColor : "white";

    return {
      background: active ? accent : "transparent",
      color: active ? (mode === "both" ? "black" : "white") : "white",
      border: `1.5px solid ${accent}`,
      borderRadius: 999,
      padding: "6px 16px",
      fontSize: "var(--body-size)",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontFamily: "Inter, system-ui, sans-serif",
    };
  };

  return (
    <div ref={chartRef} style={{ width }}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          key={animate ? animKey : "static"}
          data={data}
          margin={{ top: 10, right: 24, left: 24, bottom: 10 }}
        >
          <CartesianGrid
            stroke="white"
            strokeOpacity={0.08}
            vertical={false}
          />

          <XAxis
            dataKey="year"
            tick={{ fill: "white", fontSize: "var(--body-size)" }}
            axisLine={{ stroke: "white", strokeWidth: 1 }}
            tickLine={{ stroke: "white" }}
            tickMargin={10}
            ticks={data.map((d) => d.year).filter((year) => year % 2 === 0)}
          />

          <YAxis
            yAxisId="left"
            domain={leftDomain}
            tick={{
              fill: `rgba(255,255,255,${leftAxisOpacity})`,
              fontSize: "var(--body-size)",
            }}
            axisLine={{
              stroke: `rgba(255,255,255,${leftAxisOpacity})`,
              strokeWidth: 1,
            }}
            tickLine={{ stroke: `rgba(255,255,255,${leftAxisOpacity})` }}
            tickFormatter={leftTickFormatter}
            label={{
              value: leftAxisLabel,
              fontSize: "var(--body-size)",
              angle: -90,
              position: "center",
              fill: `rgba(255,255,255,${leftAxisOpacity})`,
              dx: -38,
            }}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            domain={rightDomain}
            tick={{
              fill: `rgba(255,255,255,${rightAxisOpacity})`,
              fontSize: "var(--body-size)",
            }}
            axisLine={{
              stroke: `rgba(255,255,255,${rightAxisOpacity})`,
              strokeWidth: 1,
            }}
            tickLine={{ stroke: `rgba(255,255,255,${rightAxisOpacity})` }}
            tickFormatter={rightTickFormatter}
            label={{
              value: rightAxisLabel,
              fontSize: "var(--body-size)",
              angle: 90,
              position: "center",
              fill: `rgba(255,255,255,${rightAxisOpacity})`,
              dx: 38,
            }}
          />

          <Legend formatter={legendFormatter} wrapperStyle={{ paddingTop: 8 }} />

          {/* LEFT SERIES */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey={leftDataKey}
            name={leftName}
            stroke="none"
            fill={leftColor}
            fillOpacity={0.35 * leftOpacity}
            activeDot={false}
            isAnimationActive={animate}
            animationBegin={0}
            animationDuration={swDuration}
            animationEasing="ease-out"
            legendType="none"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey={leftDataKey}
            stroke="white"
            strokeOpacity={leftOpacity}
            strokeWidth={5}
            dot={false}
            activeDot={false}
            style={{ pointerEvents: "none" }}
            isAnimationActive={animate}
            animationBegin={0}
            animationDuration={swDuration}
            animationEasing="ease-out"
            legendType="none"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey={leftDataKey}
            name={leftName}
            stroke={leftColor}
            strokeOpacity={leftOpacity}
            strokeWidth={3}
            dot={false}
            activeDot={false}
            isAnimationActive={animate}
            animationBegin={0}
            animationDuration={swDuration}
            animationEasing="ease-out"
          />

          {/* RIGHT SERIES */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey={rightDataKey}
            name={rightName}
            stroke="none"
            fill={rightColor}
            fillOpacity={0.5 * rightOpacity}
            activeDot={false}
            isAnimationActive={animate}
            animationBegin={gwDelay}
            animationDuration={gwDuration}
            animationEasing="ease-out"
            legendType="none"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={rightDataKey}
            stroke="white"
            strokeOpacity={rightOpacity}
            strokeWidth={5}
            dot={false}
            activeDot={false}
            isAnimationActive={animate}
            animationBegin={gwDelay}
            animationDuration={gwDuration}
            animationEasing="ease-out"
            legendType="none"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={rightDataKey}
            name={rightName}
            stroke={rightColor}
            strokeOpacity={rightOpacity}
            strokeWidth={2.5}
            dot={false}
            activeDot={false}
            isAnimationActive={animate}
            animationBegin={gwDelay}
            animationDuration={gwDuration}
            animationEasing="ease-out"
          />

          {referenceX != null && (
            <ReferenceLine
              yAxisId="right"
              x={referenceX}
              stroke="rgba(255,255,255,0.3)"
              strokeOpacity={rightOpacity}
              strokeDasharray="4 4"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        {(["left", "right", "both"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={btnStyle(viewMode === mode, mode)}
          >
            {mode === "left"
              ? leftName
              : mode === "right"
                ? rightName
                : "Both"}
          </button>
        ))}
      </div>
    </div>
  );
}