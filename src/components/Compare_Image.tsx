import { useRef, useState, useCallback } from "react";

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

      <h2
          style={{
            color: "white",
            fontSize: "var(--title-size)",
            fontWeight: 700,
           maxWidth: "var(--overlay-width)",
            lineHeight: 1.2,
          }}
        >
          How Drought Hurts California Agriculture
        </h2>
      <p
        style={{
          color: "#fff",
          fontSize: "var(--body-size)",
          lineHeight: 1.6,
          marginTop: 0,
          marginBottom: "2rem",
        }}
      >
        When water supplies are insufficient, irrigated farmland is often left
        unplanted or fallowed — a strategic decision to mitigate losses, but one
        that farmers are often forced into.
      </p>

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

        {/* Labels */}
        {/* <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            color: "#fff",
            fontSize: "var(--body-size)",
            fontWeight: 600,
            fontFamily: "Inter, system-ui, sans-serif",
            textShadow: "0 1px 6px rgba(0,0,0,0.7)",
            pointerEvents: "none",
          }}
        >
          Before Drought
        </span>
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#fff",
            fontSize: "var(--body-size)",
            fontWeight: 600,
            fontFamily: "Inter, system-ui, sans-serif",
            textShadow: "0 1px 6px rgba(0,0,0,0.7)",
            pointerEvents: "none",
          }}
        >
          After Drought
        </span> */}

        {/* Caption */}

      </div>

        <p
        style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "var(--body-size)",
            marginTop: "0.75rem",
            marginBottom: 0,
            fontStyle: "italic",
            textAlign: "center",
        }}
        >
        Comparison of rice fields before and after drought conditions in Scaremento Valley, showing
        the reduction in cultivated land due to water scarcity.
        </p>
    </div>
  );
}
