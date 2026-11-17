export type LoginProvider = "naver" | "kakao" | "google";

/** 팝업 창에서 돌아온 로그인 결과임을 알리는 검색 파라미터. 값은 요청마다 새로 만든 식별자다. */
export const LOGIN_POPUP_ID_PARAM = "popupId";

const getApiBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:8080" : "");

/** 서버가 인증을 마치고 돌려보낼 로그인 화면 주소. 서버는 이 주소에 `code` 만 덧붙인다. */
export const buildLoginCallbackUrl = ({
  origin,
  returnPath,
  popupId,
}: {
  origin: string;
  returnPath: string;
  popupId?: string;
}) => {
  const url = new URL("/login", origin);
  url.searchParams.set(
    "returnPath",
    returnPath.startsWith("/") ? returnPath : `/${returnPath}`,
  );
  if (popupId) url.searchParams.set(LOGIN_POPUP_ID_PARAM, popupId);

  return url.toString();
};

/** SSR 과 첫 렌더가 같도록 callbackUrl 없이 만든 기본 OAuth 시작 주소. */
export const getSocialLoginBaseUrl = (provider: LoginProvider) =>
  `${getApiBaseUrl()}/oauth2/authorization/${provider}`;

export const buildSocialLoginUrl = (
  provider: LoginProvider,
  callbackUrl: string,
) =>
  `${getSocialLoginBaseUrl(provider)}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
