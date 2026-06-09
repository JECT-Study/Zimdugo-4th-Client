import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const sheetColumn = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  minHeight: 0,
  paddingTop: vars.spacing[16],
});

export const scrollArea = style({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  touchAction: "pan-y",
  padding: `0 ${vars.spacing[16]} ${vars.spacing[24]}`,
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
});

export const sectionGap24 = style({
  marginTop: vars.spacing[24],
});

export const sizeCardSlot = style({
  marginTop: 0,
  display: "flex",
  justifyContent: "center",
});

export const indoorOutdoor = style({
  marginTop: 0,
});
globalStyle(`${indoorOutdoor} button`, {
  fontSize: "12px",
});

export const priceRow = style({
  display: "flex",
  gap: vars.spacing[16],
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
});

export const priceInputRow = style({
  display: "flex",
  gap: vars.spacing[8],
  alignItems: "center",
  width: "100%",
});

export const priceInputContainer = style({
  flex: 1,
  minWidth: 0,
  position: "relative",
});

export const priceUnit = style({
  position: "absolute",
  right: vars.spacing[12],
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: vars.typography.fontSize[14],
  color: vars.color.palette.gray[600],
  pointerEvents: "none",
});

export const priceErrorText = style({
  margin: 0,
  fontSize: vars.typography.fontSize[12],
  color: vars.color.palette.red[300],
});

export const bottomActionBar = style({
  display: "flex",
  gap: vars.spacing[8],
  padding: `${vars.spacing[12]} ${vars.spacing[16]} calc(${vars.spacing[12]} + env(safe-area-inset-bottom, 0px))`,
  background: vars.color.palette.gray[100],
  borderTop: `1px solid ${vars.color.palette.gray[200]}`,
  flexShrink: 0,
});

export const resetButton = style({
  width: "112px",
  minWidth: "112px",
  color: vars.color.palette.gray[600],
  fontFamily: "var(--font-familiy-kr, Pretendard)",
  fontSize: vars.typography.fontSize[18],
  fontStyle: "normal",
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "normal",
  whiteSpace: "nowrap",
});

export const applyButton = style({
  flex: 1,
});
