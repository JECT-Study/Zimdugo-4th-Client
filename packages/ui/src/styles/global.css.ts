// CSS Layers 정의 (반드시 가장 먼저 import!)
import "./layers.css.ts";
// CSS Reset
import "./normalize.css.ts";
import { globalFontFace, globalStyle } from "@vanilla-extract/css";

const ASSET_FONT_DIR = "../../assets/fonts";

globalFontFace("Pretendard", {
  src: `local("Pretendard"), url("${ASSET_FONT_DIR}/PretendardVariable.woff2") format("woff2")`,
  fontDisplay: "swap",
  fontWeight: "100 900",
  fontStyle: "normal",
  unicodeRange:
    "U+0020-002F, U+0030-0039, U+003A-0040, U+005B-0060, U+007B-007E, U+1100-11FF, U+3130-318F, U+AC00-D7A3",
});

const METROPOLIS_WEIGHTS = [
  { fileName: "Metropolis-Regular.woff2", fontWeight: "400" },
  { fileName: "Metropolis-SemiBold.woff2", fontWeight: "600" },
  { fileName: "Metropolis-Bold.woff2", fontWeight: "700" },
] as const;

METROPOLIS_WEIGHTS.forEach(({ fileName, fontWeight }) => {
  globalFontFace("Metropolis", {
    src: `local("Metropolis"), url("${ASSET_FONT_DIR}/${fileName}") format("woff2")`,
    fontDisplay: "swap",
    fontWeight,
    fontStyle: "normal",
  });
});

globalStyle("html, body", {
  fontFamily: '"Pretendard", "Metropolis", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  height: "100%",
  margin: 0,
  padding: 0,
});

globalStyle("body", {
  fontFamily: "inherit",
});

globalStyle("#app, #root", {
  height: "100%",
});
