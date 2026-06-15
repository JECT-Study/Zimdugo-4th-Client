import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const root = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.scale[12],
  width: "fit-content",
});

export const optionsDirection = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing.scale[8],
  },
  variants: {
    direction: {
      column: {},
      row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
      },
    },
    compact: {
      true: {
        gap: vars.spacing.scale[16],
      },
      false: {},
    },
  },
  defaultVariants: {
    direction: "column",
    compact: false,
  },
});

export const optionRow = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: vars.spacing.scale[8],
    cursor: "pointer",
    outline: "none",
  },
  variants: {
    labelLayout: {
      right: {
        flexDirection: "row",
      },
      bottom: {
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      },
      none: {
        flexDirection: "row",
      },
    },
    disabled: {
      true: { cursor: "not-allowed" },
      false: {},
    },
  },
  defaultVariants: {
    labelLayout: "right",
    disabled: false,
  },
});

export const indicator = recipe({
  base: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    borderWidth: "1px",
    borderStyle: "solid",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.1s ease-in-out",
    position: "relative",
    backgroundColor: vars.color.bg.default,
    borderColor: vars.color.border.default, // 기본 테두리 색상 유지
  },
  variants: {
    isSelected: {
      true: {
        backgroundColor: vars.color.palette.green[500],
        borderColor: vars.color.palette.green[500],
      },
      false: {},
    },
    isHovered: {
      true: {
        backgroundColor: vars.color.bg.surface,
        borderColor: vars.color.border.hover,
      },
      false: {},
    },
    isPressed: {
      true: {
        backgroundColor: vars.color.bg.subtle,
        borderColor: vars.color.border.hover,
      },
      false: {},
    },
    isFocusVisible: {
      true: {
        boxShadow: `0 0 0 3px #3BD569`,
      },
      false: {},
    },
    isDisabled: {
      true: {
        backgroundColor: vars.color.bg.surface,
        borderColor: vars.color.palette.gray[400],
      },
      false: {},
    },
  },
  compoundVariants: [
    // Selected + Hover (Overlay)
    {
      variants: { isSelected: true, isHovered: true },
      style: {
        backgroundColor: vars.color.palette.green[500],
        borderColor: vars.color.palette.green[500],
        "::after": {
          content: '""',
          position: "absolute",
          width: "16px",
          height: "16px",
          top: "-1px",
          left: "-1px",
          backgroundColor: "#50525C",
          opacity: 0.15,
          borderRadius: "50%",
          zIndex: 10,
        },
      },
    },
    // Selected + Pressed (Overlay)
    {
      variants: { isSelected: true, isPressed: true },
      style: {
        backgroundColor: vars.color.palette.green[500],
        borderColor: vars.color.palette.green[500],
        "::after": {
          content: '""',
          position: "absolute",
          width: "16px",
          height: "16px",
          top: "-1px",
          left: "-1px",
          backgroundColor: "#50525C",
          opacity: 0.3,
          borderRadius: "50%",
          zIndex: 10,
        },
      },
    },
    // Selected + Focus
    {
      variants: { isSelected: true, isFocusVisible: true },
      style: {
        backgroundColor: vars.color.palette.green[400],
        borderColor: vars.color.palette.green[400],
        boxShadow: `0 0 0 3px #3BD569`,
      },
    },
    // Selected + Disabled
    {
      variants: { isSelected: true, isDisabled: true },
      style: {
        backgroundColor: vars.color.bg.surface,
        borderColor: vars.color.bg.surface,
      },
    },
  ],
  defaultVariants: {
    isSelected: false,
    isHovered: false,
    isPressed: false,
    isFocusVisible: false,
    isDisabled: false,
  },
});

export const dot = recipe({
  base: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: vars.color.palette.gray[100],
    position: "relative",
    zIndex: 1,
  },
  variants: {
    isDisabled: {
      true: { backgroundColor: vars.color.palette.gray[400] },
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const text = recipe({
  base: {
    fontSize: vars.typography.fontSize[14],
    fontWeight: vars.typography.fontWeight.SemiBold, // 600
    lineHeight: "120%", // 1.2
    color: "#000000", // 텍스트만 검정색
    whiteSpace: "nowrap",
  },
  variants: {
    isDisabled: {
      true: { color: vars.color.text.disable },
      false: {},
    },
    hidden: {
      true: { display: "none" },
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
    hidden: false,
  },
});
