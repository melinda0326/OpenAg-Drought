import { Box, Typography } from "@mui/material";

export default function Scale_EMP() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: "var(--overlay-margin)",
      }}
    >
      <Typography
        sx={{
          fontSize: "var(--subtitle-size)",
          fontWeight: 600,
          maxWidth: "50vw",
          mt: 2,
          lineHeight: 1.5,
          textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)",
        }}
      >
        Agricultural commodities serve as inputs for robust food and beverage
        processing and distribution industries. Altogether, farms, ranches, and
        food and beverage industries support around
      </Typography>
      <Typography
        sx={{
          fontSize: "clamp(5rem, 8vw, 8.75rem)",
          fontWeight: 600,
          lineHeight: 1.05,
          maxWidth: "90vw",
          textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)",
        }}
      >
        600,000 jobs
      </Typography>
    </Box>
  );
}
