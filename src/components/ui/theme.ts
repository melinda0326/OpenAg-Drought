import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    text: {
      primary: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    body1: {
      fontSize: "1.125rem",
      lineHeight: 1.5,
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#f5f5f5",
        },
      },
    },
  },
});

export default theme;