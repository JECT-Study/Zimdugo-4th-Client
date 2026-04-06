import { createGlobalTheme } from "@vanilla-extract/css";

const fontFamilies = {
  Pretendard: "Pretendard",
  MetroPolis: "MetroPolis",
} as const;

const sampleText = {
  ko: "다람쥐 헌 쳇바퀴에 타고파",
  en: "The quick brown fox jumps over the lazy dog",
} as const;

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
  tight: "120%",
  narrow: "130%",
  default: "140%",
} as const;

export const typographyTheme = createGlobalTheme(":root", {
  fontFamily: fontFamilies,
  sampleText: sampleText,
  fontWeight: fontWeightScale,
  fontSize: fontSizeScale,
  lineHeight: lineHeightScale,
});

export const typography = {
  ...typographyTheme,
  scale: {
    fontWeight: fontWeightScale,
    fontSize: fontSizeScale,
    lineHeight: lineHeightScale,
  },
};
