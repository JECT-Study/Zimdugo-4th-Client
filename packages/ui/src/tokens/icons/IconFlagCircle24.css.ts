import { style, styleVariants } from "@vanilla-extract/css";

export const root = style({
  position: "relative",
  display: "inline-block",
  width: "24px",
  height: "24px",
  overflow: "hidden",
  borderRadius: "9999px",
  flexShrink: 0,
});

export const canvas = styleVariants({
  center: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "36px",
    height: "27px",
    overflow: "hidden",
    transform: "translate(-50%, -50%)",
  },
  topCenter: {
    position: "absolute",
    left: "50%",
    top: 0,
    width: "36px",
    height: "27px",
    overflow: "hidden",
    transform: "translateX(-50%)",
  },
  topLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "36px",
    height: "27px",
    overflow: "hidden",
  },
});

export const fillImage = style({
  position: "absolute",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%",
  maxWidth: "none",
  pointerEvents: "none",
});

export const koreaCanvas = style({
  background: "#fff",
});

export const koreaSymbol = style({
  position: "absolute",
  left: "9px",
  top: "6px",
  display: "block",
  width: "18px",
  height: "14.0861px",
  pointerEvents: "none",
});

export const wideFlagImage = styleVariants({
  japan: {
    position: "absolute",
    left: "-2.25px",
    top: 0,
    display: "block",
    width: "40.5px",
    height: "27px",
    maxWidth: "none",
    pointerEvents: "none",
  },
  taiwan: {
    position: "absolute",
    left: 0,
    top: 0,
    display: "block",
    width: "40.5px",
    height: "27px",
    maxWidth: "none",
    pointerEvents: "none",
  },
  unitedStates: {
    position: "absolute",
    left: 0,
    top: 0,
    display: "block",
    width: "51.3px",
    height: "27px",
    maxWidth: "none",
    pointerEvents: "none",
  },
});

const chinaStarBase = style({
  position: "absolute",
  display: "block",
  maxWidth: "none",
  pointerEvents: "none",
});

export const chinaStar = styleVariants({
  large: [
    chinaStarBase,
    { left: "7.5%", top: "10%", width: "22.5%", height: "27%" },
  ],
  first: [
    chinaStarBase,
    {
      left: "32.4%",
      top: "3.66%",
      width: "7.5%",
      height: "9%",
      transform: "rotate(-120.93deg)",
    },
  ],
  second: [
    chinaStarBase,
    {
      left: "40.76%",
      top: "14.44%",
      width: "7.5%",
      height: "9%",
      transform: "rotate(-98.11deg)",
    },
  ],
  third: [
    chinaStarBase,
    {
      left: "40.36%",
      top: "28.82%",
      width: "7.5%",
      height: "9%",
      transform: "rotate(-74.04deg)",
    },
  ],
  fourth: [
    chinaStarBase,
    {
      left: "32.23%",
      top: "37.97%",
      width: "7.5%",
      height: "9%",
      transform: "rotate(-51.32deg)",
    },
  ],
});
