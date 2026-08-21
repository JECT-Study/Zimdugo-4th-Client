import { isAuthenticatedRequest } from "#/features/auth/sign-in/model/server-login-guard";
import { LOCALE_PATH_PREFIX } from "#/shared/i18n/locales";
import { isDocumentRequest } from "#/shared/i18n/server-locale-guard";

/**
 * 로그인해야 문서를 받을 수 있는 경로. 로케일 접두사를 벗긴 형태로 적는다.
 *
 * `requireAuthenticatedRoute` 를 `beforeLoad` 로 거는 라우트와 정확히 같아야 한다.
 * `/my` 는 `/settings` 로 보내는 호환용 리디렉션일 뿐이고 비로그인도 설정을 볼 수
 * 있으므로 여기 넣지 않는다.
 */
const PROTECTED_PATHNAMES = new Set([
  "/report",
  "/my/reports",
  "/my/favorites",
]);

/** `/report/` 처럼 끝에 슬래시가 붙어도 같은 경로로 봐야 한다. */
const normalizePathname = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname;

/**
 * 비로그인 상태로 보호 경로 문서를 요청하면 서버에서 곧장 홈으로 돌려보낸다.
 *
 * 라우트의 `requireAuthenticatedRoute` 는 브라우저에서만 판정한다. `authStore` 는
 * zustand persist 를 js-cookie 로 저장하는데, 그 스토리지가 `window` 가 없으면
 * `null` 을 돌려주므로 SSR 중에는 로그인한 사용자도 늘 비로그인으로 보였다.
 * 그래서 가드를 서버에서 돌리면 주소 직접 입력·새로고침으로 들어온 로그인
 * 사용자까지 홈으로 튕겨 나갔다. 판정에 필요한 쿠키는 요청에 실려 오므로
 * 요청 단계에서 읽는 게 맞다.
 *
 * 로그인 페이지의 역가드(`resolveLoginRequest`)와 방향만 반대인 같은 구조다.
 */
export const resolveProtectedRequest = (req: Request): Response | null => {
  if (!isDocumentRequest(req)) return null;

  const url = new URL(req.url);
  const localePrefix = url.pathname.match(LOCALE_PATH_PREFIX)?.[0] ?? "";
  const pathnameWithoutLocale =
    normalizePathname(url.pathname.slice(localePrefix.length)) || "/";

  if (!PROTECTED_PATHNAMES.has(pathnameWithoutLocale)) return null;
  if (isAuthenticatedRequest(req)) return null;

  return new Response(null, {
    status: 302,
    headers: {
      Location: localePrefix || "/",
      // 로그인 상태에 따라 응답이 갈리므로 이 판정은 캐시되면 안 된다.
      "Cache-Control": "no-store",
    },
  });
};
