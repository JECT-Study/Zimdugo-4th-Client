import { style } from "@vanilla-extract/css";
import {
  appShellMaxWidth,
  appShellMaxWidthVar,
  layoutScale,
} from "../../tokens/layout/layout.css.ts";
import { vars } from "../../vars.css.ts";

export const frame = style({
  vars: {
    [appShellMaxWidthVar]: vars.layout.appMaxWidth,
  },
  position: "fixed",
  bottom: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: appShellMaxWidth,
  height: vars.layout.bottomNav,
  backgroundColor: vars.color.bg.default,
  borderTop: `1px solid ${vars.color.palette.gray[200]}`,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "space-evenly",
  zIndex: vars.zIndex.ui,
  boxSizing: "border-box",
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      vars: {
        [appShellMaxWidthVar]: vars.layout.tabletAppMaxWidth,
      },
    },
  },
});
