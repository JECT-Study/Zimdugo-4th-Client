import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const rowBase = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  boxSizing: "border-box",
  minHeight: "56px",
  padding: "6px 20px", // 8px -> 6px (아이템 간격 12px를 맞추기 위함)
  gap: vars.spacing[12],
});

export const left = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[12],
  minWidth: 0,
  flex: 1,
});

export const textCol = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  alignItems: "flex-start",
  justifyContent: "center",
  minWidth: 0,
});

export const titleText = style({
  margin: 0,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  color: vars.color.text.title,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
});

export const recentRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  boxSizing: "border-box",
  minHeight: "32px",
  padding: "4px 20px", // 상하 4px (아이템 간격 8px 유지)
  outline: "none",
  selectors: {
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const recentLeft = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  minWidth: 0,
  flex: 1,
  padding: 0,
  border: "none",
  background: "transparent",
  color: "inherit",
  textAlign: "left",
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const recentIconSlot = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});

export const recentTextCol = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

export const recentLabel = style({
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.text.title,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const recentRight = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  flexShrink: 0,
});

export const recentDate = style({
  fontSize: vars.typography.fontSize[12],
  color: vars.color.palette.gray[500],
});

export const removeBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: vars.color.palette.gray[500],
});

export const metaRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  flexWrap: "wrap",
});

export const distance = style({
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  color: vars.color.text.content,
  whiteSpace: "nowrap",
});

export const dot = style({
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1,
});

export const updated = style({
  margin: 0,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  color: vars.color.palette.gray[600],
  whiteSpace: "nowrap",
});

export const favoriteBtn = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  padding: 0,
  border: "none",
  background: "transparent",
  borderRadius: "6px",
  cursor: "pointer",
  flexShrink: 0,
  outline: "none",
});

export const englishSubtitle = style({});
export const recentRowEnglish = style({});
export const resultRowEnglish = style({});
export const titleTextClass = style({});
export const metaUpdatedEnglish = style({});
