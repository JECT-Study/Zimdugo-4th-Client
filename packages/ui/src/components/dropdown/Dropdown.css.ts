import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../../vars.css.ts";

export const root = style({
  display: "inline-flex",
  flexDirection: "column",
  width: "100%",
  position: "relative",
});

export const button = recipe({
  base: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: vars.radius.scale[4],
    border: `1px solid ${vars.color.border.default}`,
    backgroundColor: vars.color.bg.default,
    color: vars.color.text.title,
    cursor: "pointer",
    outline: "none",
    selectors: {
      "&[data-focus-visible]": {
        borderColor: vars.color.focus,
      },
      "&[data-pressed]": {
        borderColor: vars.color.border.action,
      },
    },
  },
  variants: {
    size: {
      default: {
        height: "48px",
        padding: `0 ${vars.spacing.scale[16]}`,
        fontSize: vars.typography.fontSize[16],
        fontWeight: vars.typography.fontWeight.Regular,
      },
      compact: {
        height: "44px",
        padding: `0 ${vars.spacing.scale[12]}`,
        fontSize: vars.typography.fontSize[16],
        fontWeight: vars.typography.fontWeight.Medium,
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const chevronRecipe = recipe({
  base: {
    display: "inline-block",
    transition: "transform 0.2s ease",
  },
  variants: {
    rotation: {
      up: { transform: "rotate(180deg)" },
      down: { transform: "rotate(0deg)" },
    },
  },
  defaultVariants: {
    rotation: "down",
  },
});

export const valueText = recipe({
  base: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    color: vars.color.text.title,
    selectors: {
      "&[data-placeholder]": {
        color: vars.color.text.surface,
      },
    },
  },
  variants: {
    size: {
      default: {},
      compact: {
        selectors: {
          "&[data-placeholder]": {
            fontSize: vars.typography.fontSize[14],
            fontWeight: vars.typography.fontWeight.SemiBold,
          },
        },
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const popover = recipe({
  base: {
    width: "var(--trigger-width)",
    backgroundColor: vars.color.bg.default,
    borderRadius: vars.radius.scale[4],
    border: `1px solid ${vars.color.border.default}`,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    zIndex: vars.zIndex.modal,
    overflow: "hidden",
  },
  variants: {
    size: {
      default: {
        maxHeight: "240px",
      },
      compact: {
        maxHeight: "280px",
        borderRadius: vars.radius[8],
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const listbox = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    outline: "none",
    maxHeight: "inherit",
    overflowY: "auto",
  },
  variants: {
    size: {
      default: {
        padding: `${vars.spacing.scale[4]} 0`,
      },
      compact: {
        padding: 0,
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const item = recipe({
  base: {
    color: vars.color.text.surface,
    cursor: "pointer",
    outline: "none",
    selectors: {
      "&[data-focused], &[data-hovered]": {
        backgroundColor: vars.color.bg.surface,
      },
      "&[data-selected]": {
        color: vars.color.text.title,
        fontWeight: vars.typography.fontWeight.Medium,
      },
    },
  },
  variants: {
    size: {
      default: {
        padding: `${vars.spacing.scale[12]} ${vars.spacing.scale[16]}`,
        fontSize: vars.typography.fontSize[16],
      },
      compact: {
        padding: vars.spacing[12],
        borderBottom: `1px solid ${vars.color.border.default}`,
        fontSize: vars.typography.fontSize[16],
        fontWeight: vars.typography.fontWeight.Medium,
        lineHeight: "1.2",
        selectors: {
          "&:last-child": {
            borderBottom: 0,
          },
        },
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});
