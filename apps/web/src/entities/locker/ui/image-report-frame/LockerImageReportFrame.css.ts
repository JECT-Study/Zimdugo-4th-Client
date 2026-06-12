import { vars } from "@repo/ui/vars";
import { globalStyle, style, styleVariants } from "@vanilla-extract/css";

export const frame = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
  width: "100%",
  padding: vars.spacing[24],
  boxSizing: "border-box",
  border: `1px dashed ${vars.color.border.hover}`,
  borderRadius: vars.radius[6],
  backgroundColor: vars.color.bg.surface,
  color: vars.color.text.surface,
});

export const frameSizeVariants = styleVariants({
  compact: {
    width: "76px",
    minWidth: "76px",
    height: "76px",
    gap: vars.spacing[4],
    padding: vars.spacing[8],
  },
  half: {
    height: "130px",
  },
  full: {
    height: "200px",
    flexShrink: 0,
  },
});

globalStyle(`${frame} svg path`, {
  stroke: vars.color.text.surface,
});

export const textColumn = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  textAlign: "center",
  selectors: {
    [`${frameSizeVariants.compact} &`]: {
      maxWidth: "64px",
      overflow: "hidden",
      fontSize: "10px",
      lineHeight: 1.2,
    },
  },
});

export const textLine = style({});

globalStyle(`${frameSizeVariants.compact} ${textLine}`, {
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});
