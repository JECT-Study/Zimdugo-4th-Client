import {
  parseLockerSearchParam,
  readSearchPlaceIdParam,
} from "#/features/search/model/search-url-state";
import {
  parseSearchString,
  stringifySearchParams,
} from "#/shared/lib/search-serialization";

/**
 * 지도 위 화면의 공개 주소와 라우터가 다루는 주소 사이를 오가는 규칙.
 *
 * | 바깥 주소            | 라우터 안쪽 주소      |
 * |----------------------|-----------------------|
 * | `/`                  | `/`                   |
 * | `/search?q=강남`     | `/?q=강남`            |
 * | `/places/9?q=강남`   | `/?place=9&q=강남`    |
 * | `/lockers/164?q=강남`| `/?locker=164&q=강남` |
 *
 * 경로는 "무엇을 보고 있나" 하나만 나타낸다. 상세 > 장소 > 검색 순으로 가장 깊은
 * 것이 경로가 되고, 나머지(검색어, 상세 아래 깔린 장소)는 쿼리로 남는다. 화면을
 * 정하는 규칙은 `features/search/model/map-screen` 에 있다.
 *
 * ## 왜 라우트가 아니라 주소 변환인가
 *
 * 이 화면들은 아직 `_map.index.tsx` 한 컴포넌트 안의 상태다. 라우트를 나누면 경로가
 * 바뀌는 순간 그 컴포넌트가 다시 만들어져 화면 상태를 잃는다. 그래서 라우터 안쪽은
 * 하나의 라우트로 두고 **바깥에 보이는 주소만** 경로로 바꾼다. 라우터의 `rewrite` 가
 * 들어올 때 경로를 쿼리로, 나갈 때 쿼리를 경로로 옮긴다.
 *
 * 화면 상태를 컴포넌트 밖으로 꺼내고 나면(#215 4단계) 이 모듈은 실제 라우트 정의로
 * 대체된다.
 */

const LOCKER_ROUTE_BASE = "/lockers";
const PLACE_ROUTE_BASE = "/places";
const SEARCH_ROUTE_PATH = "/search";

const LOCKER_PATH_PATTERN = /^\/lockers\/([^/]+)\/?$/;
const PLACE_PATH_PATTERN = /^\/places\/([^/]+)\/?$/;
const SEARCH_PATH_PATTERN = /^\/search\/?$/;

/**
 * 경로 조각으로 그대로 써도 되는 슬러그 모양.
 *
 * 상세 판정(`parseLockerSearchParam`)은 하이픈 뒤를 무엇이든 받는다. `?locker=164-a/b`
 * 도 상세로 열린다는 뜻이다. 그 모양을 경로에 그대로 붙이면 `/lockers/164-a/b` 가
 * 되어 다른 라우트로 새어 나가므로, 정규 슬러그(`createLockerDeepLinkSlug` 가 내는
 * 문자·숫자·하이픈)만 통과시킨다.
 *
 * 통과하지 못하면 이름을 버리고 id 만 남긴다. 이름은 장식이고 정체성은 id 다.
 */
const CANONICAL_LOCKER_SLUG_PATTERN = /^\d+(?:-[\p{L}\p{N}-]*)?$/u;

/**
 * 경로에 실을 슬러그. 정규 모양이면 그대로, 아니면 id 만 남긴다.
 *
 * 상세로 인정하지 않는 값이면 null 이다.
 */
export const toLockerPathSlug = (raw: unknown): string | null => {
  const lockerId = parseLockerSearchParam(raw);
  if (lockerId === undefined) return null;

  const value = String(raw).trim();
  return CANONICAL_LOCKER_SLUG_PATTERN.test(value) ? value : String(lockerId);
};

/**
 * 보관함 상세의 경로. 로케일 접두사는 붙이지 않는다.
 *
 * 슬러그는 검증을 통과한 모양이라도 인코딩해서 붙인다. 검증이 나중에 느슨해져도
 * 경로가 새어 나가지 않게 하는 쪽이 싸다.
 */
export const createLockerPath = (slug: string): string =>
  `${LOCKER_ROUTE_BASE}/${encodeURIComponent(slug)}`;

const withInternalSearch = (url: URL, search: Record<string, unknown>) => {
  const next = new URL(url.href);
  next.pathname = "/";
  next.search = stringifySearchParams(search);
  return next;
};

const decodePathSegment = (segment: string): string | null => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
};

/**
 * 공개 주소를 라우터가 다루는 주소로 바꾼다. 지도 화면 경로가 아니면 그대로 돌려준다.
 *
 * 로케일 접두사를 걷어 낸 뒤의 주소를 받는다.
 *
 * 경로가 쿼리보다 앞선다. `/lockers/164?locker=999` 처럼 둘이 어긋나면 주소창에
 * 보이는 경로가 사용자가 연 화면이다.
 */
export const toInternalMapUrl = (url: URL): URL => {
  const lockerMatch = url.pathname.match(LOCKER_PATH_PATTERN);
  if (lockerMatch) {
    const slug = decodePathSegment(lockerMatch[1]);
    // 상세로 인정하지 않는 값은 옮기지 않는다. 그대로 두면 없는 경로로 404 가 된다.
    if (slug === null || parseLockerSearchParam(slug) === undefined) return url;

    return withInternalSearch(url, {
      ...parseSearchString(url.search),
      locker: slug,
    });
  }

  const placeMatch = url.pathname.match(PLACE_PATH_PATTERN);
  if (placeMatch) {
    const placeId = readSearchPlaceIdParam(decodePathSegment(placeMatch[1]));
    if (placeId === undefined) return url;

    /*
     * 경로가 화면을 정한다. 상세를 가리키는 값(`locker`, 앱 안 딥링크의
     * `openLockerId`)이 쿼리에 남으면 장소 목록 주소가 상세를 연다.
     */
    const {
      locker: _locker,
      openLockerId: _openLockerId,
      ...rest
    } = parseSearchString(url.search);
    return withInternalSearch(url, { ...rest, place: placeId });
  }

  if (SEARCH_PATH_PATTERN.test(url.pathname)) {
    const {
      locker: _locker,
      place: _place,
      openLockerId: _openLockerId,
      ...rest
    } = parseSearchString(url.search);
    return withInternalSearch(url, rest);
  }

  if (url.pathname === "/") {
    /*
     * 장소 목록이 경로를 갖기 전에는 `?searchPlaceId=` 로 나타냈다. 그 주소로 들어와도
     * 같은 화면이 뜨도록 새 이름으로 옮긴다. 나갈 때 `/places/…` 로 정리된다.
     */
    const { searchPlaceId, ...rest } = parseSearchString(url.search);
    const legacyPlaceId = readSearchPlaceIdParam(searchPlaceId);
    if (legacyPlaceId !== undefined && rest.place === undefined) {
      return withInternalSearch(url, { ...rest, place: legacyPlaceId });
    }
  }

  return url;
};

/**
 * 라우터가 다루는 주소를 공개 주소로 바꾼다. 홈에 붙은 화면 값이 없으면 그대로
 * 돌려준다.
 *
 * 로케일 접두사를 붙이기 전의 주소를 받는다.
 */
export const toPublicMapUrl = (url: URL): URL => {
  if (url.pathname !== "/") return url;

  const search = parseSearchString(url.search);
  const next = new URL(url.href);

  const slug = toLockerPathSlug(search.locker);
  if (slug !== null) {
    const { locker: _locker, ...rest } = search;
    next.pathname = createLockerPath(slug);
    next.search = stringifySearchParams(rest);
    return next;
  }

  const placeId = readSearchPlaceIdParam(search.place);
  if (placeId !== undefined) {
    const { place: _place, locker: _locker, ...rest } = search;
    next.pathname = `${PLACE_ROUTE_BASE}/${placeId}`;
    next.search = stringifySearchParams(rest);
    return next;
  }

  if (search.q !== undefined) {
    const { place: _place, locker: _locker, ...rest } = search;
    next.pathname = SEARCH_ROUTE_PATH;
    next.search = stringifySearchParams(rest);
    return next;
  }

  return url;
};
