import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const root = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: vars.spacing.scale[8],
    cursor: "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  variants: {
    isDisabled: {
      true: {
        cursor: "not-allowed",
      },
      false: {},
    },
    labelPosition: {
      right: {
        flexDirection: "row",
      },
      left: {
        flexDirection: "row-reverse",
      },
      none: {
        flexDirection: "row",
      },
    },
  },
  defaultVariants: {
    isDisabled: false,
    labelPosition: "right",
  },
});

export const track = recipe({
  base: {
    width: "44px", // 48 -> 44
    height: "24px", // 28 -> 24
    borderRadius: "999px",
    padding: "2px",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    position: "relative",
    transition: "background-color 120ms ease, outline-color 120ms ease",
    border: "none",
    outline: "none",
    backgroundColor: vars.color.bg.subtle,
    overflow: "hidden", // 오버레이를 위해 추가
  },
  variants: {
    isSelected: {
      true: {
        backgroundColor: vars.color.bg.brand.default,
      },
      false: {},
    },
    isHovered: {
      true: {
        // Radio 벤치마킹: 가상 요소로 덧씌우기 위해 base 유지
      },
      false: {},
    },
    isPressed: {
      true: {},
      false: {},
    },
    isFocusVisible: {
      true: {
        outline: `3px solid ${vars.color.focus}`,
        outlineOffset: "0px",
      },
      false: {},
    },
    isDisabled: {
      true: {
        backgroundColor: vars.color.bg.subtle,
      },
      false: {},
    },
  },
  compoundVariants: [
    // Selected + Hover (Radio 스타일 오버레이)
    {
      variants: { isSelected: true, isHovered: true },
      style: {
        "::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundColor: "#50525C",
          opacity: 0.15,
          pointerEvents: "none",
        },
      },
    },
    // Selected + Pressed
    {
      variants: { isSelected: true, isPressed: true },
      style: {
        "::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundColor: "#50525C",
          opacity: 0.3,
          pointerEvents: "none",
        },
      },
    },
    // Not Selected + Hover
    {
      variants: { isSelected: false, isHovered: true },
      style: {
        backgroundColor: vars.color.bg.surface,
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

export const thumb = recipe({
  base: {
    width: "20px", // 24 -> 20
    height: "20px", // 24 -> 20
    borderRadius: "50%",
    backgroundColor: vars.color.icon.white,
    boxShadow: "0px 2px 4px rgba(22, 24, 28, 0.12)",
    transition: "transform 120ms ease",
    transform: "translateX(0px)",
    position: "relative",
    zIndex: 1,
  },
  variants: {
    isSelected: {
      true: {
        transform: "translateX(20px)", // 44 - 20 - 4 = 20
      },
      false: {},
    },
    isDisabled: {
      true: {
        backgroundColor: vars.color.bg.surface,
      },
      false: {},
    },
  },
  defaultVariants: {
    isSelected: false,
    isDisabled: false,
  },
});

export const label = style({
  fontFamily: "Pretendard, -apple-system, sans-serif",
  fontSize: vars.typography.fontSize[14],
  fontWeight: vars.typography.fontWeight.Medium,
  lineHeight: "1.2",
  color: vars.color.text.title,
  whiteSpace: "nowrap",
});
