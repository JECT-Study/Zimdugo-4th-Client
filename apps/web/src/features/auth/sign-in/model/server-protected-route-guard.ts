import { isAuthenticatedRequest } from "#/features/auth/sign-in/model/server-login-guard";
import { LOCALE_PATH_PREFIX } from "#/shared/i18n/locales";
import { isDocumentRequest } from "#/shared/i18n/server-locale-guard";
import { isProtectedPath } from "#/shared/model/protected-paths";

/**
 * 로그인해야 받을 수 있는 문서 요청인가. 로그인 여부는 보지 않는다.
 *
 * 경로 판정은 `isProtectedPath` 하나에 맡긴다. 목록도 끝 슬래시 정규화도 서버와
 * 클라이언트가 같은 코드를 써야 같은 URL 을 같게 판정한다.
 *
 * `/my` 는 `/settings` 로 보내는 호환용 리디렉션일 뿐이고 비로그인도 설정을 볼 수
 * 있으므로 그 목록에 없다.
 */
export const isProtectedDocumentRequest = (req: Request): boolean => {
  if (!isDocumentRequest(req)) return false;

  const url = new URL(req.url);
  const localePrefix = url.pathname.match(LOCALE_PATH_PREFIX)?.[0] ?? "";

  return isProtectedPath(url.pathname.slice(localePrefix.length) || "/");
};

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
  if (!isProtectedDocumentRequest(req)) return null;
  if (isAuthenticatedRequest(req)) return null;

  const url = new URL(req.url);
  const localePrefix = url.pathname.match(LOCALE_PATH_PREFIX)?.[0] ?? "";

  return new Response(null, {
    status: 302,
    headers: {
      Location: localePrefix || "/",
      // 로그인 상태에 따라 응답이 갈리므로 이 판정은 캐시되면 안 된다.
      "Cache-Control": "no-store",
    },
  });
};

/**
 * 통과시킨 보호 문서 응답에도 `no-store` 를 남긴다.
 *
 * 위 리다이렉트에만 헤더를 붙이면 로그인 사용자가 받는 200 문서는 캐시 지시가
 * 없는 채로 나간다. 같은 URL 의 응답이 로그인 여부로 갈리는 건 리다이렉트 쪽과
 * 똑같으므로, 통과한 응답도 공유 캐시나 뒤로가기 캐시에 남으면 안 된다.
 *
 * 헤더가 불변인 응답이 올 수 있어 새 `Response` 로 감싼다.
 */
export const withProtectedDocumentHeaders = (
  req: Request,
  response: Response,
): Response => {
  if (!isProtectedDocumentRequest(req)) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
