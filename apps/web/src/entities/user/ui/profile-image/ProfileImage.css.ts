import { style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";

export const profileImageContainer = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.surface,
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
  color: vars.color.icon.lighten,
});
