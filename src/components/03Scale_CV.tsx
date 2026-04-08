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
          }}
        >
          8.5 million irrigated land
        </Typography>

        <Typography
          sx={{
            fontSize: "clamp(1rem, 1.5vw, 1.4rem)",
            fontWeight: 600,
            color: "white",
            lineHeight: 1.5,
            fontFamily: "Inter, system-ui, sans-serif",
            maxWidth: "900px",
            mx: "auto",
            mt: 2,
          }}
        >
          area used for agriculture in California, and nearly 9.3 million when we
          include multi-cropping in a year.
        </Typography>
      </Box>
    </Box>
  );
}

