import { createGlobalTheme } from "@vanilla-extract/css";

const fontWeightScale = {
  Thin: "100",
  ExtraLight: "200",
  Light: "300",
  Regular: "400",
  Medium: "500",
  SemiBold: "600",
  Bold: "700",
  ExtraBold: "800",
  Black: "900",
} as const;

const fontSizeScale = {
  12: "12px",
  14: "14px",
  16: "16px",
  18: "18px",
  20: "20px",
  24: "24px",
  26: "26px",
  30: "30px",
  36: "36px",
  48: "48px",
} as const;

const lineHeightScale = {
  none: "1px",
  tight: "16px",
  normal: "20px",
  relaxed: "24px",
  loose: "28px",
} as const;

type FontToken = {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
};

const fontScale = {
  hero: {
    fontSize: fontSizeScale[48],
    fontWeight: fontWeightScale.SemiBold,
    lineHeight: "120%",
  },
  h1: {
    fontSize: fontSizeScale[36],
    fontWeight: fontWeightScale.SemiBold,
    lineHeight: "120%",
  },
  h2: {
    fontSize: fontSizeScale[24],
    fontWeight: fontWeightScale.SemiBold,
    lineHeight: "120%",
  },
  h3: {
    fontSize: fontSizeScale[18],
    fontWeight: fontWeightScale.SemiBold,
    lineHeight: "120%",
  },
  body1: {
    fontSize: fontSizeScale[16],
    fontWeight: fontWeightScale.SemiBold,
    lineHeight: "120%",
  },
  body2: {
    fontSize: fontSizeScale[14],
    fontWeight: fontWeightScale.SemiBold,
    lineHeight: "120%",
  },
  caption: {
    fontSize: fontSizeScale[12],
    fontWeight: fontWeightScale.Medium,
    lineHeight: "120%",
  },
  btn: {
    fontSize: fontSizeScale[16],
    fontWeight: fontWeightScale.Medium,
    lineHeight: "120%",
  },
} as const satisfies Record<string, FontToken>;

export const typographyTheme = createGlobalTheme(":root", {
  fontSize: fontSizeScale,
  fontWeight: fontWeightScale,
  lineHeight: lineHeightScale,
  font: fontScale,
});

export const typography = {
  ...typographyTheme,
  scale: {
    fontSize: fontSizeScale,
    fontWeight: fontWeightScale,
    lineHeight: lineHeightScale,
    font: fontScale,
  },
};
