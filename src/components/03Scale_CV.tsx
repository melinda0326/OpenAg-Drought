import { Box, Typography } from "@mui/material";

export default function Scale_CV() {
  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          // maxWidth: "1200px",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "clamp(3.5rem, 6vw, 7rem)",
            fontWeight: 600,
            lineHeight: 1.05,
            color: "white",
            fontFamily: "Inter, system-ui, sans-serif",
            // maxWidth: "1000px",
            mx: "auto",
            textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          8.5 million irrigated land
        </Typography>

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
          area used for agriculture in California, and nearly 9.3 million when we
          include multi-cropping in a year.
        </Typography>
      </Box>
    </Box>
  );
}

