import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

export const overlay = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(2px)",
  zIndex: vars.zIndex.modal,
});

export const dialog = style({
  display: "flex",
  width: "240px",
  height: "164px",
  padding: "16px 18px", // 좌우 패딩 18px로 조정
  flexDirection: "column",
  justifyContent: "flex-end",
  alignItems: "center",
  backgroundColor: vars.color.bg.default,
  borderRadius: vars.radius[10],
  boxSizing: "border-box",
  outline: "none",
  textAlign: "center",
});

const containerBase = style({
  width: "204px", // 240 - 18*2 = 204px 확보
  height: "132px",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const container = styleVariants({
  default: [containerBase, { gap: "18px" }], // 심플 모드: 18px 통일
  withMiddle: [containerBase, { gap: "14px" }], // 헬퍼 모드: 기존 14px
});

const bottomSectionBase = style({
  width: "204px", // 상위 컨테이너와 동일하게 204px로 확장
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const bottomSection = styleVariants({
  default: [bottomSectionBase], // 심플 모드: 버튼 크기만큼만 차지
  withMiddle: [
    bottomSectionBase,
    {
      height: "54px",
      justifyContent: "flex-end",
      gap: "8px",
    },
  ],
});

export const helperArea = style({
  width: "100%",
  height: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const iconWrapper = style({
  width: "32px",
  height: "32px",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.palette.green[100],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.palette.green[500],
  flexShrink: 0,
});

export const title = style({
  fontFamily: "Pretendard",
  fontSize: vars.typography.fontSize[18],
  fontWeight: 600,
  lineHeight: "120%",
  color: vars.color.text.title,
  textAlign: "center",
  width: "100%",
  wordBreak: "keep-all",
});

export const helper = style({
  fontFamily: "Pretendard",
  fontSize: "10px",
  fontWeight: 500,
  color: vars.color.text.surface,
  lineHeight: "120%",
  textAlign: "center",
  width: "100%",
});

export const subActionText = style({
  display: "flex",
  width: "100%",
  height: "14px",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Pretendard",
  fontSize: "12px",
  fontWeight: 500,
  color: vars.color.text.disable,
  textDecoration: "underline",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  ":hover": {
    color: vars.color.text.content,
  },
});

export const actionsContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  height: "32px",
  justifyContent: "center",
});

export const buttonRow = style({
  display: "flex",
  gap: vars.spacing[12], // 기존 토큰 활용
  width: "100%",
  justifyContent: "center",
});

const popupButtonBase = style({
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  flex: "none",
});

export const primaryButtonItem = style([
  popupButtonBase,
  {
    selectors: {
      "&[data-size='S']": { width: "79px" },
      "&[data-size='L']": { width: "204px" },
      "&:not([data-size])": { width: "79px" },
    },
  },
]);

export const secondaryButtonItem = style([popupButtonBase, { width: "79px" }]);
