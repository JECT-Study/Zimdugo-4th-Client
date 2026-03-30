import { createGlobalTheme } from "@vanilla-extract/css";

const palette = {
  gray: {
    100: "#FFFFFF",
    200: "#F5F5F5",
    300: "#EEEEEE",
    400: "#E1E1E1",
    500: "#CACACA",
    600: "#8E8E8E",
    700: "#4B4B4B",
    800: "#16181C",
  },
  blue: {
    100: "#EAEEFD",
    200: "#D3DBFA",
    300: "#718CEF",
    400: "#667ED7",
    500: "#5A70BF",
  },
  red: {
    100: "#FFD3D3",
    200: "#FF9C9C",
    300: "#FF6565",
    400: "#D34141",
  },
  green: {
    100: "#E2F3E7",
    200: "#C7EFC5",
    300: "#97F69C",
    400: "#6AEB70",
    500: "#3BD569",
    600: "#15B344",
    700: "#1D7C3A",
  },
  opacity: {
    200: "rgba(75, 75, 75, 0.20)",
    400: "rgba(75, 75, 75, 0.40)",
    600: "rgba(75, 75, 75, 0.60)",
    800: "rgba(75, 75, 75, 0.80)",
  },
} as const;

const semantic = createGlobalTheme(":root", {
  info: {
    default: palette.blue["300"],
  },
  brand: {
    primary: palette.green["500"],
    symbol: palette.red["300"],
  },
  danger: {
    disabled: palette.red["100"],
    lighten: palette.red["200"],
    default: palette.red["300"],
    darken: palette.red["400"],
  },
  text: {
    title: palette.gray["800"],
    content: palette.gray["700"],
    surface: palette.gray["600"],
    brand: palette.green["500"],
    white: palette.gray["100"],
    error: palette.red["300"],
    assistant: palette.blue["300"],
    disable: palette.gray["500"],
  },
  focus: palette.green["500"],
  icon: {
    primary: palette.green["500"],
    lighten: palette.gray["500"],
    default: palette.gray["600"],
    black: palette.gray["800"],
    bg: palette.gray["200"],
    color: palette.gray["100"],
    error: palette.red["300"],
  },
  border: {
    default: palette.gray["300"],
    hover: palette.gray["500"],
    error: palette.red["300"],
    focus: palette.green["500"],
    action: palette.gray["700"],
  },
  bg: {
    default: palette.gray["100"],
    surface: palette.gray["200"],
    subtle: palette.gray["300"],
    active: palette.gray["700"],
    disable: palette.gray["500"],
    brand: {
      default: palette.green["500"],
      disable: palette.green["100"],
      active: palette.green["700"],
    },
  },
  button: {
    text: {
      color: {
        default: palette.gray["100"],
        disabled: palette.gray["600"],
        neutral: palette.gray["800"],
      },
    },
    outline: {
      border: {
        primary: {
          default: palette.gray["700"],
          hover: palette.green["600"],
          active: palette.green["700"],
          disable: palette.green["200"],
          intent: {
            primary: { hover: palette.green["500"] },
            neutral: { hover: palette.gray["600"] },
          },
        },
      },
    },
    bg: {
      neutral: {
        default: palette.gray["200"],
        hover: palette.gray["200"],
        active: palette.gray["400"],
        disable: palette.gray["200"],
        focus: palette.gray["200"],
      },
      primary: {
        default: palette.green["500"],
        hover: palette.green["300"],
        pressed: palette.green["700"],
        disable: palette.green["100"],
        focus: palette.green["100"],
      },
    },
  },
});

export const color = {
  ...semantic,
  palette,
};
