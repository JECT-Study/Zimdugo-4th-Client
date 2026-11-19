import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const snackbar = recipe({
  base: {
    position: "relative",
    // 자리만큼 늘어나되 디자인 폭(341px)보다 넓어지지 않는다.
    width: "100%",
    maxWidth: "341px",
    minHeight: "54px",
    padding: `0 14px 0 ${vars.spacing[16]}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: vars.spacing[16],
    borderRadius: vars.radius[10],
    boxSizing: "border-box",
    overflow: "hidden",
    pointerEvents: "auto",
  },
  variants: {
    variant: {
      light: {
        border: `1px solid ${vars.color.palette.gray[200]}`,
        backgroundColor: vars.color.bg.default,
        color: vars.color.text.title,
        boxShadow: vars.shadow[2],
      },
      dark: {
        border: 0,
        backgroundColor: "rgba(51, 56, 61, 0.85)",
        color: vars.color.text.white,
      },
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

export const message = style({
  minWidth: 0,
  flex: 1,
  fontSize: vars.typography.fontSize[12],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: vars.typography.lineHeight.tight,
  // 한국어가 어절 중간("찾으시 / 나요")에서 끊기지 않게 한다. 한 어절이 줄보다
  // 길 때만 overflowWrap 이 그 안에서 자른다.
  wordBreak: "keep-all",
  overflowWrap: "anywhere",
  whiteSpace: "pre-line",
});

export const action = recipe({
  base: {
    flexShrink: 0,
    border: 0,
    background: "transparent",
    padding: `${vars.spacing[8]} 0`,
    fontSize: vars.typography.fontSize[12],
    fontWeight: vars.typography.fontWeight.SemiBold,
    lineHeight: vars.typography.lineHeight.tight,
    cursor: "pointer",
    whiteSpace: "nowrap",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    selectors: {
      "&[data-hovered]": {
        textDecoration: "underline",
      },
      "&[data-pressed]": {
        opacity: 0.8,
      },
      "&[data-focus-visible]": {
        outline: `2px solid ${vars.color.focus}`,
        outlineOffset: "2px",
      },
    },
  },
  variants: {
    variant: {
      light: {
        color: vars.color.text.brand,
      },
      dark: {
        color: "#54B2FF",
      },
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

export const closeButton = recipe({
  base: {
    padding: 0,
    border: 0,
    borderRadius: vars.radius.max,
    background: "transparent",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "18px",
    height: "18px",
    flexShrink: 0,
    selectors: {
      /*
       * 보이는 크기는 디자인대로 두고 누를 수 있는 영역만 44px 로 넓힌다.
       * 스낵바 높이(54px)와 오른쪽 패딩(14px), 액션과의 간격(16px) 안에 들어가
       * 카드 밖으로 넘치거나 액션 버튼을 덮지 않는다.
       */
      "&::before": {
        content: '""',
        position: "absolute",
        inset: "-13px",
      },
      "&[data-focus-visible]": {
        outline: `2px solid ${vars.color.focus}`,
        outlineOffset: "2px",
      },
    },
  },
  variants: {
    variant: {
      light: {
        selectors: {
          "&[data-hovered]": {
            backgroundColor: vars.color.bg.surface,
          },
          "&[data-pressed]": {
            backgroundColor: vars.color.bg.active,
          },
        },
      },
      dark: {
        selectors: {
          "&[data-pressed]": {
            opacity: 0.8,
          },
        },
      },
    },
  },
  defaultVariants: {
    variant: "light",
  },
});
