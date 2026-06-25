// src/components/ui/openExplorationStyles.ts
import type React from "react";

const font = {
  family:
    'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  size: {
    title: "var(--title-size)",
    subtitle: "var(--source-size)",
    body: "var(--source-size)",
    small: "var(--source-size)",
  },
  weight: {
    bold: 800,
    semibold: 600,
    medium: 500,
    regular: 400,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },
} as const;

export const openExplorationStyles = {
  page: {
    position: "relative" as const,
    width: "100%",
    minHeight: "100vh",
    overflow: "hidden",
    background: "#06080c",
    color: "white",
    fontFamily: font.family,
  },

  // glassPanel: {
  //   position: "fixed" as const,
  //   left: 28,
  //   top: "40%",
  //   transform: "translateY(-50%)",
  //   width: "80%",
  //   maxWidth: "calc(100% - 56px)",
  //   maxHeight: "82vh",
  //   overflow: "auto" as const,
  //   padding: 20,
  //   borderRadius: 20,
  //   background: "rgba(10, 12, 18, 0.68)",
  //   border: "1px solid rgba(255,255,255,0.12)",
  //   boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
  //   backdropFilter: "blur(12px)",
  //   WebkitBackdropFilter: "blur(12px)",
  //   zIndex: 2,
  // },

  glassPanel: {
  // ✅ ONLY appearance (no layout)
  padding: 20,
  borderRadius: 20,
  background: "rgba(10, 12, 18, 0.68)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
},

  titleWrap: {
    position: "fixed" as const,
    left: 48,
    top: 28,
    maxWidth: "50%",
    zIndex: 2,
    pointerEvents: "none" as const,
    textShadow: "0 10px 30px rgba(0,0,0,0.55)",
  },

  title: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    letterSpacing: -0.2,
    margin: 0,
    lineHeight: font.lineHeight.tight,
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 0,
    fontSize: font.size.subtitle,
    fontWeight: font.weight.regular,
    opacity: 0.85,
    lineHeight: font.lineHeight.normal,
  },

  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: font.size.small,
    fontWeight: font.weight.semibold,
    letterSpacing: 1.2,
    opacity: 0.7,
  },

  divider: {
    height: 1,
    background:
      "linear-gradient(to right, rgba(255,255,255,0.0), rgba(255,255,255,0.14), rgba(255,255,255,0.0))",
    margin: "16px 0",
  },

  hint: {
    fontSize: font.size.body,
    fontWeight: font.weight.regular,
    opacity: 0.72,
    lineHeight: font.lineHeight.relaxed,
  },

  sliderWrap: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
  },

  sliderTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sliderLabel: {
    fontSize: font.size.body,
    fontWeight: font.weight.medium,
    opacity: 0.85,
  },

  sliderValue: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
  },

  // ✅ MUST remain a function (you call S.legendBar(...))
  legendBar: (cssGradient: string): React.CSSProperties => ({
    height: 12,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: cssGradient,
  }),

  legendTicks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: font.size.small,
    fontWeight: font.weight.medium,
    opacity: 0.7,
    marginTop: 8,
  },

  segmented: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
  },

  // ✅ MUST remain a function (you call S.segBtn(active))
    segBtn: (active: boolean): React.CSSProperties => ({
    padding: "10px 10px",
    borderRadius: 12,
    border: active
      ? "1px solid rgba(255,255,255,0.35)"
      : "1px solid rgba(255,255,255,0.14)",
    background: active
      ? "rgba(255,255,255,0.18)"
      : "rgba(255,255,255,0.06)",
    color: "white",
    fontSize: font.size.body,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: active
      ? "0 0 0 1px rgba(255,255,255,0.15), 0 8px 22px rgba(0,0,0,0.65), 0 0 14px rgba(255,255,255,0.12)"
      : "none",
    transition: "all 160ms ease",
  }),

  pillRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
  },

  // ✅ MUST remain a function (you call S.pill(active))
  pill: (active: boolean): React.CSSProperties => ({
    padding: "10px 10px",
    borderRadius: 12,
    border: active
      ? "1px solid rgba(255,255,255,0.35)"
      : "1px solid rgba(255,255,255,0.14)",
    background: active
      ? "rgba(255,255,255,0.18)"
      : "rgba(255,255,255,0.06)",
    color: "white",
    fontSize: font.size.body,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: active
      ? "0 0 0 1px rgba(255,255,255,0.15), 0 8px 22px rgba(0,0,0,0.65), 0 0 14px rgba(255,255,255,0.12)"
      : "none",
    transition: "all 160ms ease",
  }),

  stepRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 6,
  } as React.CSSProperties,

  stepNum: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: font.size.small,
    fontWeight: 700,
    color: "rgba(255,255,255,0.7)",
    marginRight: 8,
    flexShrink: 0,
  } as React.CSSProperties,

  stepTitle: {
    fontSize: "var(--source-size)",
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.7)",
  } as React.CSSProperties,

  stepDesc: {
    fontSize: font.size.small,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.4,
    marginBottom: 10,
  } as React.CSSProperties,

  tooltip: {
    position: "absolute" as const,
    zIndex: 10,
    pointerEvents: "none" as const,
    background: "rgba(10,12,18,0.78)",
    color: "white",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    maxWidth: 260,
    lineHeight: font.lineHeight.normal,
    fontSize: font.size.body,
  },
} as const;

export const openExplorationSliderCss = `
@keyframes thumbGlow {
  0%, 100% { box-shadow: 0 0 6px 3px rgba(255,255,255,0.15); }
  50% { box-shadow: 0 0 22px 14px rgba(255,255,255,0.5); }
}
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 30px;
  background: transparent;
}
input[type="range"]::-webkit-slider-runnable-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.14);
}
input[type="range"]::-moz-range-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.14);
}
input[type="range"].colored-track::-webkit-slider-runnable-track {
  background:
    linear-gradient(
      to right,
      rgba(244,67,54,0.7)
    )
    0 0 / var(--slider-pct, 0%) 100% no-repeat,
    rgba(255,255,255,0.12);
}
input[type="range"].colored-track::-moz-range-track {
  background:
    linear-gradient(
      to right,
      rgba(244,67,54,0.7)
    )
    0 0 / var(--slider-pct, 0%) 100% no-repeat,
    rgba(255,255,255,0.12);
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(255,255,255,0.92);
  border: 3px solid rgba(10,12,18,0.85);
  margin-top: -5px;  /* Adjusted */
  box-shadow: 0 0 12px 4px rgba(255,255,255,0.3);  /* Changed to wrap around */
}
input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(255,255,255,0.92);
  border: 3px solid rgba(10,12,18,0.85);
  box-shadow: 0 0 12px 4px rgba(255,255,255,0.3);  /* Changed to wrap around */
}
input[type="range"]:focus { outline: none; }
`;
