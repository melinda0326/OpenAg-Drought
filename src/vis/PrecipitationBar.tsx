import { useMemo } from "react";

export type PrecipitationRow = {
  rawDate: number;
  year: number;
  value: number;
  anomaly: number;
};

type Props = {
  rows: PrecipitationRow[];
  width?: number;
  height?: number;
  positiveColor?: string;
  negativeColor?: string;
  svgWidth?: string | number;
  title?: string;
  scrollProgress?: number;
};

export default function PrecipitationBarChart({
  rows,
  width = 920,
  height = 440,
  positiveColor = "#4CC9F0",
  negativeColor = "#a80332",
  svgWidth = "75%",
  title = "Annual Precipitation Anomaly",
  scrollProgress = 0,
}: Props) {

  const margin = { top: 50, right: 20, bottom: 76, left: 72 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const { minAnomaly, maxAnomaly } = useMemo(() => {
    if (rows.length === 0) return { minAnomaly: -1, maxAnomaly: 1 };

    return {
      minAnomaly: Math.min(0, ...rows.map((d) => d.anomaly)),
      maxAnomaly: Math.max(0, ...rows.map((d) => d.anomaly)),
    };
  }, [rows]);

  const yDomainMin = minAnomaly;
  const yDomainMax = maxAnomaly;
  const ySpan = yDomainMax - yDomainMin || 1;

  const y = (v: number) => margin.top + ((yDomainMax - v) / ySpan) * innerH;
  const zeroY = y(0);

  const sidePad = 8;

  const barW = Math.max(
    2,
    Math.min(8, (innerW - sidePad * 2) / Math.max(rows.length, 1) - 1)
  );

  const step =
    rows.length > 0 ? (innerW - sidePad * 2) / rows.length : innerW;

  const x = (i: number) => margin.left + sidePad + i * step + step / 2;

  const tickYears = useMemo(() => {
    const years = Array.from(new Set(rows.map((d) => d.year))).sort(
      (a, b) => a - b
    );
    return years.filter((_, i) => i % 10 === 0);
  }, [rows]);

  const yearIndex = useMemo(() => {
    const m = new Map<number, number>();
    rows.forEach((d, i) => {
      if (!m.has(d.year)) m.set(d.year, i);
    });
    return m;
  }, [rows]);

  const yTicks = useMemo(() => {
    const lo = Math.ceil(yDomainMin);
    const hi = Math.floor(yDomainMax);
    const ticks: number[] = [];
    const step = 2;
    const start =
      lo % step === 0 ? lo : lo + (step - (((lo % step) + step) % step));
    for (let v = start; v <= hi; v += step) ticks.push(v);
    return ticks;
  }, [yDomainMin, yDomainMax]);

  if (rows.length === 0) {
    return <div style={{ color: "white" }}>Loading chart...</div>;
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: svgWidth,
          height: "auto",
          display: "block",
          fontFamily: "font-family, Inter, system-ui, sans-serif",
        }}
      >
      <line
        x1={margin.left}
        x2={margin.left}
        y1={margin.top}
        y2={margin.top + innerH}
        stroke="white"
      />

      <line
        x1={margin.left}
        x2={margin.left + innerW}
        y1={zeroY}
        y2={zeroY}
        stroke="white"
      />

      {yTicks.map((tick, i) => {
        const yy = y(tick);
        return (
          <g key={i}>
            <line
              x1={margin.left - 6}
              x2={margin.left}
              y1={yy}
              y2={yy}
              stroke="white"
            />
            <text
              x={margin.left - 10}
              y={yy}
              fill="white"
              style={{ fontSize: "var(--body-size)" }}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {rows.map((d, i) => {
        const xPos = x(i);
        const yTop = y(Math.max(0, d.anomaly));
        const yBottom = y(Math.min(0, d.anomaly));
        const rectY = Math.min(yTop, yBottom);
        const rectH = Math.max(Math.abs(yBottom - yTop), 1);

        // Each bar has a threshold based on its index
        const barThreshold = (i / rows.length) * 0.85;
        const barProgress = Math.max(0, Math.min(1, (scrollProgress - barThreshold) / 0.15));
        // Slight overshoot for the bounce effect
        const scale = barProgress >= 1 ? 1 : barProgress < 0.01 ? 0 : barProgress * 1.05;
        const clampedScale = Math.min(scale, 1.05);

        return (
          <rect
            key={`${d.rawDate}-${i}`}
            x={xPos - barW / 2}
            y={rectY}
            width={barW}
            height={rectH}
            fill={d.anomaly >= 0 ? positiveColor : negativeColor}
            stroke="white"
            strokeWidth={0.5}
            style={{
              transformOrigin: `center ${d.anomaly >= 0 ? "bottom" : "top"}`,
              transformBox: "fill-box" as any,
              opacity: barProgress,
              transform: `scaleY(${clampedScale})`,
            }}
          >
            <title>
              {`${d.year} | Value: ${d.value.toFixed(2)} | Anomaly: ${d.anomaly.toFixed(2)}`}
            </title>
          </rect>
        );
      })}

      {tickYears.map((yr) => {
        const idx = yearIndex.get(yr);
        if (idx == null) return null;

        const xx = x(idx);

        return (
          <g key={yr}>
            <line x1={xx} x2={xx} y1={zeroY} y2={zeroY + 6} stroke="white" />
            <text
              x={xx}
              y={margin.top + innerH + 24}
              fill="white"
              style={{ fontSize: "var(--body-size)" }}
              textAnchor="middle"
            >
              {yr}
            </text>
          </g>
        );
      })}

      {/* Chart title */}
      <text
        x={width / 2}
        y={18}
        fill="white"
        style={{ fontSize: "var(--body--size)", fontWeight: "600" }}
        textAnchor="middle"
      >
        {title}
      </text>

      <text
        x={margin.left + innerW / 2}
        y={height - 2}
        fill="white"
        style={{ fontSize: "var(--body-size)" }}
        textAnchor="middle"
      >
        Year
      </text>

      <text
        x={14}
        y={margin.top + innerH / 2}
        fill="white"
        style={{ fontSize: "var(--body-size)" }}
        textAnchor="middle"
        transform={`rotate(-90, 14, ${margin.top + innerH / 2})`}
      >
        Precipitation Anomaly (in)
      </text>
    </svg>
    </div>
  );
}