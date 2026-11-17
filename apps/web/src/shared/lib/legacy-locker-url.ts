import { parseOpenLockerDeepLinkSearch } from "#/features/search/lib/open-locker-deep-link";
import { parseLockerSearchParam } from "#/features/search/model/search-url-state";
import { LOCALE_PATH_PREFIX } from "#/shared/i18n/locales";
import {
  createLockerPath,
  toLockerPathSlug,
} from "#/shared/lib/locker-path-url";
import {
  parseSearchString,
  stringifySearchParams,
} from "#/shared/lib/search-serialization";

/**
 * 구 주소(`/?locker=…`)를 새 경로 주소(`/lockers/…`)로 옮기는 규칙.
 *
 * 사이트맵이 색인시킨 주소이고 사용자가 공유한 링크의 모양이라, 경로 라우트로
 * 전환하는 동안 이 대응이 끊기면 유입이 그대로 사라진다(#215). 규칙을 라우트보다
 * 먼저 세워 두고 검증한 뒤에 목적지를 만든다.
 *
 * 이 모듈은 순수 함수만 둔다. 리다이렉트 응답은 `server.ts` 가 낸다.
 *
 * 규칙이 홈 라우트보다 엄격하면 오늘 열리던 주소가 전환 뒤 조용히 홈으로 떨어지고,
 * 느슨하면 열리지 않던 주소에 목적지가 생긴다. 그래서 주소를 읽는 세 단계 — 쿼리
 * 역직렬화, `locker` 판정, `openLockerId` 판정 — 를 모두 홈 라우트와 같은 함수로
 * 한다. 여기서 정규식을 하나라도 따로 들면 그날부터 둘이 갈라진다.
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

export interface LegacyLockerUrl {
  /** 원래 주소가 달고 있던 로케일 접두사. 목적지에도 그대로 붙는다. */
  localePrefix: string;
  /** 목적지 경로의 마지막 조각. 정규 슬러그이거나 id 다. */
  slug: string;
  lockerId: number;
  /** 목적지로 옮겨 갈 나머지 쿼리. 라우터와 같은 방식으로 다시 쓴다. */
  search: Record<string, unknown>;
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

  /*
   * 라우터와 같은 방식으로 읽는다. `URLSearchParams.get` 을 쓰면 `?locker=1e3` 을
   * 문자열로 보고(라우터는 숫자 1000), 같은 키가 두 번 오면 첫 값을 집는다(라우터는
   * 마지막). 둘 다 홈은 여는데 규칙은 못 알아보는 주소를 만든다.
   */
  const search = parseSearchString(url.search);

  /*
   * `locker` 가 `openLockerId` 보다 우선이다. 둘 다 붙은 주소라면 사이트맵이 낸
   * 쪽(`locker`)이 색인된 정체성이고, `openLockerId` 는 앱이 딥링크를 처리하며
   * 붙였다 떼는 일회용 값이다.
   */
  const lockerParamId = parseLockerSearchParam(search.locker);

  /*
   * 두 파라미터는 판정하는 함수가 다르다. `openLockerId` 는 딥링크 파서가 숫자로
   * 받으므로 `12.5` 같은 값도 홈에서는 상세로 간다. 여기서 `locker` 문법으로 다시
   * 재면 그런 주소가 규칙에서만 탈락한다. 각자의 파서가 낸 결과를 그대로 쓴다.
   */
  const deepLinkId = parseOpenLockerDeepLinkSearch(search).openLockerId;

  const rawSlug =
    lockerParamId !== undefined
      ? String(search.locker).trim()
      : deepLinkId !== undefined
        ? String(deepLinkId)
        : null;
  const lockerId = lockerParamId ?? deepLinkId;

  if (rawSlug === null || lockerId === undefined) return null;

  /*
   * 경로에 실을 모양은 라우터가 내보내는 주소와 같은 함수로 정한다. 갈라지면
   * 리다이렉트한 주소를 라우터가 다시 한 번 고쳐 쓰게 된다.
   *
   * 그 함수가 받지 않는 값은 옮기지 않는다. 딥링크 파서는 `openLockerId=12.5` 도
   * 받지만 새 경로는 정수 id 만 상세로 연다. 그대로 옮기면 열리지 않는 주소로 301 을
   * 보내게 되므로, 그런 주소는 옮기지 않고 홈이 지금처럼 처리하게 둔다.
   */
  const slug = toLockerPathSlug(rawSlug);
  if (slug === null) return null;

  for (const param of CONSUMED_DETAIL_PARAMS) delete search[param];
  for (const param of CONFLICTING_SCREEN_PARAMS) delete search[param];

  return { localePrefix, slug, lockerId, search };
};

/** 구 주소에 대응하는 새 경로. 대상이 아니면 null 이다. */
export const resolveLegacyLockerPath = (url: URL): string | null => {
  const parsed = parseLegacyLockerUrl(url);
  if (!parsed) return null;

  const { localePrefix, slug, search } = parsed;

  return `${localePrefix}${createLockerPath(slug)}${stringifySearchParams(search)}`;
};
