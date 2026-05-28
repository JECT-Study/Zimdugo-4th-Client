import { useSearch } from "@tanstack/react-router";
import { IconGoogle24, IconKakao24, IconNaver19 } from "@repo/ui/tokens/icons";
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

const loginTexts = {
  naver: {
    title: "네이버 1초 로그인/회원가입",
    en: "Naver 1 second login/membership",
  },
  kakao: {
    title: "카카오 1초 로그인/회원가입",
    en: "Kakao 1 second login/membership",
  },
  google: {
    title: "구글 1초 로그인/회원가입",
    en: "Google 1 second login/membership",
  },
};

export interface SocialLoginStackProps {
  /** Figma 로그인 버튼의 영어 보조 문구 표시 여부 */
  showEnglishLabel?: boolean;
  className?: string;
  /** 클라이언트 측 로그인 처리 로직을 주입해야 하는 경우 */
  onLogin?: (provider: LoginProvider) => void;
}

/**
 * 소셜 로그인 액션 컴포넌트.
 * 단순 링크 이동뿐 아니라 필요 시 useMutation을 통한 커스텀 로그인 로직을 포함할 수 있습니다.
 */
export function SocialLoginStack({
  showEnglishLabel = false,
  className,
  onLogin,
}: SocialLoginStackProps) {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const returnPath = (search.returnPath as string) || "/";

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

    // 클라이언트 브라우저에서 실행되므로 window 객체에 안전하게 접근 가능
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ??
      (import.meta.env.DEV ? "http://localhost:8080" : "");
    
    // 콜백이 무조건 /login을 거치도록 해야, my, report 등 보호된 라우트의 beforeLoad에서 차단되지 않고
    // 토큰 갱신 로직(useLoginResultHandler)이 정상적으로 실행될 수 있습니다.
    const encodedReturnPath = encodeURIComponent(returnPath.startsWith("/") ? returnPath : `/${returnPath}`);
    const absoluteCallbackUrl = `${window.location.origin}/login?returnPath=${encodedReturnPath}`;
    
    window.location.href = `${baseUrl}/oauth2/authorization/${provider}?callbackUrl=${encodeURIComponent(absoluteCallbackUrl)}`;
  };

  return (
    <div className={[stack, className].filter(Boolean).join(" ")}>
      <a
        href={getHref("naver")}
        className={naver}
        onClick={(e) => handleClick(e, "naver")}
      >
        <span className={row}>
          <span className={icon19}>
            <IconNaver19 />
          </span>
          <span className={labelContainer}>
            <span className={labelTitle}>{loginTexts.naver.title}</span>
            {showEnglishLabel && (
              <span className={labelEn}>{loginTexts.naver.en}</span>
            )}
          </span>
        </span>
      </a>
      <a
        href={getHref("kakao")}
        className={kakao}
        onClick={(e) => handleClick(e, "kakao")}
      >
        <span className={row}>
          <span className={icon24}>
            <IconKakao24 />
          </span>
          <span className={labelContainer}>
            <span className={labelTitle}>{loginTexts.kakao.title}</span>
            {showEnglishLabel && (
              <span className={labelEn}>{loginTexts.kakao.en}</span>
            )}
          </span>
        </span>
      </a>
      <a
        href={getHref("google")}
        className={google}
        onClick={(e) => handleClick(e, "google")}
      >
        <span className={row}>
          <span className={icon24}>
            <IconGoogle24 />
          </span>
          <span className={labelContainer}>
            <span className={labelTitle}>{loginTexts.google.title}</span>
            {showEnglishLabel && (
              <span className={labelEn}>{loginTexts.google.en}</span>
            )}
          </span>
        </span>
      </a>
    </div>
  );
}
