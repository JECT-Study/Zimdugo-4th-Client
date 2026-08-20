import { providerImage, providerRoot } from "./IconSocialProvider18.css";

const providerAssetUrl = {
  google: new URL("./assets/social-login-google-glyph.svg", import.meta.url)
    .href,
  naver: new URL("./assets/social-login-naver.svg", import.meta.url).href,
  kakao: new URL("./assets/social-login-kakao-glyph.svg", import.meta.url).href,
} as const;

export type SocialProvider = keyof typeof providerAssetUrl;

interface IconSocialProvider18Props {
  provider: SocialProvider;
  className?: string;
}

export function IconSocialProvider18({
  provider,
  className,
}: IconSocialProvider18Props) {
  return (
    <span
      className={[providerRoot[provider], className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <img
        className={providerImage[provider]}
        src={providerAssetUrl[provider]}
        alt=""
      />
    </span>
  );
}
