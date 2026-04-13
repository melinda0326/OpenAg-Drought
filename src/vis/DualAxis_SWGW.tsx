import React, { useMemo, useRef, useState, useEffect } from "react";
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
type SeriesKey = "leftValue" | "rightValue";

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

  leftDataKey?: SeriesKey;
  rightDataKey?: SeriesKey;

  referenceX?: number;
  width?: string | number;

  leftTickFormatter?: (v: number) => string;
  rightTickFormatter?: (v: number) => string;

  scrollProgress?: number;

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

  scrollProgress = 1,

  swDuration = 3000,
  gwDelay = 1800,
  gwDuration = 3000,
}: Props) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Handle viewMode changes with opacity transition
  useEffect(() => {
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [viewMode]);

  // Scroll-based data: left series reveals in first 60%, right series reveals from 30%-100%
const scrollData = useMemo(() => {
  if (!data.length) return [];

  const n = data.length;

  // Total animation timeline
  const totalDuration = swDuration + gwDelay + gwDuration;

  // Convert duration segments into 0–1 scroll ranges
  const swEnd = swDuration / totalDuration;
  const gwStart = (swDuration + gwDelay) / totalDuration;

  // SW progresses only during its segment
  const leftProgress =
    swEnd === 0 ? 1 : Math.max(0, Math.min(1, scrollProgress / swEnd));

  // GW starts only after SW is done + delay is passed
  const rightProgress =
    gwDuration === 0
      ? 1
      : Math.max(
          0,
          Math.min(1, (scrollProgress - gwStart) / (1 - gwStart))
        );

    const leftCount = Math.ceil(n * leftProgress);
    const rightCount = Math.ceil(n * rightProgress);

    return data.map((d, i) => ({
      ...d,
      [leftDataKey]: i < leftCount ? d[leftDataKey] : null,
      [rightDataKey]: i < rightCount ? d[rightDataKey] : null,
    }));
  }, [
    data,
    scrollProgress,
    leftDataKey,
    rightDataKey,
    swDuration,
    gwDelay,
    gwDuration,
  ]);

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
      <div
        style={{
          opacity: isTransitioning ? 0.4 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={scrollData}
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
              isAnimationActive={false}
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
              isAnimationActive={false}
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
              isAnimationActive={false}
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
              isAnimationActive={false}
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
              isAnimationActive={false}
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
              isAnimationActive={false}
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
      </div>

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