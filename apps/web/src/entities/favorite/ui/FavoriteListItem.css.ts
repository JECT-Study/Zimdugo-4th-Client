import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const root = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  minWidth: 0,
  minHeight: "56px",
  padding: `${vars.spacing[8]} ${vars.spacing[20]}`,
  boxSizing: "border-box",
  gap: vars.spacing[12],
});

export const touchTarget = style({
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  flex: 1,
  gap: vars.spacing[12],
  padding: 0,
  border: 0,
  borderRadius: vars.radius[6],
  background: "transparent",
  color: "inherit",
  textAlign: "left",
  outline: "none",
  selectors: {
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

globalStyle(`button${touchTarget}`, {
  cursor: "pointer",
});

export const markerBadge = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  flexShrink: 0,
});

export const textColumn = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  minWidth: 0,
  flex: 1,
  gap: vars.spacing[4],
});

export const titleGroup = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "100%",
  minWidth: 0,
  color: vars.color.text.title,
  lineHeight: 1.2,
});

export const titleLabel = style({
  maxWidth: "100%",
  overflow: "hidden",
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const titleCaption = style({
  maxWidth: "100%",
  overflow: "hidden",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const metaRow = style({
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  gap: vars.spacing[8],
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  whiteSpace: "nowrap",
});

export const primaryMetaText = style({
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
});

export const metaDot = style({
  flexShrink: 0,
  color: vars.color.text.surface,
});

export const favoriteButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
  padding: 0,
  border: 0,
  borderRadius: vars.radius[6],
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&[data-hovered]": {
      background: "transparent",
    },
    "&[data-pressed]": {
      background: "transparent",
    },
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});
