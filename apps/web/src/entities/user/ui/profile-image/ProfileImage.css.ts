import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const profileImageContainer = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.palette.gray[300],
  boxShadow: "0 3px 12px 0 rgba(22, 24, 28, 0.12)",
  overflow: "hidden",
  flexShrink: 0,
});

export const profileImageContent = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
  top: 0,
  left: 0,
});

export const profileImageIcon = style({
  width: "22px",
  height: "22px",
});
