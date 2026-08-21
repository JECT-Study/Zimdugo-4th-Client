import { resolveSafeReturnPath } from "#/features/auth/sign-in/model/safe-return-path";
import { LOCALE_PATH_PREFIX } from "#/shared/i18n/locales";
import { isDocumentRequest } from "#/shared/i18n/server-locale-guard";

/** `authStore`의 zustand persist 이름과 동일해야 한다. */
const AUTH_STORAGE_COOKIE = "auth-storage";

const readCookie = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = cookie.trim().split("=");
    if (cookieName !== name) continue;

    return valueParts.join("=");
  }

  return null;
};

/**
 * 문서 요청에 실려 온 persist 쿠키로 로그인 여부를 판단한다.
 * `authStore`는 민감 정보를 빼고 `isAuthenticated`만 쿠키에 남기므로
 * 서버에서도 그대로 읽을 수 있다.
 */
export const isAuthenticatedRequest = (req: Request): boolean => {
  const rawCookie = readCookie(req.headers.get("Cookie"), AUTH_STORAGE_COOKIE);
  if (!rawCookie) return false;

  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie)) as {
      state?: { isAuthenticated?: unknown };
    };

    return parsed.state?.isAuthenticated === true;
  } catch {
    return false;
  }
};

/**
 * 로그인 상태로 로그인 페이지 문서를 요청하면 서버에서 곧장 돌려보낸다.
 *
 * 라우트의 `beforeLoad` 가드는 브라우저에서만 동작한다. SSR 중에는 `window`가
 * 없어 건너뛰고, 클라이언트는 SSR로 이미 만들어진 매치를 그대로 hydrate하므로
 * `beforeLoad`를 다시 실행하지 않는다. 그래서 주소 직접 입력·새로고침·뒤로가기로
 * 문서를 새로 받는 경로에서는 가드가 한 번도 실행되지 않고 로그인 폼이 그대로
 * 그려졌다. 요청 단계에서 막아야 이 구멍이 닫힌다.
 *
 * OAuth 콜백(`?code=`)은 통과시킨다. 이 요청으로 로그인이 완료되기 때문이다.
 */
export const resolveLoginRequest = (req: Request): Response | null => {
  if (!isDocumentRequest(req)) return null;

  const url = new URL(req.url);
  const localePrefix = url.pathname.match(LOCALE_PATH_PREFIX)?.[0] ?? "";
  const pathnameWithoutLocale = url.pathname.slice(localePrefix.length) || "/";

  if (pathnameWithoutLocale !== "/login") return null;
  if (url.searchParams.has("code")) return null;
  if (!isAuthenticatedRequest(req)) return null;

  const safePath = resolveSafeReturnPath(url.searchParams.get("returnPath"));
  const location =
    safePath === "/" ? localePrefix || "/" : `${localePrefix}${safePath}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      // 로그인 상태에 따라 응답이 갈리므로 이 판정은 캐시되면 안 된다.
      "Cache-Control": "no-store",
    },
  });
};
