import { parseOpenLockerDeepLinkSearch } from "#/features/search/lib/open-locker-deep-link";
import { parseLockerSearchParam } from "#/features/search/model/search-url-state";
import { LOCALE_PATH_PREFIX } from "#/shared/i18n/locales";

/**
 * 구 주소(`/?locker=…`)를 새 경로 주소(`/lockers/…`)로 옮기는 규칙.
 *
 * 사이트맵이 색인시킨 주소이고 사용자가 공유한 링크의 모양이라, 경로 라우트로
 * 전환하는 동안 이 대응이 끊기면 유입이 그대로 사라진다(#215). 규칙을 라우트보다
 * 먼저 세워 두고 검증한 뒤에 목적지를 만든다.
 *
 * 이 모듈은 순수 함수만 둔다. 실제 리다이렉트 응답을 내는 것은 목적지 라우트가
 * 생긴 뒤의 일이다.
 */

/** 새 주소에서 경로가 대신 나타내는 파라미터. 목적지에 남기지 않는다. */
const CONSUMED_DETAIL_PARAMS = ["locker", "openLockerId"] as const;

/**
 * 상세와 동시에 성립할 수 없는 파라미터.
 *
 * 구 구조는 파라미터가 한 봉지라 `locker` 와 `searchPlaceId` 가 함께 붙은 주소를
 * 만들 수 있었다(#215 "모순된 주소"). 그런 주소가 색인에 남아 있어도 목적지는
 * 하나여야 하므로, 더 깊은 화면인 상세를 남기고 장소 목록 쪽을 뗀다.
 */
const CONFLICTING_SCREEN_PARAMS = ["searchPlaceId"] as const;

/** 새 상세 주소의 경로 뿌리. 목적지 라우트가 생기면 그쪽과 함께 쓴다. */
const LOCKER_ROUTE_BASE = "/lockers";

/**
 * 경로 조각으로 그대로 써도 되는 슬러그 모양.
 *
 * 상세 판정(`parseLockerSearchParam`)은 하이픈 뒤를 무엇이든 받는다. `?locker=164-a/b`
 * 도 오늘 상세로 열린다는 뜻이다. 그 모양을 경로에 그대로 붙이면 `/lockers/164-a/b` 가
 * 되어 다른 라우트로 새어 나가므로, 정규 슬러그(`createLockerDeepLinkSlug` 가 내는
 * 문자·숫자·하이픈)만 통과시킨다.
 *
 * 통과하지 못하면 이름을 버리고 id 만 남긴다. 이름은 장식이고 정체성은 id 다.
 * 주소를 버리지 않으면서 경로를 안전하게 만드는 길이다.
 */
const CANONICAL_LOCKER_SLUG_PATTERN = /^\d+(?:-[\p{L}\p{N}-]*)?$/u;

export interface LegacyLockerUrl {
  /** 원래 주소가 달고 있던 로케일 접두사. 목적지에도 그대로 붙는다. */
  localePrefix: string;
  /** 목적지 경로의 마지막 조각. 정규 슬러그이거나 숫자 id 다. */
  slug: string;
  lockerId: number;
  /** 목적지로 옮겨 갈 나머지 쿼리. */
  search: URLSearchParams;
}

/**
 * 구 상세 주소인지 판별하고, 목적지를 만들 재료로 쪼갠다.
 *
 * 홈(`/`)에 붙은 파라미터만 본다. 다른 경로는 이미 자기 라우트를 가진 화면이라
 * 이 규칙의 대상이 아니다.
 */
export const parseLegacyLockerUrl = (url: URL): LegacyLockerUrl | null => {
  const localePrefix = url.pathname.match(LOCALE_PATH_PREFIX)?.[0] ?? "";
  const pathnameWithoutLocale = url.pathname.slice(localePrefix.length) || "/";

  if (pathnameWithoutLocale !== "/") return null;

  const search = new URLSearchParams(url.search);

  /*
   * `locker` 가 `openLockerId` 보다 우선이다. 둘 다 붙은 주소라면 사이트맵이 낸
   * 쪽(`locker`)이 색인된 정체성이고, `openLockerId` 는 앱이 딥링크를 처리하며
   * 붙였다 떼는 일회용 값이다.
   */
  const rawLocker = search.get("locker") ?? "";
  const rawOpenLockerId = search.get("openLockerId") ?? "";

  /*
   * 상세로 인정할지는 홈 라우트와 같은 함수로 판정한다. 여기서 따로 정규식을 들면
   * 둘이 갈라지는 날 오늘 열리던 주소가 조용히 홈으로 떨어진다.
   */
  const rawSlug =
    parseLockerSearchParam(rawLocker) !== undefined
      ? rawLocker.trim()
      : parseOpenLockerDeepLinkSearch({ openLockerId: rawOpenLockerId })
            .openLockerId !== undefined
        ? rawOpenLockerId.trim()
        : null;

  if (rawSlug === null) return null;

  const lockerId = parseLockerSearchParam(rawSlug);
  if (lockerId === undefined) return null;

  const slug = CANONICAL_LOCKER_SLUG_PATTERN.test(rawSlug)
    ? rawSlug
    : String(lockerId);

  for (const param of CONSUMED_DETAIL_PARAMS) search.delete(param);
  for (const param of CONFLICTING_SCREEN_PARAMS) search.delete(param);

  return { localePrefix, slug, lockerId, search };
};

/**
 * 구 주소에 대응하는 새 경로. 대상이 아니면 null 이다.
 *
 * 슬러그는 검증을 통과한 모양이라도 인코딩해서 붙인다. 검증이 나중에 느슨해져도
 * 경로가 새어 나가지 않게 하는 쪽이 싸다.
 */
export const resolveLegacyLockerPath = (url: URL): string | null => {
  const parsed = parseLegacyLockerUrl(url);
  if (!parsed) return null;

  const { localePrefix, slug, search } = parsed;
  const query = search.toString();

  return `${localePrefix}${LOCKER_ROUTE_BASE}/${encodeURIComponent(slug)}${
    query ? `?${query}` : ""
  }`;
};
