import { getValidatedSearchQuery } from "../lib/sanitize-search-query";

export type SearchUrlParams = Record<string, unknown>;

export const readSearchQueryParam = (raw: unknown): string | undefined => {
  if (typeof raw !== "string") {
    return undefined;
  }

  return getValidatedSearchQuery(raw) ?? undefined;
};

export const readSearchPlaceIdParam = (raw: unknown): number | undefined => {
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw.trim())
        : Number.NaN;

  return Number.isInteger(value) && value > 0 ? value : undefined;
};

/**
 * `locker` 파라미터가 가리키는 보관함 id. 상세로 인정하지 않는 값이면 undefined.
 *
 * 슬러그는 `164-강남역-4번-출구` 처럼 id 뒤에 이름이 붙는다. 이름은 장식이라 모양을
 * 따지지 않고, id 만 본다.
 *
 * 홈 라우트와 구 주소 리다이렉트 규칙(`shared/lib/legacy-locker-url`)이 같은 판정을
 * 써야 한다. 갈라지면 오늘 열리는 주소가 전환 뒤 조용히 홈으로 떨어진다.
 */
export const parseLockerSearchParam = (raw: unknown): number | undefined => {
  if (raw === undefined || raw === null) return undefined;

  const value = String(raw).trim();
  if (!/^\d+(?:-.*)?$/.test(value)) return undefined;

  const parsed = Number.parseInt(value, 10);
  // 안전한 정수를 넘으면 `String(parsed)` 가 `1e+21` 처럼 바뀌어, 그 값으로 만든 상세
  // 주소를 이 파서가 다시 받지 못한다. 보관함 id 는 그 범위를 넘지 않는다.
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export const withSearchQueryParam = (
  params: SearchUrlParams,
  query: string | null | undefined,
): SearchUrlParams => {
  const next = { ...params };
  const validatedQuery =
    typeof query === "string" ? getValidatedSearchQuery(query) : null;

  if (validatedQuery) {
    next.q = validatedQuery;
    return next;
  }

  delete next.q;
  return next;
};

/**
 * 장소 목록을 가리키는 `place` 를 붙이거나 뗀다. 바깥 주소로는 `/places/<id>` 다.
 *
 * 검색에서 연 목록이든 지도에서 연 목록이든 같은 값이다. 둘은 검색어(`q`)가 함께
 * 있는지로 갈린다(`map-screen`).
 */
export const withPlaceParam = (
  params: SearchUrlParams,
  placeId: number | null | undefined,
): SearchUrlParams => {
  const next = { ...params };

  if (typeof placeId === "number" && Number.isInteger(placeId) && placeId > 0) {
    next.place = placeId;
    return next;
  }

  delete next.place;
  return next;
};

export const withoutSearchContextParams = (
  params: SearchUrlParams,
): SearchUrlParams => {
  const next = { ...params };

  delete next.q;
  delete next.place;

  return next;
};

/**
 * 상세를 열 때 붙는 파라미터를 모두 뗀다.
 *
 * 상세를 닫는 길이 여럿(검색 뒤로가기, 지도 뒤로가기, 딥링크 처리 실패)이라, 목록을
 * 각자 적어 두면 한 곳만 고쳐져 닫은 화면을 새로고침했을 때 상세가 되살아난다.
 */
export const withoutLockerDetailParams = (
  params: SearchUrlParams,
): SearchUrlParams => {
  const next = { ...params };

  delete next.locker;
  delete next.openLockerId;
  delete next.detailSnap;
  delete next.focusLat;
  delete next.focusLng;

  return next;
};

export const withLockerDetailParam = (
  params: SearchUrlParams,
  lockerSlug: string,
): SearchUrlParams => ({
  ...params,
  locker: lockerSlug,
});
