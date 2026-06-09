import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const sheetColumn = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  minHeight: 0,
  padding: `${vars.spacing[16]} ${vars.spacing[20]} 0`,
});

export const listScrollArea = style({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  touchAction: "pan-y",
  padding: `${vars.spacing[20]} 0`,
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const listStack = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
});

export const headerLeadingRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
});

export const headerLeadingButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "32px",
  height: "32px",
  padding: 0,
  border: "none",
  borderRadius: vars.radius[8],
  backgroundColor: "transparent",
  color: vars.color.text.title,
  cursor: "pointer",
});

export const headerTitleSlot = style({
  flex: 1,
  minWidth: 0,
});

export const resultHeader = style({
  display: "flex",
  flexDirection: "column",
  gap: "15px",
});

export const resultSortRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[8],
  overflowX: "auto",
  overflowY: "hidden",
  paddingBottom: "2px",
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const dropdownCompact = style({
  display: "flex",
  height: "32px",
  padding: `0 ${vars.spacing[12]}`,
  justifyContent: "center",
  alignItems: "center",
  gap: vars.spacing[2],
  flexShrink: 0,
});

export const filterChip = style({
  width: "32px",
  minWidth: "32px",
  height: "32px",
  padding: 0,
  gap: 0,
});

globalStyle(`${filterChip} svg path`, {
  fill: vars.color.palette.gray[600],
});

globalStyle(`${filterChip}[data-active='true'] svg path`, {
  fill: vars.color.text.brand,
});

export const emptyState = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100%",
});

export const resultScrollArea = style({
  paddingTop: "17px",
});
