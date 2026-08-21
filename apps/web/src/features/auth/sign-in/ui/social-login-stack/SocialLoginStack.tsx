import { languageTag, m } from "@repo/i18n";
import { IconGoogle24, IconKakao24, IconNaver19 } from "@repo/ui/tokens/icons";
import type { CSSProperties } from "react";
import {
  loginSocialButtonInlineFallbackStyle,
  loginSocialSubInlineFallbackStyle,
  loginSocialTitleInlineFallbackStyle,
} from "#/features/auth/sign-in/ui/login-page-fallback";
import { resolveEnglishSubVisibility } from "#/shared/i18n/english-sub-policy";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";
import type { AppLanguage } from "#/shared/store/language";
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
  SOCIAL_ROW_BASE_WIDTH_VAR,
  stack,
} from "./SocialLoginStack.css.ts";

type LoginProvider = "naver" | "kakao" | "google";

/**
 * 로케일별 콘텐츠 묶음 폭(아이콘 24 + 간격 10 + 라벨 칸).
 *
 * 한 로케일 안에서는 세 버튼이 **같은 값**을 써야 아이콘·제목 시작선이 맞는다.
 * 207px는 기존 고정 폭 디자인 값(라벨 칸 173px)이고, 한국어·중국어 제목은 그 안에
 * 들어간다. 제목이 더 긴 로케일만 가장 긴 제목 기준으로 여유를 두고 넓힌다.
 *
 * 실측한 가장 긴 제목(폰트 로딩 상태에 따라 재는 값이 몇 px 흔들려서 넉넉한 쪽 기준):
 * ko 172.8 / zh 156.5 / zh-TW 156.5 / en 187.7 / ja 222.8.
 * 잘림은 말줄임으로 이어지므로 아이콘 24 + 간격 10 위에 15px 안팎의 여유를 둔다.
 */
const SOCIAL_ROW_BASE_WIDTH_PX = {
  // 기존 고정 폭 디자인 값. 제목이 173px 칸에 꼭 맞아 그대로 둔다.
  ko: 207,
  // "Google 1-second sign-in" 187.7px — 173px 칸에서는 잘렸다
  en: 240,
  // "ネイバー1秒ログイン/会員登録" 222.8px
  ja: 272,
  zh: 207,
  "zh-TW": 207,
} as const satisfies Record<AppLanguage, number>;

const rowFallbackStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  boxSizing: "border-box",
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
  justifyContent: "center",
  flex: 1,
  minWidth: 0,
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
  const rowBaseWidthPx = SOCIAL_ROW_BASE_WIDTH_PX[appLanguage];
  const rowBaseWidthStyle = {
    [SOCIAL_ROW_BASE_WIDTH_VAR]: `${rowBaseWidthPx}px`,
  } as CSSProperties;
  // 인라인 폴백은 CSS 변수를 못 쓰므로 같은 계산을 직접 적용한다.
  const rowFallbackWidth = `min(${rowBaseWidthPx}px, calc(100% - 32px))`;

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
      style={{ ...rowBaseWidthStyle, ...stackFallbackStyle }}
    >
      {(Object.keys(LOGIN_PROVIDER_CONTENT) as LoginProvider[]).map(
        (provider) => {
          const {
            className: buttonClassName,
            iconClassName,
            Icon,
            title,
            sub,
          } = LOGIN_PROVIDER_CONTENT[provider];

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
                style={
                  applyFallbackStyle
                    ? { ...rowFallbackStyle, width: rowFallbackWidth }
                    : undefined
                }
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
                  <span
                    className={labelTitle}
                    style={
                      applyFallbackStyle
                        ? loginSocialTitleInlineFallbackStyle
                        : undefined
                    }
                  >
                    {title()}
                  </span>
                  {isEnglishSubVisible ? (
                    <span
                      className={labelEn}
                      style={
                        applyFallbackStyle
                          ? loginSocialSubInlineFallbackStyle
                          : undefined
                      }
                    >
                      {sub()}
                    </span>
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
