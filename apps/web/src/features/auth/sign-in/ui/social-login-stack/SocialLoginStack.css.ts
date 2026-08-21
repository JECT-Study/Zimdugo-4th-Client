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
 * 콘텐츠 묶음은 항상 버튼 가운데에 놓는다.
 *
 * 폭은 내용에 맞추되 최소 `ROW_BASE_WIDTH`를 유지한다. 한국어·영어·중국어처럼
 * 제목이 이 안에 들어오는 로케일은 모두 같은 폭이 되어 세 버튼의 아이콘·라벨
 * 시작 위치가 정확히 맞고, 기존 고정 폭 디자인과 동일한 위치에 놓인다.
 * 일본어처럼 넘치는 로케일에서만 필요한 만큼 넓어져 버튼 밖으로 밀려나지 않는다.
 */
const ROW_BASE_WIDTH = "207px";

export const row = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "10px",
  width: "fit-content",
  minWidth: `min(${ROW_BASE_WIDTH}, 100%)`,
  // 넘치는 로케일에서도 버튼 좌우 16px 여백은 남긴다.
  maxWidth: "calc(100% - 32px)",
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

// 제목과 영문 sub는 서로 길이가 달라서, 긴 쪽 기준으로 가운데를 맞춰야
// 일본어처럼 제목이 훨씬 긴 로케일에서 sub가 한쪽으로 치우쳐 보이지 않는다.
export const labelContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
  lineHeight: 1.2,
});

const labelBase = style({
  textAlign: "center",
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
