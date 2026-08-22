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

/**
 * 카드 폭은 195px 로 고정이라 en 처럼 사이즈 이름이 긴 로케일에서는 세 항목이 다 들어가지 않는다.
 * 마지막 항목이 잘려 사라지지 않도록 항목을 축소 가능하게 두고, 이름만 말줄임 처리한다.
 */
export const sizeItem = style({
  display: "flex",
  alignItems: "flex-start",
  gap: "5px",
  minWidth: 0,
  flex: "0 1 auto",
  padding: "4px 8px",
  boxSizing: "border-box",
  overflow: "hidden",
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
  minWidth: 0,
  overflow: "hidden",
  fontWeight: vars.typography.fontWeight.Regular,
  textOverflow: "ellipsis",
});

export const sizeValue = style({
  flexShrink: 0,
  fontWeight: vars.typography.fontWeight.SemiBold,
  fontVariantNumeric: "tabular-nums",
});
