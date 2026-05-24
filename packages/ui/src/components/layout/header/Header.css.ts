import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../../vars.css.ts";

export const headerRoot = style({
  position: "fixed",
  top: "env(safe-area-inset-top, 0px)",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: vars.zIndex.ui,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: vars.layout.containerWidth,
  height: vars.layout.header,
  padding: `${vars.spacing[12]} ${vars.spacing[16]}`,
  backgroundColor: "transparent", // 지도가 보이도록 투명 설정 (필요시 수정)
  boxSizing: "border-box",
});

export const ghostBox = style({
  width: "24px",
  height: "24px",
  flexShrink: 0,
});

export const centerContainer = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  variants: {
    alignment: {
      center: {
        justifyContent: "center",
      },
      left: {
        justifyContent: "flex-start",
      },
    },
  },
  defaultVariants: {
    alignment: "center",
  },
});

export const logoBrand = style({
  fontFamily: "'Metropolis:Bold', sans-serif",
  fontWeight: 700,
  fontSize: "16px",
  color: vars.color.palette.gray[800],
});

export const logoHighlight = style({
  fontFamily: "'Metropolis:Bold', sans-serif",
  fontWeight: 700,
  fontSize: "16px",
  color: vars.color.palette.green[500],
});

export const titleText = style({
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  color: vars.color.palette.gray[800],
});

export const stepIndicator = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: vars.typography.fontSize[12],
    fontWeight: vars.typography.fontWeight.Medium,
    lineHeight: vars.typography.lineHeight.normal,
  },
  variants: {
    state: {
      default: {
        backgroundColor: vars.color.palette.gray[200],
        color: vars.color.palette.gray[800],
      },
      active: {
        backgroundColor: vars.color.bg.brand.default,
        color: vars.color.text.white,
      },
    },
  },
  defaultVariants: {
    state: "default",
  },
});

export const iconButton = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  background: "none",
  border: "none",
  cursor: "pointer",
  // padding: 0,
  paddingLeft: "5px",
  paddingRight: "6px",
  color: vars.color.palette.gray[800],
  outline: "none",
});
