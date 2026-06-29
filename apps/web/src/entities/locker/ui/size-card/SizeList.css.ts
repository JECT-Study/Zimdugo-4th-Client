import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  width: "100%",
  boxSizing: "border-box",
  height: "168px",
  padding: "16px 56px",
  justifyContent: "space-between",
  alignItems: "flex-end",
  border: `1px solid ${vars.color.palette.gray[500]}`,
  borderRadius: vars.radius.scale[6],
  background: vars.color.bg.surface,
});
