import { languageTag, m } from "@repo/i18n";
import { IconGoogle24, IconKakao24, IconNaver19 } from "@repo/ui/tokens/icons";
import type { CSSProperties } from "react";
import { loginSocialButtonInlineFallbackStyle } from "#/features/auth/sign-in/ui/login-page-fallback";
import { resolveEnglishSubVisibility } from "#/shared/i18n/english-sub-policy";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";
import {
  google,
  icon19,
  icon24,
  kakao,
  labelContainer,
  labelEn,
  labelTitle,
  naver,
  row,
  stack,
} from "./SocialLoginStack.css.ts";

type LoginProvider = "naver" | "kakao" | "google";

const rowFallbackStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width: 207,
};

const iconFallbackStyle: CSSProperties = {
  width: 24,
  height: 24,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const labelContainerFallbackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  width: 173,
  lineHeight: 1.2,
};

const LOGIN_PROVIDER_CONTENT: Record<
  LoginProvider,
  {
    className: string;
    iconClassName: string;
    Icon: typeof IconNaver19;
    title: () => string;
    sub: () => string;
  }
> = {
  naver: {
    className: naver,
    iconClassName: icon19,
    Icon: IconNaver19,
    title: m.login_social_naver,
    sub: m.login_social_naver_sub,
  },
  kakao: {
    className: kakao,
    iconClassName: icon24,
    Icon: IconKakao24,
    title: m.login_social_kakao,
    sub: m.login_social_kakao_sub,
  },
  google: {
    className: google,
    iconClassName: icon24,
    Icon: IconGoogle24,
    title: m.login_social_google,
    sub: m.login_social_google_sub,
  },
};

export interface SocialLoginStackProps {
  /** Storybook/tests override. Default follows app language (hidden when UI is English). */
  showEnglishLabel?: boolean;
  className?: string;
  /** CSS 청크 지연 시 스택 컨테이너 인라인 레이아웃 폴백 */
  stackFallbackStyle?: CSSProperties;
  /** CSS 청크 지연 시 버튼·행 인라인 레이아웃 폴백 */
  applyFallbackStyle?: boolean;
  /** 클라이언트 측 로그인 처리 로직을 주입해야 하는 경우 */
  onLogin?: (provider: LoginProvider) => void;
  returnPath?: string;
}

/**
 * 소셜 로그인 액션 컴포넌트.
 * 단순 링크 이동뿐 아니라 필요 시 useMutation을 통한 커스텀 로그인 로직을 포함할 수 있습니다.
 */
export function SocialLoginStack({
  showEnglishLabel,
  className,
  stackFallbackStyle,
  applyFallbackStyle = false,
  onLogin,
  returnPath = "/",
}: SocialLoginStackProps) {
  const appLanguage = normalizeLocale(languageTag()) ?? BASE_LOCALE;
  const isEnglishSubVisible =
    showEnglishLabel ?? resolveEnglishSubVisibility({ appLanguage });

  const getHref = (provider: LoginProvider) => {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ??
      (import.meta.env.DEV ? "http://localhost:8080" : "");
    // SSR 렌더링 시에는 브라우저 환경 변수 차이로 인한 Hydration Mismatch를 방지하기 위해
    // 기본 OAuth 주소만 렌더링하고, 실제 콜백 경로는 클릭 이벤트에서 동적으로 주입합니다.
    return `${baseUrl}/oauth2/authorization/${provider}`;
  };

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    provider: LoginProvider,
  ) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(provider);
      return;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ??
      (import.meta.env.DEV ? "http://localhost:8080" : "");

    const encodedReturnPath = encodeURIComponent(
      returnPath.startsWith("/") ? returnPath : `/${returnPath}`,
    );
    const absoluteCallbackUrl = `${window.location.origin}/login?returnPath=${encodedReturnPath}`;

    window.location.href = `${baseUrl}/oauth2/authorization/${provider}?callbackUrl=${encodeURIComponent(absoluteCallbackUrl)}`;
  };

  return (
    <div
      className={[stack, className].filter(Boolean).join(" ")}
      style={stackFallbackStyle}
    >
      {(Object.keys(LOGIN_PROVIDER_CONTENT) as LoginProvider[]).map(
        (provider) => {
          const { className: buttonClassName, iconClassName, Icon, title, sub } =
            LOGIN_PROVIDER_CONTENT[provider];

          return (
            <a
              key={provider}
              href={getHref(provider)}
              className={buttonClassName}
              style={
                applyFallbackStyle
                  ? loginSocialButtonInlineFallbackStyle
                  : undefined
              }
              onClick={(e) => handleClick(e, provider)}
            >
              <span
                className={row}
                style={applyFallbackStyle ? rowFallbackStyle : undefined}
              >
                <span
                  className={iconClassName}
                  style={applyFallbackStyle ? iconFallbackStyle : undefined}
                >
                  <Icon />
                </span>
                <span
                  className={labelContainer}
                  style={
                    applyFallbackStyle ? labelContainerFallbackStyle : undefined
                  }
                >
                  <span className={labelTitle}>{title()}</span>
                  {isEnglishSubVisible ? (
                    <span className={labelEn}>{sub()}</span>
                  ) : null}
                </span>
              </span>
            </a>
          );
        },
      )}
    </div>
  );
}
