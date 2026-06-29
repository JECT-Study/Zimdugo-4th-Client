import { vars } from "@repo/ui/vars";
import { keyframes, style } from "@vanilla-extract/css";

const bounceAnimation = keyframes({
  "0%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-15px)" },
  "100%": { transform: "translateY(0)" },
});

export const overlayContainer = style({
  position: "fixed",
  top: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  height: "100dvh",
  backgroundColor: vars.color.bg.default,
  zIndex: 200,
  overflow: "hidden",
  "@media": {
    [`screen and (min-width: ${vars.layout.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
    },
  },
});

export const header = style({
  position: "absolute",
  top: "calc(env(safe-area-inset-top, 0px) + 8px)",
  left: vars.layout.sidePadding,
  right: vars.layout.sidePadding,
  backgroundColor: vars.color.bg.default,
  borderRadius: vars.radius[12],
  boxShadow: vars.shadow[2],
  display: "flex",
  alignItems: "center",
  paddingRight: vars.spacing[4],
  zIndex: 30,
  height: "48px",
  overflow: "hidden",
});

export const backButton = style({
  position: "absolute",
  top: "calc(env(safe-area-inset-top, 0px) + 16px)",
  left: vars.spacing[16],
  width: "48px",
  height: "48px",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: vars.color.bg.default,
  border: "none",
  borderRadius: vars.radius.max,
  boxShadow: "0 4px 16px rgba(22, 24, 28, 0.16)",
  cursor: "pointer",
  color: vars.color.icon.default,
  flexShrink: 0,
  zIndex: 210,
});

export const backIcon = style({
  flexShrink: 0,
});

export const searchFieldSlot = style({
  flex: 1,
});

export const searchContainer = style({
  display: "none", // 헤더로 통합됨
});

export const mapWrapper = style({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: vars.color.palette.gray[100],
});

export const map = style({
  width: "100%",
  height: "100%",
});

export const centerPinContainer = style({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -100%)", // 핀의 끝이 중앙에 오도록
  zIndex: 5,
  pointerEvents: "none", // 지도 조작 방해 금지
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const centerPin = style({
  width: "40px",
  height: "48px",
  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
  transition: "transform 0.2s ease-out",
  selectors: {
    "&.bounce": {
      animation: `${bounceAnimation} 0.4s ease-out`,
    },
  },
});

export const myLocationButton = style({
  position: "absolute",
  right: vars.spacing[16],
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 200px)", // 하단 플로팅 패널 위로 조정
  width: "48px",
  height: "48px",
  borderRadius: "24px",
  backgroundColor: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: vars.shadow[2],
  zIndex: 5,
  cursor: "pointer",
  transition: "bottom 0.3s ease",
  selectors: {
    "&:disabled": {
      opacity: 0.45,
      cursor: "not-allowed",
    },
  },
});

export const bottomPanel = style({
  position: "absolute",
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
  left: vars.layout.sidePadding,
  right: vars.layout.sidePadding,
  padding: vars.spacing[20],
  backgroundColor: "white",
  borderRadius: vars.radius[16],
  boxShadow: vars.shadow[3], // 하단 패널은 조금 더 강조된 그림자
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[16],
});

export const addressInfo = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
});

export const addressLabel = style({
  fontSize: vars.typography.fontSize[12],
  color: vars.color.palette.gray[500],
  fontWeight: vars.typography.fontWeight.Medium,
});

export const addressText = style({
  fontSize: vars.typography.fontSize[18],
  color: vars.color.text.title,
  fontWeight: vars.typography.fontWeight.Bold,
  lineHeight: vars.typography.lineHeight.normal,
  minHeight: "27px",
});

export const confirmButton = style({
  width: "100%",
});

export const searchResultsOverlay = style({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "white",
  zIndex: 25,
  display: "flex",
  flexDirection: "column",
  paddingTop: "calc(64px + env(safe-area-inset-top, 0px))", // Floating Bar 높이(48px) + 상단 여백(8px + 8px) 고려
});

export const searchResultsContent = style({
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden", // 가로 스크롤 방지
  display: "flex",
  flexDirection: "column",
  width: "100%", // 너비 고정
});

export const searchResultHeader = style({
  padding: `${vars.spacing[16]} ${vars.layout.sidePadding}`,
  borderBottom: `1px solid ${vars.color.palette.gray[100]}`,
});

export const searchResultHeaderText = style({
  fontSize: vars.typography.fontSize[14],
  color: vars.color.text.content,
});

export const searchResultKeyword = style({
  color: vars.color.brand.primary,
  fontWeight: vars.typography.fontWeight.Bold,
});

export const emptyResult = style({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `0 ${vars.layout.sidePadding}`,
  textAlign: "center",
  color: vars.color.palette.gray[500],
  fontSize: vars.typography.fontSize[14],
});
