import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../vars.css.ts";

const POPUP_CONTENT_WIDTH = "204px";
const POPUP_WIDE_CONTENT_WIDTH = "288px";

export const overlay = style({
  position: "fixed",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(2px)",
  zIndex: vars.zIndex.modal,
});

const dialogBase = style({
  display: "flex",
  minHeight: "164px",
  height: "auto",
  padding: "16px 18px",
  flexDirection: "column",
  justifyContent: "flex-end",
  alignItems: "center",
  backgroundColor: vars.color.bg.default,
  borderRadius: vars.radius[10],
  boxSizing: "border-box",
  outline: "none",
  textAlign: "center",
});

export const dialog = styleVariants({
  default: [dialogBase, { width: "240px", minWidth: "240px" }],
  wide: [dialogBase, { width: "324px", minWidth: "324px" }],
});

const containerBase = style({
  minHeight: "132px",
  height: "auto",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const container = styleVariants({
  default: [containerBase, { width: POPUP_CONTENT_WIDTH, gap: "18px" }],
  withMiddle: [containerBase, { width: POPUP_CONTENT_WIDTH, gap: "14px" }],
  wideDefault: [
    containerBase,
    { width: POPUP_WIDE_CONTENT_WIDTH, gap: "18px" },
  ],
  wideWithMiddle: [
    containerBase,
    { width: POPUP_WIDE_CONTENT_WIDTH, gap: "14px" },
  ],
});

const bottomSectionBase = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const bottomSection = styleVariants({
  default: [bottomSectionBase, { width: POPUP_CONTENT_WIDTH }],
  withMiddle: [
    bottomSectionBase,
    {
      width: POPUP_CONTENT_WIDTH,
      minHeight: "54px",
      height: "auto",
      justifyContent: "flex-end",
      gap: "8px",
    },
  ],
  wideDefault: [bottomSectionBase, { width: POPUP_WIDE_CONTENT_WIDTH }],
  wideWithMiddle: [
    bottomSectionBase,
    {
      width: POPUP_WIDE_CONTENT_WIDTH,
      minHeight: "54px",
      height: "auto",
      justifyContent: "flex-end",
      gap: "8px",
    },
  ],
});

export const helperArea = style({
  width: "100%",
  minHeight: "14px",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "center",
  gap: "2px",
});

export const iconWrapper = style({
  width: "32px",
  height: "32px",
  borderRadius: vars.radius.max,
  backgroundColor: vars.color.palette.green[100],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.palette.green[500],
  flexShrink: 0,
});

export const title = style({
  fontSize: vars.typography.fontSize[18],
  fontWeight: 600,
  lineHeight: "120%",
  color: vars.color.text.title,
  textAlign: "center",
  width: "100%",
  wordBreak: "keep-all",
  overflowWrap: "break-word",
  textWrap: "balance",
});

export const helper = style({
  fontSize: "10px",
  fontWeight: 500,
  color: vars.color.text.surface,
  lineHeight: "120%",
  textAlign: "center",
  width: "100%",
  margin: 0,
  wordBreak: "keep-all",
  whiteSpace: "pre-line",
});

export const subActionText = style({
  display: "flex",
  width: "100%",
  height: "14px",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "12px",
  fontWeight: 500,
  color: vars.color.text.disable,
  textDecoration: "underline",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  ":hover": {
    color: vars.color.text.content,
  },
});

export const actionsContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  height: "32px",
  justifyContent: "center",
});

export const buttonRow = style({
  display: "flex",
  gap: vars.spacing[12],
  width: "100%",
  justifyContent: "center",
});

const popupButtonBase = style({
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  minWidth: 0,
});

export const primaryButtonItem = style([
  popupButtonBase,
  {
    flex: 1,
    selectors: {
      "&[data-size='L']": {
        flex: "none",
        width: "100%",
      },
    },
  },
]);

export const secondaryButtonItem = style([popupButtonBase, { flex: 1 }]);
