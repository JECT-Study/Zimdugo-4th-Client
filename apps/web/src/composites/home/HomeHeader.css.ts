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
  zIndex: vars.zIndex.ui,
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

/** 펼친 드롭다운은 트리거와 선택지 목록이 같은 너비를 쓴다. */
export const LANGUAGE_MENU_WIDTH = 164;

const languageMenuWidth = `${LANGUAGE_MENU_WIDTH}px`;

export const languageDropdown = style({
  position: "relative",
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-end",
  width: "32px",
  zIndex: 2,
});

export const languageDropdownExpanded = style({
  width: languageMenuWidth,
});

export const languageTrigger = style({
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
      width: "100%",
      height: "36px",
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
  width: 0,
  height: 0,
  // 펼친 트리거는 선택지 목록 너비까지 늘어나므로 화살표를 오른쪽 끝에 붙인다.
  marginLeft: "auto",
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
  width: "100%",
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
  color: vars.color.text.disable,
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
