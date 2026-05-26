import { style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";

export const tabItem = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  height: "100%",
  minWidth: vars.layout.touchTarget,
  gap: vars.spacing[4],
  textDecoration: "none",
  color: "inherit",
  outline: "none",
  transition: "all 0.2s ease-in-out",
  selectors: {
    "&:focus-visible": {
      borderRadius: vars.radius[4],
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
    "&:active": {
      opacity: 0.6,
    },
  },
});

export const skeletonTabItem = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  height: "100%",
  minWidth: vars.layout.touchTarget,
  gap: vars.spacing[4],
});

export const iconWrapper = style({
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const skeletonLabel = style({
  flexShrink: 0,
});

export const labelText = style({
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.tight,
  textAlign: "center",
});

export const active = style({
  color: vars.color.text.title,
});

export const inactive = style({
  color: vars.color.palette.gray[600],
});
