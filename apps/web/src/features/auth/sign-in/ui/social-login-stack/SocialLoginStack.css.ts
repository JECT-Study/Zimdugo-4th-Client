import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const stack = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  width: "100%",
});

const loginBase = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "48px",
  boxSizing: "border-box",
  padding: 0,
  borderRadius: vars.radius[8],
  border: "none",
  textDecoration: "none",
  cursor: "pointer",
  outline: "none",
  gap: "10px",
  selectors: {
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
    "&[data-focus-visible]": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const naver = style([
  loginBase,
  {
    backgroundColor: "#04c65b",
    color: vars.color.palette.gray[100],
  },
]);

export const kakao = style([
  loginBase,
  {
    backgroundColor: "#ffe400",
    color: vars.color.palette.gray[800],
  },
]);

export const google = style([
  loginBase,
  {
    backgroundColor: "#1775f8",
    color: vars.color.palette.gray[100],
  },
]);

// 고정 폭 대신 버튼 안쪽 여백으로 콘텐츠 폭을 정하면
// 일본어·중국어처럼 제목이 긴 로케일에서도 아이콘·라벨 시작 위치가 세 버튼 모두 동일하게 유지된다.
export const row = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "10px",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: `0 ${vars.spacing[20]}`,
});

export const icon19 = style({
  width: "24px",
  height: "24px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const icon24 = style({
  width: "24px",
  height: "24px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const labelContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  flex: 1,
  minWidth: 0,
  lineHeight: 1.2,
});

const labelBase = style({
  textAlign: "left",
  lineHeight: 1.2,
  // 한 줄 유지가 원칙이되, 버튼 폭을 넘기면 넘치지 않고 말줄임으로 처리한다.
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const labelTitle = style([
  labelBase,
  {
    fontSize: vars.typography.fontSize[16],
    fontWeight: vars.typography.fontWeight.SemiBold,
  },
]);

export const labelEn = style([
  labelBase,
  {
    fontSize: "10px",
    fontWeight: vars.typography.fontWeight.Regular,
    opacity: 0.9,
  },
]);
