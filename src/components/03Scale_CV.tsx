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
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          width: "100%",
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
            fontFamily: "Inter, system-ui, sans-serif",
            mx: "auto",
            textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)",
          }}
          gutterBottom
        >
          8.5 million irrigated land
        </Typography>

        <Typography
          sx={{
            fontSize: "var(--subtitle-size)",
            fontWeight: 600,
            maxWidth: "50vw",
            textShadow:
              "0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          used for agriculture in California,
          <br />
          and nearly 9.3&nbsp;million when we include
          <br />
          multi-cropping in a year.
        </Typography>
      </Box>
    </Box>
  );
}

