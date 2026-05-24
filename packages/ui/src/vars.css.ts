import { color } from "./tokens/color/color.css.ts";
import { spacing } from "./tokens/spacing/spacing.css.ts";
import { typographyTheme } from "./tokens/typography/typography.css.ts";
import { radius } from "./tokens/radius/radius.css.ts";
import { shadow } from "./tokens/shadow/shadow.css.ts";
import { blur } from "./tokens/blur/blur.css.ts";
import { layoutTheme } from "./tokens/layout/layout.css.ts";
import { zIndexTheme } from "./tokens/z-index/z-index.css.ts";

export const vars = {
  color,
  spacing,
  typography: typographyTheme,
  radius,
  shadow,
  blur,
  layout: layoutTheme.layout,
  zIndex: zIndexTheme.zIndex,
};
