import { useRef, useState, useCallback } from "react";
import { Typography } from "@mui/material";

export default function Compare_Image() {
  const [sliderPos, setSliderPos] = useState(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
  <div
    style={{
      maxWidth: "var(--overlay-width)",
      margin: "var(--overlay-margin)",
    }}
  >
    <Typography
      component="h3"
      variant="h3"
      gutterBottom
    >
      How Drought Hurts California Agriculture
    </Typography>

    <Typography
      component="p"
      variant="body1"
      sx={{mb: "var(--space-text-chart)"}}
    >
      When water supplies are insufficient, irrigated farmland is often left
      unplanted or fallowed — a strategic decision to mitigate losses, but one
      that farmers are often forced into.
    </Typography>

    {/* Slider container */}
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        borderRadius: 8,
        cursor: "ew-resize",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* After image*/}
      <img
        src="/image/rice_after.png"
        alt="Rice fields after drought"
        draggable={false}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      />

      {/* Before image*/}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${sliderPos}%`,
          overflow: "hidden",
        }}
      >
        <img
          src="/image/rice_before.png"
          alt="Rice fields before drought"
          draggable={false}
          style={{
            display: "block",
            width: containerRef.current
              ? `${containerRef.current.getBoundingClientRect().width}px`
              : "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Slider line + handle */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          transform: "translateX(-50%)",
          width: 3,
          background: "white",
          boxShadow: "0 0 6px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Arrow icons */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 12L4 8M4 8L8 4M4 8H11M16 12L20 16M20 16L16 20M20 16H13"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <Typography
      component="p"
      variant="body1"
      sx={{
        color: "rgba(255,255,255,0.7)",
        fontStyle: "italic",
        textAlign: "center",
        mt: "2.5rem"
      }}
    >
      Comparison of rice fields before and after drought conditions in
      Scaremento Valley, showing the reduction in cultivated land due to water
      scarcity.
    </Typography>
  </div>
);
}
