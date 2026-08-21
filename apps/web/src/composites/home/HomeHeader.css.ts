import {
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const header = style({
  position: "absolute",
  top: "env(safe-area-inset-top, 0px)",
  left: 0,
  right: 0,
  // 검색 바와 같은 ui 레이어에 두면 나중에 그려지는 검색 바가 위로 올라와
  // 펼친 언어 목록(52px~)이 검색 바(60px~)에 가린다. 한 단계 위로 올린다.
  zIndex: `calc(${vars.zIndex.ui} + 1)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: vars.layout.appMaxWidth,
  height: "48px",
  margin: "0 auto",
  padding: `0 ${vars.spacing[16]} 0 30px`,
  boxSizing: "border-box",
  backgroundColor: vars.color.bg.default,
  selectors: {
    [compactDeviceSelector]: {
      maxWidth: "none",
    },
  },
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
    },
  },
});

export const logo = style({
  width: "78px",
  height: "16px",
  flexShrink: 0,
});

export const actions = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.spacing[12],
  minWidth: 0,
});

/** 펼친 트리거와 선택지 목록이 같은 너비를 쓴다. */
const languageMenuWidth = "164px";

export const languageDropdown = style({
  position: "relative",
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-end",
  width: "32px",
  zIndex: 2,
});

export const languageDropdownExpanded = style({
  width: "max-content",
});

export const languageTrigger = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "32px",
  height: "32px",
  minHeight: "32px",
  padding: "4px",
  border: 0,
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.title,
  boxShadow: vars.shadow[1],
  cursor: "pointer",
  outline: "none",
  overflow: "hidden",
  selectors: {
    [`${languageDropdownExpanded} &`]: {
      width: languageMenuWidth,
      height: "36px",
      // 넓어진 폭 안에서 국기와 라벨만 가운데로 모은다. 화살표는 오른쪽 끝 고정.
      justifyContent: "center",
      gap: "4px",
      padding: "2px 6px",
      border: `1px solid ${vars.color.brand.primary}`,
    },
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const languageTriggerLabel = style({
  flexShrink: 0,
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "17px",
  opacity: 0,
  whiteSpace: "nowrap",
  transform: "translateX(-4px)",
});

export const languageChevron = style({
  // 국기·라벨의 가운데 정렬에 끼어들지 않도록 흐름에서 빼 오른쪽 끝에 둔다.
  position: "absolute",
  right: "6px",
  top: "50%",
  width: 0,
  height: 0,
  marginTop: "-3px",
  flexShrink: 0,
  opacity: 0,
  borderLeft: "5px solid transparent",
  borderRight: "5px solid transparent",
  borderTop: `6px solid ${vars.color.text.title}`,
  transform: "translateX(-4px)",
});

export const languageOptions = style({
  position: "absolute",
  top: "46px",
  right: 0,
  display: "flex",
  flexDirection: "column",
  width: languageMenuWidth,
  paddingTop: "6px",
  paddingBottom: "5px",
  borderRadius: vars.radius[6],
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[2],
  overflow: "hidden",
  transformOrigin: "top right",
});

export const languageOption = style({
  display: "grid",
  gridTemplateColumns: "24px 1fr 16px",
  alignItems: "center",
  gap: vars.spacing[8],
  width: "100%",
  minHeight: "41px",
  padding: `8px ${vars.spacing[8]}`,
  border: 0,
  borderBottom: `1px solid ${vars.color.border.default}`,
  backgroundColor: vars.color.bg.default,
  // text.disable(#CACACA)은 흰 배경 대비 1.6:1 로 12px 본문 기준 WCAG 를 통과하지
  // 못한다. 선택 여부는 배경 톤과 체크 아이콘이 이미 구분해 준다.
  color: vars.color.text.content,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:last-child": {
      borderBottom: 0,
    },
    "&:hover": {
      backgroundColor: vars.color.bg.surface,
    },
    "&:focus-visible": {
      boxShadow: `inset 0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const languageOptionSelected = style({
  backgroundColor: vars.color.bg.surface,
  color: vars.color.text.title,
});

export const languageOptionText = style({
  minWidth: 0,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "17px",
  textAlign: "left",
  whiteSpace: "nowrap",
});

export const languageCheckIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  color: vars.color.brand.primary,
});

globalStyle(`${languageCheckIcon} svg`, {
  width: "16px",
  height: "16px",
});

export const profileButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  backgroundColor: "transparent",
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});
