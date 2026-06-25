export const storyContentSx = {
  width: "var(--overlay-width)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
} as const;

export const storyChartSx = {
  width: "var(--chart-width)",
} as const;

export const centeredStatSectionSx = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  px: "var(--overlay-margin)",
} as const;

export const textShadowSx = {
  textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)",
} as const;

export const sourceLinkSx = {
  color: "inherit",
  opacity: 0.6,
  textDecoration: "underline",
  textDecorationColor: "rgba(255,255,255,0.7)",
  "&:hover": {
    color: "inherit",
    opacity: 1,
    textDecoration: "underline",
    textDecorationColor: "currentColor",
  },
  "&:visited": {
    color: "inherit",
  },
} as const;

export const stickyScrollSectionSx = {
  height: "250vh",
  position: "relative",
} as const;

export const stickyViewportSx = {
  position: "sticky",
  top: 0,
  height: "100vh",
  display: "flex",
  alignItems: "center",
} as const;

export const scrollCueSx = {
  position: "absolute",
  bottom: 32,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
  transition: "opacity 0.5s ease",
  pointerEvents: "none",
} as const;
