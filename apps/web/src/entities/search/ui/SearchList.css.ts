import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

const interactiveRow = {
  width: "100%",
  padding: 0,
  border: 0,
  background: "transparent",
  color: "inherit",
  textAlign: "left",
  cursor: "pointer",
  outline: "none",
  borderRadius: "6px",
  selectors: {
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
} as const;

export const accordionGroup = style({
  width: "100%",
});

export const accordionChildren = style({
  display: "flex",
  flexDirection: "column",
  width: `calc(100% - ${vars.spacing[20]})`,
  marginLeft: vars.spacing[20],
  borderLeft: `1px solid ${vars.color.palette.gray[300]}`,
});

export const placeRow = style({
  display: "flex",
  width: "100%",
  minHeight: "55px",
  padding: `${vars.spacing[8]} 0`,
  boxSizing: "border-box",
});

export const placeMain = style({
  ...interactiveRow,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.spacing[12],
});

export const lockerRow = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "100%",
  minHeight: "73px",
  padding: `${vars.spacing[8]} 0`,
  boxSizing: "border-box",
  gap: vars.spacing[12],
});

export const nestedLockerRow = style({
  paddingLeft: vars.spacing[12],
});

export const lockerMain = style({
  ...interactiveRow,
  minWidth: 0,
  flex: 1,
});

export const resultContent = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  minWidth: 0,
  flex: 1,
});

export const resultTextColumn = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: vars.spacing[4],
  minWidth: 0,
  flex: 1,
});

export const titleText = style({
  display: "block",
  width: "100%",
  maxHeight: "2.4em",
  overflow: "hidden",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  whiteSpace: "normal",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const detailMetaRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  minWidth: 0,
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
});

export const categoryText = style({
  color: vars.color.text.disable,
});

export const updatedText = style({
  overflow: "hidden",
  color: vars.color.text.disable,
  textOverflow: "ellipsis",
});

export const addressText = style({
  overflow: "hidden",
  color: vars.color.text.surface,
  textOverflow: "ellipsis",
});

export const metaDot = style({
  flexShrink: 0,
  color: vars.color.text.disable,
});

export const markerBadge = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  flexShrink: 0,
});

export const arrowSlot = style({
  display: "inline-flex",
  flexShrink: 0,
  transition: "transform 160ms ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const arrowExpanded = style({
  transform: "rotate(180deg)",
});

export const favoriteBtn = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
  padding: 0,
  border: 0,
  borderRadius: "6px",
  background: "transparent",
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const recentRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  minHeight: "32px",
  padding: `4px ${vars.spacing[20]}`,
  boxSizing: "border-box",
  outline: "none",
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
  width: "40px",
  height: "40px",
  flexShrink: 0,
});

export const recentTextCol = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

export const recentLabel = style({
  display: "block",
  maxHeight: "2.4em",
  overflow: "hidden",
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  whiteSpace: "normal",
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
});

export const recentRight = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  flexShrink: 0,
});

export const recentDate = style({
  color: vars.color.palette.gray[500],
  fontSize: vars.typography.fontSize[12],
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
  color: vars.color.palette.gray[500],
  cursor: "pointer",
});

export const englishSubtitle = style({});
export const recentRowEnglish = style({});
export const resultRowEnglish = style({});
export const titleTextClass = style({});
export const metaUpdatedEnglish = style({});

export const closedOpacity = style({
  opacity: 0.5,
});
