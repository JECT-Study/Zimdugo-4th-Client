import {
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const page = style({
  height: "100dvh",
  paddingTop: `calc(env(safe-area-inset-top, 0px) + ${vars.layout.header})`,
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
  background: vars.color.bg.default,
  boxSizing: "border-box",
});

export const pageHeader = style({
  background: vars.color.bg.default,
  borderBottom: `1px solid ${vars.color.palette.gray[200]}`,
});

export const pageMain = style({
  width: "100%",
  height: `calc(100dvh - env(safe-area-inset-top, 0px) - ${vars.layout.header} - env(safe-area-inset-bottom, 0px))`,
  maxWidth: vars.layout.appMaxWidth,
  margin: "0 auto",
  overflowY: "auto",
  overscrollBehaviorY: "contain",
  scrollbarGutter: "stable both-edges",
  selectors: {
    [compactDeviceSelector]: {
      maxWidth: "none",
    },
  },
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      maxWidth: vars.layout.tabletAppMaxWidth,
      selectors: {
        [compactDeviceSelector]: {
          maxWidth: "none",
        },
      },
    },
  },
});

export const content = style({
  display: "flex",
  flexDirection: "column",
  gap: "40px",
  padding: `32px ${vars.spacing[16]} 300px`,
  boxSizing: "border-box",
  wordBreak: "keep-all",
  overflowWrap: "break-word",
});

export const intro = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[4],
  padding: `0 ${vars.spacing[4]}`,
});

export const introTitle = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[18],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "20px",
});

export const introDescription = style({
  margin: 0,
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "21px",
});

export const stepList = style({
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: "12px 0",
  listStyle: "none",
  borderRadius: vars.radius.scale[8],
  background: vars.color.palette.gray[100],
  wordBreak: "keep-all",
  overflowWrap: "break-word",
});

export const stepItem = style({
  display: "flex",
  alignItems: "center",
  gap: "14px",
  minHeight: "96px",
  padding: `0 ${vars.spacing[4]}`,
  boxSizing: "border-box",
  selectors: {
    "& + &": {
      borderTop: `1px solid ${vars.color.palette.gray[200]}`,
    },
  },
});

export const stepIcon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  flexShrink: 0,
  borderRadius: vars.radius.max,
  overflow: "visible",
});

export const stepCopy = style({
  display: "flex",
  minWidth: 0,
  flex: 1,
  flexDirection: "column",
  gap: "5px",
});

export const stepTitle = style({
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "22px",
});

export const stepDescription = style({
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "19px",
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
});

export const sectionTitle = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[18],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: "22px",
});

export const checklist = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  margin: 0,
  padding: vars.spacing[16],
  listStyle: "none",
  border: `1px solid ${vars.color.palette.gray[300]}`,
  borderRadius: vars.radius.scale[8],
  background: vars.color.bg.default,
  wordBreak: "keep-all",
  overflowWrap: "break-word",
});

export const checklistItem = style({
  display: "flex",
  gap: vars.spacing[12],
  color: vars.color.palette.gray[800],
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.normal,
});

export const checklistMark = style({
  color: vars.color.palette.green[500],
  flexShrink: 0,
});

export const faqList = style({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  wordBreak: "keep-all",
  overflowWrap: "break-word",
});

export const faqItem = style({
  overflow: "hidden",
  border: `1px solid ${vars.color.palette.gray[300]}`,
  borderRadius: vars.radius.scale[8],
  background: vars.color.bg.default,
  selectors: {
    "&[data-focus-visible-within]": {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const faqHeading = style({
  margin: 0,
});

export const faqTrigger = style({
  display: "flex",
  width: "100%",
  minHeight: "56px",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing[12],
  padding: `0 ${vars.spacing[16]}`,
  border: 0,
  background: "transparent",
  color: vars.color.palette.gray[800],
  textAlign: "left",
  cursor: "pointer",
  boxSizing: "border-box",
});

export const faqQuestion = style({
  minWidth: 0,
  flex: 1,
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.normal,
});

export const faqPlusIcon = style({
  width: "20px",
  height: "20px",
  flexShrink: 0,
  transition: "transform 160ms ease",
  selectors: {
    [`${faqItem}[data-expanded] &`]: {
      transform: "rotate(45deg)",
    },
  },
});

export const faqAnswer = style({
  display: "grid",
  gridTemplateRows: "1fr",
  opacity: 1,
  overflow: "hidden",
  contentVisibility: "visible",
  transition:
    "grid-template-rows 240ms cubic-bezier(0.22, 1, 0.36, 1) 40ms, opacity 160ms ease 40ms",
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.normal,
  selectors: {
    "&[hidden]": {
      display: "grid",
      gridTemplateRows: "0fr",
      opacity: 0,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
});

export const faqAnswerInner = style({
  padding: `0 ${vars.spacing[16]} ${vars.spacing[16]} 32px`,
});

export const faqAnswerClip = style({
  minHeight: 0,
  overflow: "hidden",
});

export const notice = style({
  display: "flex",
  minHeight: "54px",
  alignItems: "center",
  gap: "10px",
  padding: `${vars.spacing[8]} ${vars.spacing[12]}`,
  border: `1px solid ${vars.color.palette.gray[300]}`,
  borderRadius: vars.radius.scale[8],
  background: vars.color.bg.default,
  boxSizing: "border-box",
  wordBreak: "keep-all",
  overflowWrap: "break-word",
});

export const noticeText = style({
  margin: 0,
  color: vars.color.palette.gray[600],
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "19px",
});
