// src/theme.ts
import { createTheme } from "@mui/material/styles";
import {
  colourBlack,
  colourPrimary,
  colourSecondary,
} from "./constants/colors.const";

const theme = createTheme({
  typography: {
    fontFamily: `'Times New Roman'`,
    allVariants: {
      color: colourBlack,
    },
    h1: {
      fontSize: 30,
      fontWeight: "bold",
      padding: 2,
      cursor: "pointer",
      color: colourBlack,
    },
  },
  palette: {
    primary: {
      main: colourPrimary,
    },
    secondary: {
      main: colourSecondary,
    },
  },
});

export default theme;
