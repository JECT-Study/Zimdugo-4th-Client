import { recipe } from "@vanilla-extract/recipes";
import { color } from "../../../tokens/color/color.css.ts";
import { radius } from "../../../tokens/radius/radius.css.ts";
import { spacing } from "../../../tokens/spacing/spacing.css.ts";
import { typography } from "../../../tokens/typography/typography.css.ts";

export const chip = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius[16],
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",

    minWidth: "56px",
    padding: `${spacing[8]} ${spacing[12]}`,

    fontSize: typography.fontSize[12],
    fontWeight: typography.fontWeight.Medium,
    lineHeight: typography.lineHeight.normal,

    backgroundColor: color.palette.gray[200],
    color: color.palette.gray[800],
    border: "1px solid transparent",

    selectors: {
      // 비활성화 상태
      "&[data-disabled]": {
        cursor: "not-allowed",
        pointerEvents: "none",
        backgroundColor: color.bg.brand.disable,
        color: color.palette.gray[400],
        borderColor: "transparent",
      },
      // 유지 선택 상태
      "&[aria-pressed='true']": {
        backgroundColor: color.bg.brand.active,
        color: color.palette.gray[100],
        borderColor: "transparent",
      },
      // selected + disabled 우선 처리
      "&[aria-pressed='true'][data-disabled]": {
        backgroundColor: color.bg.brand.disable,
        color: color.palette.gray[400],
        borderColor: "transparent",
      },
      // Click effect
      "&:not([data-disabled]):not([aria-pressed='true'])[data-hovered], &:not([data-disabled]):not([aria-pressed='true'])[data-pressed]":
        {
          backgroundColor: color.palette.gray[100],
          color: color.palette.green[600],
          borderColor: color.palette.green[500],
        },
      // 키보드 접근성 포커스
      "&:not([data-disabled])[data-focus-visible]": {
        borderColor: color.focus,
      },
    },
  },
  variants: {
    variant: {
      default: {},
      input: {
        minWidth: "auto",
        gap: spacing[4],
        paddingRight: spacing[8],
      },
      icon: {
        minWidth: "auto",
        gap: spacing[4],
        paddingLeft: spacing[8],
      },
    },
    size: {
      small: { height: "28px" },
      medium: { height: "32px" },
    },
  },
  compoundVariants: [
    {
      variants: { variant: "input", size: "small" },
      style: {
        paddingLeft: spacing[8],
      },
    },
    {
      variants: { variant: "input", size: "medium" },
      style: {
        paddingLeft: spacing[12],
      },
    },
    {
      variants: { variant: "icon", size: "small" },
      style: {
        paddingRight: spacing[8],
      },
    },
    {
      variants: { variant: "icon", size: "medium" },
      style: {
        paddingRight: spacing[12],
      },
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "medium",
  },
});
