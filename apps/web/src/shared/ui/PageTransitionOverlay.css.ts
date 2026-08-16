import { appShellMaxWidth } from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { keyframes, style } from "@vanilla-extract/css";

const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

export const overlay = style({
  position: "fixed",
  insetBlock: 0,
  left: "50%",
  zIndex: 400,
  width: "100%",
  maxWidth: appShellMaxWidth,
  height: "100dvh",
  paddingBlock:
    "env(safe-area-inset-top, 0px) env(safe-area-inset-bottom, 0px)",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transform: "translateX(-50%)",
  pointerEvents: "auto",
  touchAction: "none",
  animation: `${fadeIn} 120ms ease-out`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

export const backdrop = style({
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(22, 24, 28, 0.08)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
});

export const spinner = style({
  position: "relative",
  width: 34,
  height: 34,
  borderRadius: vars.radius.max,
  border: `3px solid ${vars.color.border.default}`,
  borderTopColor: vars.color.text.content,
  backgroundColor: "rgba(255, 255, 255, 0.78)",
  animation: `${spin} 800ms linear infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});
