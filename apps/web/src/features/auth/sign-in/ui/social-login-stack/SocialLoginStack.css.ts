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
 * 아이콘 + 라벨 묶음. 내용 폭에 맞춘 뒤 버튼 가운데에 놓는다.
 *
 * 어떤 언어가 와도 묶음이 알아서 필요한 만큼만 차지하므로 로케일별 폭 지정이
 * 없어도 버튼 밖으로 넘치지 않는다. 좁은 화면에서는 좌우 16px 여백까지만
 * 넓어지고, 그보다 좁으면 라벨이 말줄임으로 처리된다.
 */
export const row = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "10px",
  width: "fit-content",
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

// 제목과 영문 sub는 왼쪽 끝을 맞춘다. 칸 폭은 둘 중 넓은 쪽을 따라가고,
// 그 묶음이 통째로 버튼 가운데에 놓인다.
export const labelContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
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
