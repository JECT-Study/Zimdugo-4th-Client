import { styleVariants } from "@vanilla-extract/css";

export const providerRoot = styleVariants({
  google: {
    position: "relative",
    display: "inline-block",
    width: "18px",
    height: "18px",
    overflow: "hidden",
    borderRadius: "12px",
    background: "#1775f8",
  },
  naver: {
    position: "relative",
    display: "inline-block",
    width: "18px",
    height: "18px",
  },
  kakao: {
    position: "relative",
    display: "inline-block",
    width: "18px",
    height: "18px",
    overflow: "hidden",
    borderRadius: "12px",
    background: "#ffe400",
  },
});

export const providerImage = styleVariants({
  google: {
    position: "absolute",
    left: "3px",
    top: "3px",
    display: "block",
    width: "12px",
    height: "12px",
    pointerEvents: "none",
  },
  naver: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "18px",
    height: "18px",
    pointerEvents: "none",
  },
  kakao: {
    position: "absolute",
    left: "3.5px",
    top: "3.5px",
    display: "block",
    width: "11px",
    height: "12px",
    pointerEvents: "none",
  },
});
