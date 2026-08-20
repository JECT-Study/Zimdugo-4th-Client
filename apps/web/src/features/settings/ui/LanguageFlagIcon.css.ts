import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

export const flagFrame = style({
  position: "relative",
  display: "inline-block",
  width: "25px",
  height: "20px",
  flexShrink: 0,
  overflow: "hidden",
  borderRadius: vars.radius.scale[6],
  boxSizing: "border-box",
  backgroundColor: vars.color.bg.default,
});

export const flagFrameBorder = style({
  border: `1px solid ${vars.color.border.default}`,
});

const imageBase = style({
  position: "absolute",
  display: "block",
  maxWidth: "none",
  userSelect: "none",
  pointerEvents: "none",
});

export const simpleFlagImage = styleVariants({
  korea: [
    imageBase,
    {
      inset: "6.67% 10.37% 10.25% 10%",
      width: "79.63%",
      height: "83.08%",
    },
  ],
  unitedStates: [
    imageBase,
    {
      top: 0,
      left: 0,
      width: "142.5%",
      height: "100%",
    },
  ],
  japan: [
    imageBase,
    {
      top: 0,
      left: "-6.25%",
      width: "112.5%",
      height: "100%",
    },
  ],
  taiwan: [
    imageBase,
    {
      top: 0,
      left: 0,
      width: "112.5%",
      height: "100%",
    },
  ],
});

export const chinaBase = style({
  width: "100%",
  height: "100%",
});

export const chinaStar = styleVariants({
  large: [
    imageBase,
    {
      top: "10%",
      left: "7.5%",
      width: "22.5%",
      height: "27%",
    },
  ],
  first: [
    imageBase,
    {
      top: "3.66%",
      left: "32.4%",
      width: "7.5%",
      height: "9%",
      transform: "rotate(-120.93deg)",
    },
  ],
  second: [
    imageBase,
    {
      top: "14.44%",
      left: "40.76%",
      width: "7.5%",
      height: "9%",
      transform: "rotate(-98.11deg)",
    },
  ],
  third: [
    imageBase,
    {
      top: "28.82%",
      left: "40.36%",
      width: "7.5%",
      height: "9%",
      transform: "rotate(-74.04deg)",
    },
  ],
  fourth: [
    imageBase,
    {
      top: "37.97%",
      left: "32.23%",
      width: "7.5%",
      height: "9%",
      transform: "rotate(-51.32deg)",
    },
  ],
});
