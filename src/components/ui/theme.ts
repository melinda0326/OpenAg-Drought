import { alpha, createTheme } from "@mui/material/styles";
import type React from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    stat: React.CSSProperties;
    source: React.CSSProperties;
    chartLabel: React.CSSProperties;
    control: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    stat?: React.CSSProperties;
    source?: React.CSSProperties;
    chartLabel?: React.CSSProperties;
    control?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    stat: true;
    source: true;
    chartLabel: true;
    control: true;
  }
}

const fontFamily = "Inter, system-ui, sans-serif";

const baseTheme = createTheme({
  palette: {
    background: {
      default: "#242424",
      paper: "rgba(10, 12, 18, 0.68)",
    },
    primary: {
      main: "#78d991",
      light: "#bdf7ca",
      dark: "#2f7d44",
      contrastText: "#07110a",
    },
    secondary: {
      main: "#111827",
      light: "#263244",
      dark: "#06080c",
      contrastText: "#f8fafc",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "rgba(255,255,255,0.7)",
    },
  },
  spacing: 8,
});

const theme = createTheme(baseTheme, {
  typography: {
    fontFamily,
    h1: {
      fontSize: "clamp(2.35rem, 9vw, 3.25rem)",
      lineHeight: 1.08,
      fontWeight: 600,
      [baseTheme.breakpoints.up("sm")]: {
        fontSize: "clamp(3rem, 6vw, 4rem)",
      },
      [baseTheme.breakpoints.up("lg")]: {
        fontSize: "clamp(3.6rem, 4vw, 4.5rem)",
      },
    },
    h2: {
      fontSize: "clamp(2rem, 6vw, 2.75rem)",
      lineHeight: 1.15,
      fontWeight: 700,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(2.4rem, 3.25vw, 3.25rem)",
      },
    },
    h3: {
      fontSize: "clamp(1.55rem, 5vw, 2rem)",
      lineHeight: 1.2,
      fontWeight: 300,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(1.9rem, 2.25vw, 2.35rem)",
      },
    },
    h4: {
      fontSize: "clamp(1.25rem, 4vw, 1.55rem)",
      lineHeight: 1.25,
      fontWeight: 600,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(1.45rem, 1.75vw, 1.9rem)",
      },
    },
    h5: {
      fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
      lineHeight: 1.3,
      fontWeight: 600,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(1.2rem, 1.25vw, 1.45rem)",
      },
    },
    h6: {
      fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
      lineHeight: 1.35,
      fontWeight: 600,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(1.05rem, 1vw, 1.25rem)",
      },
    },
    body1: {
      fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
      lineHeight: 1.5,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(1.1rem, 0.7vw + 0.9rem, 1.2rem)",
      },
    },
    body2: {
      fontSize: "clamp(0.925rem, 2vw, 1rem)",
      lineHeight: 1.5,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(0.975rem, 0.45vw + 0.85rem, 1.05rem)",
      },
    },
    caption: {
      fontSize: "clamp(0.875rem, 1.8vw, 0.95rem)",
      lineHeight: 1.4,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(0.925rem, 0.35vw + 0.8rem, 1rem)",
      },
    },
    button: {
      fontSize: "clamp(0.875rem, 1.8vw, 0.95rem)",
      lineHeight: 1.4,
      fontWeight: 600,
      textTransform: "none",
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(0.925rem, 0.35vw + 0.8rem, 1rem)",
      },
    },
    stat: {
      fontFamily,
      fontSize: "clamp(3.5rem, 16vw, 5.5rem)",
      lineHeight: 1.05,
      fontWeight: 600,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(5rem, 8vw, 8.75rem)",
      },
    },
    source: {
      fontFamily,
      fontSize: "clamp(0.875rem, 1.8vw, 0.95rem)",
      lineHeight: 1.4,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(0.925rem, 0.35vw + 0.8rem, 1rem)",
      },
    },
    chartLabel: {
      fontFamily,
      fontSize: "clamp(0.8rem, 1.6vw, 0.875rem)",
      lineHeight: 1.3,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(0.85rem, 0.3vw + 0.75rem, 0.95rem)",
      },
    },
    control: {
      fontFamily,
      fontSize: "clamp(0.875rem, 1.8vw, 0.95rem)",
      lineHeight: 1.4,
      fontWeight: 600,
      [baseTheme.breakpoints.up("md")]: {
        fontSize: "clamp(0.925rem, 0.35vw + 0.8rem, 1rem)",
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--space-xs": "clamp(0.375rem, 0.3vw, 0.5rem)",
          "--space-sm": "clamp(0.5rem, 0.45vw, 0.75rem)",
          "--space-md": "clamp(0.75rem, 0.6vw, 1rem)",
          "--space-lg": "clamp(1rem, 0.9vw, 1.5rem)",
          "--space-xl": "clamp(1.5rem, 1.2vw, 2rem)",
          "--space-text-chart": "clamp(2.5rem, 5vw, 5rem)",
          [baseTheme.breakpoints.up("sm")]: {
            "--space-xs": "clamp(0.425rem, 0.25vw, 0.55rem)",
            "--space-sm": "clamp(0.625rem, 0.35vw, 0.85rem)",
            "--space-md": "clamp(0.875rem, 0.5vw, 1.125rem)",
            "--space-lg": "clamp(1.25rem, 0.75vw, 1.625rem)",
            "--space-xl": "clamp(1.75rem, 1vw, 2.25rem)",
            "--space-text-chart": "clamp(3rem, 4.5vw, 5.5rem)",
          },
          [baseTheme.breakpoints.up("md")]: {
            "--space-xs": "clamp(0.5rem, 0.2vw, 0.625rem)",
            "--space-sm": "clamp(0.75rem, 0.3vw, 0.95rem)",
            "--space-md": "clamp(1rem, 0.45vw, 1.25rem)",
            "--space-lg": "clamp(1.5rem, 0.65vw, 1.875rem)",
            "--space-xl": "clamp(2rem, 0.9vw, 2.5rem)",
            "--space-text-chart": "clamp(4rem, 4vw, 6rem)",
          },
          [baseTheme.breakpoints.up("lg")]: {
            "--space-md": "clamp(1rem, 0.35vw, 1.375rem)",
            "--space-lg": "clamp(1.5rem, 0.55vw, 2rem)",
            "--space-xl": "clamp(2rem, 0.75vw, 2.75rem)",
            "--space-text-chart": "clamp(4.5rem, 3.5vw, 6.5rem)",
          },
          [baseTheme.breakpoints.up("xl")]: {
            "--space-text-chart": "clamp(5rem, 3vw, 7rem)",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#f5f5f5",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
          letterSpacing: 0.2,
          textTransform: "none",
        },
        containedPrimary: {
          color: baseTheme.palette.primary.contrastText,
          backgroundColor: baseTheme.palette.primary.main,
          border: `1px solid ${alpha("#ffffff", 0.5)}`,
          boxShadow: `0 16px 38px ${alpha(baseTheme.palette.primary.dark, 0.34)}`,
          "&:hover": {
            backgroundColor: baseTheme.palette.primary.light,
            boxShadow: `0 20px 48px ${alpha(baseTheme.palette.primary.dark, 0.42)}`,
            transform: "translateY(-1px)",
          },
        },
        containedSecondary: {
          color: baseTheme.palette.secondary.contrastText,
          backgroundColor: alpha(baseTheme.palette.secondary.main, 0.76),
          border: `1px solid ${alpha("#ffffff", 0.22)}`,
          boxShadow: `0 16px 38px ${alpha("#000000", 0.34)}`,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          "&:hover": {
            backgroundColor: alpha("#ffffff", 0.12),
            borderColor: alpha("#ffffff", 0.42),
            boxShadow: `0 20px 48px ${alpha("#000000", 0.42)}`,
            transform: "translateY(-1px)",
          },
        },
      },
    },
  },
});

export default theme;
