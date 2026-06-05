import { style } from "@vanilla-extract/css";

export const pickerContainer = style({
  position: "relative",
  height: "140px",
  flex: 1,
  margin: 0,
  padding: 0,
  border: 0,
  backgroundColor: "transparent",
  overflow: "hidden",
});

export const pickerList = style({
  height: "100%",
  width: "100%",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  scrollSnapType: "y mandatory",
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
});

export const pickerItem = style({
  height: "46px",
  minHeight: "46px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  scrollSnapAlign: "center",
  transition: "all 0.2s ease",
  userSelect: "none",
});

export const pickerSelection = style({
  position: "absolute",
  top: "50%",
  left: "4px",
  right: "4px",
  height: "38px",
  marginTop: "-19px",
  backgroundColor: "rgba(0, 0, 0, 0.04)",
  borderRadius: "8px",
  pointerEvents: "none",
  zIndex: 1,
});

export const pickerGradientTop = style({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "50px",
  background: "linear-gradient(to bottom, #F8F9FA, rgba(248, 249, 250, 0))",
  zIndex: 2,
  pointerEvents: "none",
});

export const pickerGradientBottom = style({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "50px",
  background: "linear-gradient(to top, #F8F9FA, rgba(248, 249, 250, 0))",
  zIndex: 2,
  pointerEvents: "none",
});
