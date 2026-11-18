import {
  type AppLocale,
  BASE_LOCALE,
  stripLocalePathPrefix,
} from "#/shared/i18n/locales";

/**
 * 보관함 상세 문서를 Vercel CDN 에 잠깐 담아 두는 규칙.
 *
 * 상세는 요청마다 서버가 그리고 그때마다 API 를 부른다. 크롤러가 수천 개의 상세를
 * 돌면 그 비용이 그대로 쌓인다. 10분 동안은 CDN 이 답하고, 그 뒤 하루까지는 낡은
 * 응답을 먼저 주면서 뒤에서 새로 그린다. 운영시간·요금이 바뀌면 길어야 10분 뒤에
 * 반영된다.
 *
 * `Vercel-CDN-Cache-Control` 로 CDN 에만 건다. 브라우저 캐시(`Cache-Control`)는
 * 지금처럼 매번 재검증하게 둔다.
 *
 * 로케일 접두사가 있는 주소(`/en/lockers/1326`)만 담는다. 접두사 없는 주소는
 * 쿠키·Accept-Language 에 따라 다른 로케일로 리다이렉트하는데(`server-locale-guard`),
 * 한국어 200 을 CDN 에 담으면 그 판정을 건너뛰고 영어 사용자에게도 한국어가 나간다.
 * 접두사가 있으면 가드가 요청 헤더와 무관하게 통과시키므로 주소 하나에 응답이 하나다.
 */
export const LOCKER_DETAIL_CDN_CACHE_CONTROL =
  "max-age=600, stale-while-revalidate=86400";

const LOCKER_DETAIL_PATH_PATTERN = /^\/lockers\/\d+$/;

const isCacheableLockerDetailResponse = ({
  method,
  pathname,
  pathLocale,
  response,
}: {
  method: string;
  pathname: string;
  pathLocale: AppLocale | null;
  response: Response;
}): boolean => {
  if (method !== "GET") return false;
  if (!pathLocale || pathLocale === BASE_LOCALE) return false;
  if (!LOCKER_DETAIL_PATH_PATTERN.test(stripLocalePathPrefix(pathname))) {
    return false;
  }
  // 404(없는 보관함)·5xx·리다이렉트는 담지 않는다. 일시 오류가 10분 동안 굳는다.
  if (response.status !== 200) return false;
  // 로더가 데이터를 못 가져와 대체 문서를 그린 응답이다(`markResponseUncacheable`).
  if (response.headers.get("cache-control")?.includes("no-store")) return false;
  // 사용자별 쿠키가 실린 응답을 공용 캐시에 담으면 다른 사람에게 건너간다.
  if (response.headers.has("set-cookie")) return false;
  return response.headers.get("content-type")?.includes("text/html") ?? false;
};

export const withLockerDetailCdnCache = (
  req: Request,
  pathLocale: AppLocale | null,
  response: Response,
): Response => {
  const { pathname } = new URL(req.url);
  if (
    !isCacheableLockerDetailResponse({
      method: req.method,
      pathname,
      pathLocale,
      response,
    })
  ) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Vercel-CDN-Cache-Control", LOCKER_DETAIL_CDN_CACHE_CONTROL);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
