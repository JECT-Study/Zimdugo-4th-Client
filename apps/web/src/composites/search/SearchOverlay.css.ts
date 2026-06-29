import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  top: 0,
  bottom: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  height: "100dvh",
  backgroundColor: vars.color.bg.default,
  zIndex: vars.zIndex.modal,
  display: "flex",
  flexDirection: "column",
  overscrollBehavior: "contain",
  "@media": {
    [`screen and (min-width: ${vars.layout.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
    },
  },
});

export const header = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[12],
  padding: `${vars.spacing[12]} ${vars.spacing[16]}`,
  paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
});

export const searchFieldSlot = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
});

export const backButton = style({
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  color: vars.color.palette.gray[800],
});

export const backIcon = style({
  width: "24px",
  height: "24px",
});

export const content = style({
  flex: 1,
  paddingTop: vars.spacing[12], // 그룹 간 12px
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  paddingBottom: `calc(${vars.layout.bottomNav} + env(safe-area-inset-bottom, 0px))`,
});

export const sectionHeader = style({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  marginBottom: "17px",
  padding: `0 ${vars.spacing[20]}`,
});

export const deleteAllButton = style({
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  color: vars.color.text.surface,
  background: "none",
  border: "none",
  cursor: "pointer",
  paddingBottom: "2px",
  whiteSpace: "nowrap",
});

export const chipViewport = style({
  margin: `0 ${vars.spacing[20]}`,
  overflow: "hidden",
  marginBottom: vars.spacing[20], // 리스트 아이템 패딩(4px) 합쳐서 섹션 간 24px 형성
});

export const chipContainer = style({
  display: "flex",
  gap: vars.spacing[8],
  overflowX: "auto",
  whiteSpace: "nowrap",
  paddingBottom: vars.spacing[8],
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const recentList = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: vars.spacing[8],
});

export const autocompleteList = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});
