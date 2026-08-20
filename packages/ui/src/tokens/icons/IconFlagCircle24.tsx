import {
  canvas,
  chinaStar,
  fillImage,
  koreaCanvas,
  koreaSymbol,
  root,
  wideFlagImage,
} from "./IconFlagCircle24.css";

const assetUrl = {
  koreaSymbol: new URL("./assets/flag-circle-korea-symbol.svg", import.meta.url)
    .href,
  japan: new URL("./assets/flag-circle-japan.svg", import.meta.url).href,
  taiwan: new URL("./assets/flag-circle-taiwan.svg", import.meta.url).href,
  chinaBase: new URL("./assets/flag-circle-china-base.svg", import.meta.url)
    .href,
  chinaStarLarge: new URL(
    "./assets/flag-circle-china-star-large.svg",
    import.meta.url,
  ).href,
  chinaStar1: new URL("./assets/flag-circle-china-star-1.svg", import.meta.url)
    .href,
  chinaStar2: new URL("./assets/flag-circle-china-star-2.svg", import.meta.url)
    .href,
  chinaStar3: new URL("./assets/flag-circle-china-star-3.svg", import.meta.url)
    .href,
  chinaStar4: new URL("./assets/flag-circle-china-star-4.svg", import.meta.url)
    .href,
  unitedStates: new URL(
    "./assets/flag-circle-united-states.svg",
    import.meta.url,
  ).href,
} as const;

export type FlagCountry = "ko" | "ja" | "zh-TW" | "zh" | "en";

interface IconFlagCircle24Props {
  country: FlagCountry;
  className?: string;
}

export function IconFlagCircle24({
  country,
  className,
}: IconFlagCircle24Props) {
  const rootClassName = [root, className].filter(Boolean).join(" ");

  if (country === "ko") {
    return (
      <span className={rootClassName} aria-hidden="true">
        <span className={[canvas.center, koreaCanvas].join(" ")}>
          <img className={koreaSymbol} src={assetUrl.koreaSymbol} alt="" />
        </span>
      </span>
    );
  }

  if (country === "zh") {
    return (
      <span className={rootClassName} aria-hidden="true">
        <span className={canvas.topLeft}>
          <img className={fillImage} src={assetUrl.chinaBase} alt="" />
          <img
            className={chinaStar.large}
            src={assetUrl.chinaStarLarge}
            alt=""
          />
          <img className={chinaStar.first} src={assetUrl.chinaStar1} alt="" />
          <img className={chinaStar.second} src={assetUrl.chinaStar2} alt="" />
          <img className={chinaStar.third} src={assetUrl.chinaStar3} alt="" />
          <img className={chinaStar.fourth} src={assetUrl.chinaStar4} alt="" />
        </span>
      </span>
    );
  }

  const flag = {
    ja: { canvasClassName: canvas.center, imageClassName: wideFlagImage.japan },
    "zh-TW": {
      canvasClassName: canvas.topCenter,
      imageClassName: wideFlagImage.taiwan,
    },
    en: {
      canvasClassName: canvas.topCenter,
      imageClassName: wideFlagImage.unitedStates,
    },
  }[country];
  const imageUrl = {
    ja: assetUrl.japan,
    "zh-TW": assetUrl.taiwan,
    en: assetUrl.unitedStates,
  }[country];

  return (
    <span className={rootClassName} aria-hidden="true">
      <span className={flag.canvasClassName}>
        <img className={flag.imageClassName} src={imageUrl} alt="" />
      </span>
    </span>
  );
}
