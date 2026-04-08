import React, { useMemo } from "react";

type Props = {
  revenue2019: number;
  revenue2022: number;
  /** dollar value each square represents */
  squareValue?: number;
  /** grid columns */
  cols?: number;
  squareSize?: number;
  gap?: number;
  color2022?: string;
  colorLoss?: string;
};

export default function PictogramRevenue({
  revenue2019,
  revenue2022,
  squareValue = 5_000_000,
  cols = 10,
  squareSize = 12,
  gap = 2,
  color2022 = "#FFCC80",
  colorLoss = "#E65100",
}: Props) {
  const totalSquares = Math.round(revenue2019 / squareValue);
  const filledSquares = Math.round(revenue2022 / squareValue);
  const lossSquares = totalSquares - filledSquares;
  const loss = revenue2019 - revenue2022;

  const rowCount = cols;                         // cols prop now means rows
  const colCount = Math.ceil(totalSquares / rowCount);
  const svgW = colCount * (squareSize + gap) - gap;
  const svgH = rowCount * (squareSize + gap) - gap;

  const squares = useMemo(() => {
    const arr: { x: number; y: number; isLoss: boolean }[] = [];
    // Column-major fill: fills down each column first, then moves right
    for (let i = 0; i < totalSquares; i++) {
      const col = Math.floor(i / rowCount);
      const row = i % rowCount;
      const isLoss = i >= totalSquares - lossSquares; // right-side squares = loss
      arr.push({
        x: col * (squareSize + gap),
        y: row * (squareSize + gap),
        isLoss,
      });
    }
    return arr;
  }, [totalSquares, lossSquares, rowCount, squareSize, gap]);

  const formatMoney = (v: number, signed = false) => {
  const abs = Math.abs(v);
  const sign = signed && v !== 0 ? (v < 0 ? "-" : "+") : "";

  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

  const formatSquareVal = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
    return `$${v}`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(8px)",
        borderRadius: 12,
        padding: "2rem",
      }}
    >
      {/* Loss label */}
      <div
        style={{
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span
          id="pictogram-revenue-number"
          style={{
            fontSize: "var(--title-size)",
            fontWeight: 500,
            color: "white",
            lineHeight: 1.1,
          }}
        >
          {formatMoney(-loss, true)}
        </span>
      </div>

      {/* Pictogram grid */}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: "block", width: "100%", height: "auto",    marginLeft: "-20px", }}
      >
        {squares.map((sq, i) => (
          <rect
            key={i}
            x={sq.x}
            y={sq.y}
            width={squareSize}
            height={squareSize}
            rx={3}
            ry={3}
            fill={sq.isLoss ? colorLoss : color2022}
          />
        ))}
      </svg>

      <span
        style={{
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.5)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        Each square = {formatSquareVal(squareValue)}
      </span>
    </div>
  );
}
