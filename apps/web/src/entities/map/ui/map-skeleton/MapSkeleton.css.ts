import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "@repo/ui/vars";

const shimmer = keyframes({
  "0%": { transform: "translateX(-100%)" },
  "100%": { transform: "translateX(100%)" },
});

const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

export const skeletonContainer = style({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: vars.color.bg.subtle,
  pointerEvents: "none",
});

export const mapArea = style({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  backgroundColor: vars.color.bg.subtle,
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent)",
      animation: `${shimmer} 1.6s ease-in-out infinite`,
    },
  },
});

export const loadingContent = style({
  position: "relative",
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing[12],
});

export const loadingSpinner = style({
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: `2px solid ${vars.color.border.default}`,
  borderTopColor: vars.color.brand.primary,
  animation: `${spin} 0.8s linear infinite`,
});

export const loadingLabel = style({
  margin: 0,
  color: vars.color.text.surface,
  fontSize: vars.typography.fontSize[14],
  lineHeight: vars.typography.lineHeight.normal,
  fontWeight: vars.typography.fontWeight.Medium,
});
