import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

export const page = style({
  width: "100%",
  minHeight: "100%",
  position: "relative",
  backgroundColor: vars.color.bg.default,
  overflow: "hidden",
});

export const logo = style({
  position: "absolute",
  top: "80px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "158px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
});

export const loginStack = style({
  position: "absolute",
  left: "50%",
  bottom: "max(60px, env(safe-area-inset-bottom))",
  transform: "translateX(-50%)",
  width: "min(313px, calc(100% - 40px))",
});

// SearchOverlay 헤더 뒤로가기와 동일한 규격(24px 아이콘, 상단 safe-area 보정)
export const backButton = style({
  position: "absolute",
  top: "calc(env(safe-area-inset-top, 0px) + 20px)",
  left: vars.spacing[16],
  zIndex: 1,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  outline: "none",
  selectors: {
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${vars.color.focus}`,
    },
  },
});

export const backIcon = style({
  width: "24px",
  height: "24px",
});
