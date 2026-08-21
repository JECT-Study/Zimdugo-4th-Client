import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

/**
 * 스택 자체가 아이콘 열과 라벨 열을 소유하고, 세 버튼이 `subgrid`로 그 열을
 * 공유한다. 열 폭은 세 버튼 중 가장 넓은 내용을 기준으로 한 번만 정해지므로
 * 아이콘과 제목 시작선이 어떤 언어에서도 세 버튼에서 정확히 일치한다.
 * 로케일별로 폭을 지정할 필요가 없다.
 *
 * 열 구성: 스페이서 | 아이콘 | 라벨 | 스페이서.
 * 양끝 `1fr` 스페이서가 남는 공간을 반씩 가져가 묶음을 버튼 가운데에 놓는다.
 * 라벨 열은 `minmax(0, auto)`라서 좁은 화면에서는 줄어들고 말줄임으로 넘어간다.
 */
export const stack = style({
  display: "grid",
  gridTemplateColumns: "1fr auto minmax(0, auto) 1fr",
  columnGap: "10px",
  rowGap: vars.spacing[12],
  width: "100%",
});

const loginBase = style({
  display: "grid",
  gridTemplateColumns: "subgrid",
  gridColumn: "1 / -1",
  alignItems: "center",
  width: "100%",
  height: "48px",
  boxSizing: "border-box",
  padding: 0,
  borderRadius: vars.radius[8],
  border: "none",
  textDecoration: "none",
  cursor: "pointer",
  outline: "none",
  "@supports": {
    // subgrid 미지원 브라우저에서는 열 공유를 포기하고, 아이콘·라벨 묶음을
    // 내용 폭 그대로 버튼 가운데에 놓는다. `row`가 display:contents라
    // 아이콘과 라벨이 그대로 이 flex의 아이템이 된다.
    "not (grid-template-columns: subgrid)": {
      display: "flex",
      justifyContent: "center",
      gap: "10px",
    },
  },
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

// 아이콘과 라벨이 버튼의 subgrid 열에 직접 놓이도록 래퍼는 레이아웃에서 비운다.
export const row = style({
  display: "contents",
});

const iconBase = style({
  gridColumn: 2,
  width: "24px",
  height: "24px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

export const icon19 = iconBase;

export const icon24 = iconBase;

// 제목과 영문 sub는 왼쪽 끝을 맞춘다. 칸 폭은 둘 중 넓은 쪽을 따라가고,
// 그 묶음이 통째로 버튼 가운데에 놓인다.
export const labelContainer = style({
  gridColumn: 3,
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
