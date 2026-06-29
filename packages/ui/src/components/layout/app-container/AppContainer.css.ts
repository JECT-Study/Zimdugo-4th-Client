import { style } from "@vanilla-extract/css";
import {
  appShellMaxWidth,
  appShellMaxWidthVar,
  compactDeviceSelector,
  layoutScale,
} from "../../../tokens/layout/layout.css.ts";
import { vars } from "../../../vars.css.ts";

export const container = style({
  vars: {
    [appShellMaxWidthVar]: vars.layout.appMaxWidth,
  },
  width: "100%",
  maxWidth: appShellMaxWidth,
  margin: "0 auto",
  height: "100svh",
  minHeight: "100svh",
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[1],
  position: "relative",
  overflow: "hidden",
  selectors: {
    [compactDeviceSelector]: {
      vars: {
        [appShellMaxWidthVar]: "100%",
      },
    },
  },
  "@media": {
    [`screen and (min-width: ${layoutScale.tabletBreakpoint})`]: {
      vars: {
        [appShellMaxWidthVar]: vars.layout.tabletAppMaxWidth,
      },
    },
  },
});

export const documentContainer = style({
  height: "auto",
  minHeight: "100dvh",
  overflow: "visible",
});
