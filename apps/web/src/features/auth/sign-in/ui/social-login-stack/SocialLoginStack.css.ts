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

/**
 * 콘텐츠 묶음의 폭. 한 로케일 안에서는 세 버튼이 **같은 값**을 써야
 * 아이콘과 제목의 시작 위치가 정확히 맞는다. 버튼마다 내용에 맞춰
 * 폭을 정하면 제목 길이가 달라 아이콘이 어긋난다.
 *
 * 기본값은 기존 고정 폭 디자인과 같은 207px이고, 일본어처럼 제목이 더 긴
 * 로케일만 `SOCIAL_ROW_BASE_WIDTH_VAR`를 덮어써서 통째로 넓힌다.
 */
export const SOCIAL_ROW_BASE_WIDTH_VAR = "--social-row-base-width";

export const row = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "10px",
  // 넘치는 로케일에서도 버튼 좌우 16px 여백은 남긴다.
  width: `min(var(${SOCIAL_ROW_BASE_WIDTH_VAR}, 207px), calc(100% - 32px))`,
  boxSizing: "border-box",
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

// 라벨 칸은 행에서 아이콘을 뺀 나머지를 그대로 차지한다. 세 버튼이 같은 폭이므로
// 제목 시작 위치도 세 버튼에서 동일하게 맞는다.
export const labelContainer = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  flex: 1,
  minWidth: 0,
  lineHeight: 1.2,
});

const labelBase = style({
  lineHeight: 1.2,
  // 한 줄 유지가 원칙이되, 버튼 폭을 넘기면 넘치지 않고 말줄임으로 처리한다.
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

// 제목은 왼쪽 정렬 — 세 버튼의 제목 시작선이 맞아야 한다.
export const labelTitle = style([
  labelBase,
  {
    textAlign: "left",
    fontSize: vars.typography.fontSize[16],
    fontWeight: vars.typography.fontWeight.SemiBold,
  },
]);

// 영문 sub는 가운데 정렬 — 제목보다 짧고 길이도 제각각이라
// 왼쪽에 붙이면 일본어처럼 제목이 긴 로케일에서 한쪽으로 치우쳐 보인다.
export const labelEn = style([
  labelBase,
  {
    textAlign: "center",
    fontSize: "10px",
    fontWeight: vars.typography.fontWeight.Regular,
    opacity: 0.9,
  },
]);
