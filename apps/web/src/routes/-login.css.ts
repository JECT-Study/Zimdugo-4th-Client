import { style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";

export const page = style({
  width: "100%",
  minHeight: "100%",
  position: "relative",
  backgroundColor: vars.color.bg.default,
  overflow: "hidden",
});

export const logo = style({
  position: "absolute",
  top: "80px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "158px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
});

export const loginStack = style({
  position: "absolute",
  left: "50%",
  bottom: "max(60px, env(safe-area-inset-bottom))",
  transform: "translateX(-50%)",
  width: "min(313px, calc(100% - 40px))",
});
