import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const control = style({
  width: "40px",
  height: "40px",
});

export const remainingBadge = style({
  position: "absolute",
  left: "-8px",
  top: "33px",
  zIndex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "58px",
  height: "20px",
  padding: `0 ${vars.spacing[4]}`,
  borderRadius: "20px",
  backgroundColor: vars.color.bg.brand.default,
  color: vars.color.text.white,
  fontSize: "10px",
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: 1,
  whiteSpace: "nowrap",
  pointerEvents: "none",
});
