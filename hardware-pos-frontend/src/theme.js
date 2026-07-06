import { createTheme } from "@mui/material/styles";

// Palette: steel + safety-orange, tuned for a hardware shop POS —
// dark steel navigation, warm neutral workspace, orange for action/alert.
const palette = {
  steel900: "#161F2B",
  steel700: "#22303F",
  steel500: "#3A4C5E",
  steel200: "#C9D1D9",
  accent: "#E8622C",
  accentDark: "#C94F1E",
  bg: "#F3F4F6",
  surface: "#FFFFFF",
  text: "#1B2430",
  textMuted: "#5C6773",
  success: "#2E7D46",
  danger: "#C6392C",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: palette.steel900,
      light: palette.steel500,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: palette.accent,
      dark: palette.accentDark,
      contrastText: "#FFFFFF",
    },
    error: { main: palette.danger },
    success: { main: palette.success },
    background: {
      default: palette.bg,
      paper: palette.surface,
    },
    text: {
      primary: palette.text,
      secondary: palette.textMuted,
    },
    hardware: palette,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", Roboto, system-ui, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.steel900,
          color: "#E7EAEE",
          borderRight: "none",
        },
      },
    },
  },
});

export default theme;