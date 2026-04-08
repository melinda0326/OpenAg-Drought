import { Box, Typography } from "@mui/material";
export default function Scale_RV() {
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
          color: "white",
          maxWidth: "50vw",
          mt: 2,
          lineHeight: 1.5,
          fontFamily: "Inter, system-ui, sans-serif",
          textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)",
        }}
      >
        Statewide, farms and ranches produce more than
        400 agricultural commodities and generate over
      </Typography>
      <Typography
        sx={{
          fontSize: "clamp(5rem, 8vw, 8.75rem)",
          fontWeight: 600,
          lineHeight: 1.05,
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif",
          maxWidth: "90vw",
          textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)",
        }}
      >
        $60 billion revenue
      </Typography>
    </Box>
  );
}
