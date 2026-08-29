import { vars } from "@repo/ui/vars";
import { globalStyle, style, styleVariants } from "@vanilla-extract/css";

export const frame = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  boxSizing: "border-box",
  borderRadius: vars.radius[6],
  backgroundColor: vars.color.bg.surface,
  color: vars.color.text.surface,
});

/**
 * 상태별 생김새.
 *
 * 지금 화면을 그대로 옮긴 값이다. "사진이 아직 없다" 는 점선으로 자리를 비워 두는
 * 느낌, "못 불러왔다" 는 실선으로 자리가 채워진 느낌을 준다. 둘을 같은 모양으로
 * 맞출지는 디자인 판단이라 여기서 정하지 않는다.
 */
export const frameStateVariants = styleVariants({
  empty: {
    gap: vars.spacing[12],
    padding: vars.spacing[24],
    border: `1px dashed ${vars.color.border.hover}`,
  },
  failed: {
    gap: vars.spacing[8],
    padding: vars.spacing[12],
    border: `1px solid ${vars.color.border.default}`,
  },
});

/** 크기 변형이 상태 변형보다 뒤에 와야 compact 의 gap·padding 이 이긴다. */
export const frameSizeVariants = styleVariants({
  compact: {
    width: "76px",
    minWidth: "76px",
    height: "76px",
    gap: vars.spacing[4],
    padding: vars.spacing[8],
  },
  half: {
    height: "130px",
  },
  full: {
    height: "200px",
    flexShrink: 0,
  },
  /** 자리 크기를 부모가 정할 때. 상세 이미지 스트립의 4:3 칸이 그렇다. */
  fill: {
    height: "100%",
  },
});

/**
 * 카메라 아이콘은 path 에 stroke 로 그려져 있어 색을 여기서 맞춰 준다.
 *
 * failed 상태의 아이콘은 fill 로 그려져 있다. 거기에 stroke 를 주면 윤곽이 덧그려져
 * 도안이 두꺼워지므로 empty 에만 건다.
 */
globalStyle(`${frameStateVariants.empty} svg path`, {
  stroke: vars.color.text.surface,
});

export const textColumn = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "18px",
  textAlign: "center",
  selectors: {
    [`${frameSizeVariants.compact} &`]: {
      maxWidth: "64px",
      overflow: "hidden",
      fontSize: "10px",
      lineHeight: 1.2,
    },
  },
});

export const textLine = style({});

globalStyle(`${frameSizeVariants.compact} ${textLine}`, {
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});
