import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

export const card = style({
  display: "flex",
  flexDirection: "column",
  width: "195px",
  height: "58px",
  padding: "8px 6px 7px 9px",
  boxSizing: "border-box",
  overflow: "hidden",
  border: "1px solid #B8EDC9",
  borderRadius: "16px",
  backgroundColor: "#F0FCF5",
});

export const statusHeader = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  width: "100%",
  height: "20px",
  overflow: "hidden",
  backgroundColor: vars.color.bg.default,
});

export const liveIndicator = style({
  width: "8px",
  height: "8px",
  marginTop: "1px",
  flexShrink: 0,
  borderRadius: vars.radius.max,
  backgroundColor: "#1FCA5A",
});

export const statusLabel = style({
  flexShrink: 0,
  color: "#0D7330",
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "15px",
  whiteSpace: "nowrap",
});

export const updatedLabel = style({
  minWidth: 0,
  flex: 1,
  overflow: "hidden",
  color: "#617A69",
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: "15px",
  textAlign: "right",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const sizeList = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  height: "21px",
  overflow: "hidden",
  backgroundColor: vars.color.bg.default,
  fontSize: "11px",
  lineHeight: "13px",
  whiteSpace: "nowrap",
});

export const sizeItem = style({
  display: "flex",
  alignItems: "flex-start",
  gap: "5px",
  padding: "4px 8px",
  boxSizing: "border-box",
  overflow: "hidden",
  flexShrink: 0,
  borderRadius: vars.radius[8],
});

export const sizeItemState = styleVariants({
  available: {
    color: "#0D7330",
    backgroundColor: "#DBF7E3",
  },
  closed: {
    color: "#737D78",
    backgroundColor: "#EBF0ED",
  },
});

export const sizeLabel = style({
  fontWeight: vars.typography.fontWeight.Regular,
});

export const sizeValue = style({
  fontWeight: vars.typography.fontWeight.SemiBold,
  fontVariantNumeric: "tabular-nums",
});
