import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

type StorySectionProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export default function StorySection({ children, sx }: StorySectionProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        px: "var(--overlay-margin)",
        position: "relative",
        // zIndex: 2,
        color: "#f5f5f5",
        // lineHeight: "1.5rem",
        // pointerEvents: "none",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}