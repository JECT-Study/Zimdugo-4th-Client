import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const header = style({
  backgroundColor: vars.color.bg.default,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
});

export const childPage = style({
  minHeight: "100dvh",
  backgroundColor: vars.color.bg.default,
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${vars.layout.header})`,
  paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${vars.layout.bottomNav})`,
  boxSizing: "border-box",
});

export const childContent = style({
  width: "100%",
  padding: `24px ${vars.spacing[16]} ${vars.spacing[24]}`,
  boxSizing: "border-box",
});

export const childList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  width: "100%",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const childListItem = style({
  width: "100%",
  minWidth: 0,
});

export const childSkeletonList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[8],
  width: "100%",
});

export const childSkeletonItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[12],
  width: "100%",
  minHeight: "72px",
  padding: `${vars.spacing[16]} ${vars.spacing[12]}`,
  borderRadius: vars.radius[8],
  backgroundColor: vars.color.bg.surface,
  boxSizing: "border-box",
});

export const childSkeletonText = style({
  display: "flex",
  flex: 1,
  minWidth: 0,
  flexDirection: "column",
  gap: vars.spacing[8],
});

export const childSkeletonFavorite = style({
  flexShrink: 0,
});

export const childLoadingStatus = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

export const childEmpty = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[16],
  width: "100%",
  paddingTop: vars.spacing[24],
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.5,
  textAlign: "center",
});

export const childLoadMoreSlot = style({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  marginTop: vars.spacing[16],
});
