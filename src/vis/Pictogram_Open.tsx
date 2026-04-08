import React, { useMemo } from "react";

type Props = {
  label: string;
  baseValue: number;
  scenarioValue: number;
  /** dollar value / acreage / volume each square represents */
  squareValue: number;
  cols?: number;
  squareSize?: number;
  gap?: number;
  colorBase?: string;
  colorScenario?: string;
  unit?: string;
};

function formatCompact(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${Math.round(v)}`;
}

export default function Pictogram({
  label,
  baseValue,
  scenarioValue,
  squareValue,
  cols = 5,
  squareSize = 10,
  gap = 2,
  colorBase = "rgba(255,255,255,0.15)",
  colorScenario = "rgba(255,255,255,0.5)",
  unit = "",
}: Props) {
  const totalSquares = Math.max(1, Math.round(baseValue / squareValue));
  const scenarioSquares = Math.min(
    totalSquares,
    Math.max(0, Math.round(scenarioValue / squareValue))
  );
  const lossSquares = totalSquares - scenarioSquares;
  const loss = baseValue - scenarioValue;

  const rows = Math.ceil(totalSquares / cols);
  const svgW = cols * (squareSize + gap) - gap;
  const svgH = rows * (squareSize + gap) - gap;

  const squares = useMemo(() => {
    const arr: { x: number; y: number; isLoss: boolean }[] = [];
    for (let i = 0; i < totalSquares; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const isLoss = i < lossSquares;
      arr.push({
        x: col * (squareSize + gap),
        y: row * (squareSize + gap),
        isLoss,
      });
    }
    return arr;
  }, [totalSquares, lossSquares, cols, squareSize, gap]);

  const lossPct =
    baseValue > 0 ? ((loss / baseValue) * 100).toFixed(0) : "0";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 0,
      }}
    >
      {/* County name */}
      <span
        style={{
          fontSize: "var(--body-size)",
          fontWeight: 700,
          color: "white",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>

      {/* Loss number */}
      <span
        style={{
          fontSize: "var(--body-size)",
          fontWeight: 700,
          color: "#ff6b6b",
          lineHeight: 1.1,
        }}
      >
        −{formatCompact(loss)}
        {unit ? ` ${unit}` : ""}
        {/* <span style={{ fontWeight: 400, opacity: 0.7, fontSize: 11 }}>
          {" "}
          ({lossPct}%)
        </span> */}
      </span>

      {/* Grid */}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: "block", width: "100%", maxWidth: svgW, height: "auto" }}
      >
        {squares.map((sq, i) => (
          <rect
            key={i}
            x={sq.x}
            y={sq.y}
            width={squareSize}
            height={squareSize}
            rx={1.5}
            ry={1.5}
            fill={sq.isLoss ? colorBase : colorScenario}
          />
        ))}
      </svg>
    </div>
  );
}
