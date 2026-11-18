import {
  parseLockerSearchParam,
  readSearchPlaceIdParam,
} from "#/features/search/model/search-url-state";

/**
 * 지도 위 화면의 라우트와 화면 값 사이를 오가는 규칙.
 *
 * | 라우트               | 화면 값                    |
 * |----------------------|----------------------------|
 * | `/`                  | `{}`                       |
 * | `/search?q=강남`     | `{ q: "강남" }`            |
 * | `/places/9?q=강남`   | `{ place: 9, q: "강남" }`  |
 * | `/lockers/164?q=강남`| `{ locker: "164", q: "강남" }` |
 *
 * 경로는 "무엇을 보고 있나" 하나만 나타낸다. 상세 > 장소 > 검색 순으로 가장 깊은
 * 것이 경로가 되고, 나머지(검색어, 상세 아래 깔린 장소)는 쿼리로 남는다. 화면을
 * 정하는 규칙은 `features/search/model/map-screen` 에 있다.
 *
 * 화면 코드는 경로를 모른다. 화면 값(`q`·`place`·`locker`)이라는 한 가지 모양으로
 * 읽고 쓰고, 실제 라우트와의 변환은 여기 두 함수가 한다. 그래서 라우트 구성이 바뀌어도
 * 화면 코드는 그대로다.
 */

/*
 * 고정 부분은 대소문자를 가리지 않는다. 라우터가 기본으로 대소문자를 가리지 않아
 * `/PLACES/9` 도 장소 라우트에 닿는데, 여기서만 가리면 그 주소에서 홈을 그린다.
 * 슬러그는 붙잡은 그대로 두므로 대소문자가 보존된다.
 */
const LOCKER_PATH_PATTERN = /^\/lockers\/([^/]+)\/?$/i;
const PLACE_PATH_PATTERN = /^\/places\/([^/]+)\/?$/i;
const SEARCH_PATH_PATTERN = /^\/search\/?$/i;

/**
 * 경로에 실을 상세 값. 보관함 id 만 남긴다.
 *
 * 주소는 보관함을 가리키기만 하면 된다. 이름을 붙이면 이름이 바뀔 때 주소가 바뀌고,
 * 한글은 복사하면 인코딩되어 읽히지도 않는다. 링크 미리보기는 상세의 메타 태그가
 * 맡는다. 예전에 퍼진 `/lockers/164-강남역-…` 은 라우트가 `/lockers/164` 로 옮긴다.
 *
 * 상세로 인정하지 않는 값이면 null 이다.
 */
export const toLockerPathSlug = (raw: unknown): string | null => {
  const lockerId = parseLockerSearchParam(raw);
  return lockerId === undefined ? null : String(lockerId);
};

/**
 * 보관함 상세의 경로. 로케일 접두사는 붙이지 않는다.
 *
 * 슬러그는 검증을 통과한 모양이라도 인코딩해서 붙인다. 검증이 나중에 느슨해져도
 * 경로가 새어 나가지 않게 하는 쪽이 싸다.
 */
export const createLockerPath = (slug: string): string =>
  `/lockers/${encodeURIComponent(slug)}`;

const decodePathSegment = (segment: string): string | null => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
};

const omit = (search: Record<string, unknown>, keys: readonly string[]) => {
  const next = { ...search };
  for (const key of keys) delete next[key];
  return next;
};

/**
 * 위치(로케일을 걷어 낸 경로와 쿼리)가 가리키는 화면 값.
 *
 * 경로가 쿼리보다 앞선다. `/lockers/164?locker=999` 나 `/places/9?openLockerId=164`
 * 처럼 경로와 어긋나는 값이 쿼리에 있으면 버린다. 주소창에 보이는 경로가 사용자가 연
 * 화면이다.
 */
export const readMapScreenSearch = ({
  pathname,
  search,
}: {
  pathname: string;
  search: Record<string, unknown>;
}): Record<string, unknown> => {
  const lockerMatch = pathname.match(LOCKER_PATH_PATTERN);
  if (lockerMatch) {
    const slug = decodePathSegment(lockerMatch[1]);
    const rest = omit(search, ["locker", "openLockerId"]);
    return slug !== null && parseLockerSearchParam(slug) !== undefined
      ? { ...rest, locker: slug }
      : rest;
  }

  const placeMatch = pathname.match(PLACE_PATH_PATTERN);
  if (placeMatch) {
    const placeId = readSearchPlaceIdParam(decodePathSegment(placeMatch[1]));
    const rest = omit(search, ["locker", "openLockerId", "place"]);
    return placeId !== undefined ? { ...rest, place: placeId } : rest;
  }

  if (SEARCH_PATH_PATTERN.test(pathname)) {
    return omit(search, ["locker", "openLockerId", "place"]);
  }

  if (pathname === "/" || pathname === "") {
    /*
     * 장소 목록이 경로를 갖기 전에는 `?searchPlaceId=` 로 나타냈다. 그 주소로 들어와도
     * 같은 화면을 가리키도록 새 이름으로 읽는다. 홈 라우트가 장소 경로로 옮긴다.
     */
    const { searchPlaceId, ...rest } = search;
    const legacyPlaceId = readSearchPlaceIdParam(searchPlaceId);
    if (legacyPlaceId !== undefined && rest.place === undefined) {
      return { ...rest, place: legacyPlaceId };
    }
  }

  return search;
};

export type MapScreenRoute =
  | { to: "/"; params: Record<string, never>; search: Record<string, unknown> }
  | {
      to: "/search";
      params: Record<string, never>;
      search: Record<string, unknown>;
    }
  | {
      to: "/places/$placeId";
      params: { placeId: string };
      search: Record<string, unknown>;
    }
  | {
      to: "/lockers/$slug";
      params: { slug: string };
      search: Record<string, unknown>;
    };

/**
 * 화면 값이 사는 라우트. `readMapScreenSearch` 의 반대다.
 *
 * 상세 > 장소 > 검색 순으로 가장 깊은 것을 경로로 옮기고, 나머지는 쿼리로 남긴다.
 */
export const toMapScreenRoute = (
  search: Record<string, unknown>,
): MapScreenRoute => {
  const slug = toLockerPathSlug(search.locker);
  if (slug !== null) {
    return {
      to: "/lockers/$slug",
      params: { slug },
      search: omit(search, ["locker"]),
    };
  }

  const placeId = readSearchPlaceIdParam(search.place);
  if (placeId !== undefined) {
    return {
      to: "/places/$placeId",
      params: { placeId: String(placeId) },
      search: omit(search, ["locker", "place"]),
    };
  }

  if (search.q !== undefined) {
    return {
      to: "/search",
      params: {},
      search: omit(search, ["locker", "place"]),
    };
  }

  return { to: "/", params: {}, search: omit(search, ["locker", "place"]) };
};

/** 라우트의 경로 문자열. 로케일 접두사는 붙이지 않는다. */
export const toMapScreenPathname = (route: MapScreenRoute): string => {
  switch (route.to) {
    case "/lockers/$slug":
      return createLockerPath(route.params.slug);
    case "/places/$placeId":
      return `/places/${route.params.placeId}`;
    default:
      return route.to;
  }
};
