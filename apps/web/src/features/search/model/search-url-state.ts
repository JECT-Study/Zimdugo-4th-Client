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

export const withSearchPlaceIdParam = (
  params: SearchUrlParams,
  placeId: number | null | undefined,
): SearchUrlParams => {
  const next = { ...params };

  if (typeof placeId === "number" && Number.isInteger(placeId) && placeId > 0) {
    next.searchPlaceId = placeId;
    return next;
  }

  delete next.searchPlaceId;
  return next;
};

export const withoutSearchContextParams = (
  params: SearchUrlParams,
): SearchUrlParams => {
  const next = { ...params };

  delete next.q;
  delete next.searchPlaceId;

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
