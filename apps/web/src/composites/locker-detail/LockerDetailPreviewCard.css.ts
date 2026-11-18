import {
  appShellMaxWidth,
  appShellMaxWidthVar,
  compactDeviceSelector,
  layoutScale,
} from "@repo/ui/tokens/layout/layout.css";
import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

/**
 * 지도가 뜨기 전 상세 미리보기 카드.
 *
 * 하단 시트의 접힌 모양과 같은 자리(하단, 앱 셸 폭)에 둔다. 지도가 준비되면 같은
 * 자리에 실제 시트가 올라와 갈아 끼워진다.
 */
export const previewCard = style({
  vars: {
    [appShellMaxWidthVar]: vars.layout.appMaxWidth,
  },
  position: "fixed",
  left: "50%",
  bottom: 0,
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: appShellMaxWidth,
  maxHeight: "60dvh",
  overflowY: "auto",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing[12],
  margin: 0,
  padding: `${vars.spacing[24]} ${vars.spacing[16]} calc(${vars.spacing[24]} + env(safe-area-inset-bottom))`,
  borderRadius: `${vars.radius[16]} ${vars.radius[16]} 0 0`,
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[1],
  zIndex: vars.zIndex.bottomSheet,
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

export const previewTitle = style({
  margin: 0,
  color: vars.color.text.title,
  fontSize: vars.typography.fontSize[16],
  fontWeight: vars.typography.fontWeight.SemiBold,
  lineHeight: 1.3,
  wordBreak: "keep-all",
});

export const previewAddress = style({
  margin: 0,
  color: vars.color.text.content,
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.4,
});

export const previewFacts = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  columnGap: vars.spacing[12],
  rowGap: vars.spacing[8],
  margin: 0,
  fontSize: vars.typography.fontSize[14],
  lineHeight: 1.4,
});

export const previewFactLabel = style({
  color: vars.color.text.disable,
});

export const previewFactValue = style({
  margin: 0,
  color: vars.color.text.title,
});

export const previewUpdated = style({
  margin: 0,
  color: vars.color.text.disable,
  fontSize: vars.typography.fontSize[12],
});
