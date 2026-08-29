import { vars } from "@repo/ui/vars";
import { style, styleVariants } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.spacing[24],
  backgroundColor: "rgba(10, 13, 15, 0.38)",
  backdropFilter: "blur(2px)",
  zIndex: vars.zIndex.modal,
});

export const dialog = style({
  position: "relative",
  width: "100%",
  maxWidth: "328px",
  overflow: "hidden",
  borderRadius: "20px",
  backgroundColor: vars.color.bg.default,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
  outline: 0,
});

export const dialogMode = styleVariants({
  setup: { height: "468px" },
  running: { height: "524px" },
});

export const header = style({
  position: "absolute",
  top: "32px",
  left: vars.spacing[16],
  width: "264px",
});

export const title = style({
  margin: 0,
  color: "#1F2124",
  fontSize: "20px",
  fontWeight: vars.typography.fontWeight.Bold,
  lineHeight: "normal",
});

/*
 * 줄바꿈을 허용한다. 한 줄로 재면 영어 296px, 일본어 310px 이라 264px 을 넘기고,
 * 다이얼로그의 overflow: hidden 에 뒷부분이 잘려 나갔다.
 *
 * 헤더 아래 요소들이 전부 절대 위치라 이 문단이 길어져도 밀리지 않는다. 대신
 * 겹칠 수 있으므로 두 줄까지가 예산이다. 헤더 32px + 제목 약 24px + 여백 5px 에
 * 두 줄 29px 이면 약 90px 이고, 설정 화면에서 다음 요소가 96px 에서 시작한다.
 * 현재 다섯 언어는 최대 두 줄이며, 문구를 고칠 때 세 줄이 되지 않아야 한다.
 */
export const helper = style({
  margin: "5px 0 0",
  color: "#7A8085",
  fontSize: "10px",
  fontWeight: vars.typography.fontWeight.Regular,
  lineHeight: 1.45,
});

export const closeButton = style({
  position: "absolute",
  top: "20px",
  right: "20px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  color: vars.color.palette.gray[600],
  background: "transparent",
  cursor: "pointer",
  selectors: {
    "&[data-focus-visible]": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const preview = style({
  position: "absolute",
  top: "96px",
  left: vars.spacing[16],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.spacing[12],
  width: "288px",
  height: "36px",
  padding: "0 14px",
  boxSizing: "border-box",
  overflow: "hidden",
  borderRadius: vars.radius[12],
  color: "#14612B",
  backgroundColor: "#F5FAF5",
  fontSize: "17px",
  fontWeight: vars.typography.fontWeight.Medium,
  whiteSpace: "nowrap",
});

export const timePicker = style({
  position: "absolute",
  top: "163px",
  left: 0,
  width: "100%",
  margin: 0,
});

export const actionRow = style({
  position: "absolute",
  left: vars.spacing[16],
  display: "grid",
  gridTemplateColumns: "146px 146px",
  gap: "11px",
});

export const actionRowMode = styleVariants({
  setup: { bottom: "21px" },
  running: { bottom: "13px" },
});

export const actionButton = style({
  width: "100%",
  height: "50px",
  paddingInline: 0,
  borderRadius: "9px",
  fontSize: "15px",
  whiteSpace: "nowrap",
});

export const closeActionButton = style({
  borderWidth: "1.5px",
  borderColor: "#0DA345",
  color: "#0A8C38",
  fontSize: "14px",
});

export const startButton = style({
  backgroundColor: "#0D8533",
  transition:
    "background-color 150ms ease, box-shadow 150ms ease, transform 100ms ease",
  selectors: {
    "&[data-hovered]": {
      backgroundColor: "#0A8C38",
      borderColor: "transparent",
      boxShadow: "0 2px 6px rgba(13, 133, 51, 0.24)",
    },
    "&[data-pressed]": {
      backgroundColor: "#076B29",
      borderColor: "transparent",
      boxShadow: "none",
      transform: "translateY(1px)",
    },
    "&[data-focus-visible]": {
      backgroundColor: "#0D8533",
      borderColor: "transparent",
      boxShadow: `0 0 0 2px ${vars.color.bg.default}, 0 0 0 4px ${vars.color.focus}`,
    },
    "&[data-disabled]": {
      color: vars.color.text.white,
      backgroundColor: vars.color.palette.gray[500],
      boxShadow: "none",
      transform: "none",
    },
  },
});

export const progressRing = style({
  position: "absolute",
  top: "110px",
  left: "5px",
  width: "315px",
  height: "266px",
});

export const progressGauge = style({
  display: "block",
  width: "315px",
  height: "266px",
});

export const lockerIcon = style({
  position: "absolute",
  top: "67px",
  left: "134px",
});

export const remainingTime = style({
  position: "absolute",
  top: "265px",
  left: 0,
  width: "100%",
  color: vars.color.text.content,
  fontSize: "48px",
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.2,
  textAlign: "center",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
});

export const endTime = style({
  position: "absolute",
  top: "345px",
  left: "73px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.spacing[12],
  height: "47px",
  padding: "0 14px",
  boxSizing: "border-box",
  color: "#14612B",
  fontSize: "17px",
  fontWeight: vars.typography.fontWeight.Bold,
  whiteSpace: "nowrap",
});
