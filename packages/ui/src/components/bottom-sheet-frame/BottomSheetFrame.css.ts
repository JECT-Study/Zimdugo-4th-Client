import { style } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

export const draggableWrapper = style({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  margin: "0 auto",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  zIndex: vars.zIndex.bottomSheet,
  touchAction: "none",
});

export const sheet = style({
  position: "relative",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  margin: "0 auto",
  backgroundColor: vars.color.palette.gray[100],
  borderTopLeftRadius: vars.radius[16],
  borderTopRightRadius: vars.radius[16],
  boxShadow: vars.shadow.scale[3],
  overflow: "hidden",
  boxSizing: "border-box",
});

/** 기디팀 바텀시트(`1097-5907`) 전체 높이·세로 플렉스 체인 */
export const sheetNavLayout = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

export const handleArea = style({
  position: "relative",
  height: "24px",
  width: "100%",
  flexShrink: 0,
});

export const handle = style({
  position: "absolute",
  left: "50%",
  top: "8px",
  transform: "translateX(-50%)",
  width: "48px",
  height: "5px",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.palette.gray[400],
});

export const body = style({
  position: "relative",
  width: "100%",
});

export const bodyNavLayout = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
});

export const homeIndicator = style({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  width: "100%",
  height: "34px",
  backgroundColor: vars.color.palette.gray[100],
  flexShrink: 0,
});

export const homeBar = style({
  width: "148px",
  height: "5px",
  marginBottom: "8px",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.palette.gray[800],
});
