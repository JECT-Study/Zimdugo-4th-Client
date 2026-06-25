import { vars } from "@repo/ui/vars";
import { globalStyle, style } from "@vanilla-extract/css";

export const searchBarLayer = style({
  position: "absolute",
  top: "calc(env(safe-area-inset-top, 0px) + 8px)",
  left: vars.spacing[16],
  right: vars.spacing[16],
  zIndex: vars.zIndex.ui,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.spacing[8],
  maxWidth: `calc(${vars.layout.containerWidth} - 32px)`,
  margin: "0 auto",
});

export const searchInputFrame = style({
  position: "relative",
  width: "100%",
});

export const searchField = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minHeight: "48px",
});

export const searchFieldWithClose = style({
  position: "relative",
});

globalStyle(`${searchFieldWithClose} > div`, {
  paddingRight: "52px",
});

export const closeButton = style({
  position: "absolute",
  top: "50%",
  right: vars.spacing[12],
  transform: "translateY(-50%)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius[6],
  backgroundColor: "transparent",
  color: vars.color.text.surface,
  cursor: "pointer",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const fallbackButton = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing[12],
  width: "100%",
  minHeight: "48px",
  boxSizing: "border-box",
  padding: `10px ${vars.layout.sidePadding}`,
  border: `2px solid ${vars.color.border.hover}`,
  borderRadius: vars.radius.scale[6],
  backgroundColor: vars.color.bg.default,
  color: vars.color.text.disable,
  cursor: "pointer",
  outline: "none",
  ":focus-visible": {
    borderColor: vars.color.border.focus,
  },
});

export const fallbackIconSlot = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  flexShrink: 0,
});

export const fallbackLabel = style({
  overflow: "hidden",
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: 1.2,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const languageDropdown = style({
  position: "relative",
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "32px",
  zIndex: 1,
});

export const languageDropdownExpanded = style({
  width: "max-content",
});

export const languageTrigger = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "32px",
  height: "32px",
  minHeight: "32px",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.max,
  backgroundColor: "transparent",
  color: vars.color.text.title,
  cursor: "pointer",
  outline: "none",
  overflow: "hidden",
  selectors: {
    [`${languageDropdownExpanded} &`]: {
      width: "max-content",
      height: "36px",
      gap: "4px",
      padding: "2px 6px",
      border: `1px solid ${vars.color.brand.primary}`,
      backgroundColor: vars.color.bg.default,
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
  flexShrink: 0,
  opacity: 0,
  borderLeft: "5px solid transparent",
  borderRight: "5px solid transparent",
  borderTop: `6px solid ${vars.color.text.title}`,
  transform: "translateX(-4px)",
  selectors: {
    [`${languageDropdownExpanded} &`]: {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
});

export const languageOptions = style({
  position: "absolute",
  top: "46px",
  left: 0,
  display: "flex",
  flexDirection: "column",
  width: "max-content",
  minWidth: "100%",
  paddingTop: "6px",
  paddingBottom: "5px",
  borderRadius: vars.radius[6],
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[2],
  overflow: "hidden",
  transformOrigin: "top left",
  "::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "11px",
    width: 0,
    height: 0,
    borderLeft: "5px solid transparent",
    borderRight: "5px solid transparent",
    borderBottom: `6px solid ${vars.color.bg.default}`,
  },
});

export const languageOption = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing[8],
  width: "100%",
  minHeight: "33px",
  padding: "8px 8px 8px 36px",
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
  flexShrink: 0,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "17px",
  whiteSpace: "nowrap",
});

export const languageCheckIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  flexShrink: 0,
  color: vars.color.brand.primary,
});

globalStyle(`${languageCheckIcon} svg`, {
  width: "16px",
  height: "16px",
});
